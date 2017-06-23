angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService','$timeout',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService, $timeout) {
    
    $scope.selectedTraveller = null;
    localStorage.setItem('travellerSelected', null);
    $scope.travellers = [];
    $scope.travellersById = {};
    $scope.loading = {
        value: false
    };
    $scope.submitted = false;

    $scope.location = 'MT-BAW-001';

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.containerWidth = '100%';
    $scope.selectorLeft = '25%';
    $scope.selectorWidth = '50%';
    $scope.blockchainDataOpacity = '0';

    ApiService.getPassengers().then(function(response) {
        console.log('Passengers: ' , response.data);
        if (response.data.status == 'SUCCESS') {
            response.data.message.manifest.forEach(function(item) {
                $scope.travellers.push({
                    id: item.uuid,
                    name: item.passportInfo.firstName + ' ' + item.passportInfo.lastName,
                    description: 'Passport number: ' + item.passportInfo.passportNumber 
                });
                $scope.travellersById[item.uuid] = item;
            });
        } else {
            $scope.error = 'Error getting passengers.'
        }
    });

    $scope.dataready = false;

    $scope.onSubmit = function() {
        $scope.loading.value = true;
        localStorage.setItem('travellerSelected', JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]));
        ApiService.submit(
            'checkin',
            'airline',
            $scope.travellersById[$scope.selectedTraveller.id],
            $scope.picture.picturebase64,
            $scope.location
        ).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
            $scope.loading.value = false;
            var sessions = JSON.parse(localStorage.getItem('sessions'));
            if (!sessions) {
                sessions = {};
            }
            var session = {
                id: $scope.blockchaindata.cbp.txid,
                checkin: $scope.blockchaindata,
                security: null,
                gatecheck: null,
                user: $scope.travellersById[$scope.selectedTraveller.id].passportInfo,
                pictures: {
                    checkin: $scope.picture.picturebase64
                }
            }
            sessions[$scope.blockchaindata.cbp.txid] = session;
            $scope.submitted = true;
            $scope.containerWidth = '50%';
            $scope.blockchainDataOpacity = '1';
            $scope.selectorLeft = '0px';
            $scope.selectorWidth = '100%';
            $timeout(function() {
                $scope.showData = true;
            }, 500);
            localStorage.setItem('currentSession', $scope.blockchaindata.cbp.txid);
            localStorage.setItem('sessions', JSON.stringify(sessions));
            });
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };
    
}
