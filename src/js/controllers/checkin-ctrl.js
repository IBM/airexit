angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService) {
    
    $scope.selectedTraveller = null;
    localStorage.setItem('travellerSelected', null);
    $scope.travellers = [];
    $scope.travellersById = {};

    $scope.picture = {
        picturebase64: '' 
    };

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
        localStorage.setItem('travellerSelected', JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]));
        ApiService.submit('checkin', 'airline', $scope.travellersById[$scope.selectedTraveller.id], $scope.picture.picturebase64).then(function(response) {
            $scope.blockchaindata = response.data;
            var sessions = JSON.parse(localStorage.getItem('sessions'));
            if (!sessions) {
                sessions = {};
            }
            var session = {
                id: $scope.blockchaindata.cbp.txid,
                checkin: $scope.blockchaindata,
                security: null,
                gatecheck: null,
                user: $scope.travellersById[$scope.selectedTraveller.id].passportInfo
            }
            sessions[$scope.blockchaindata.cbp.txid] = session;
            localStorage.setItem('currentSession', $scope.blockchaindata.cbp.txid);
            localStorage.setItem('sessions', JSON.stringify(sessions));
            $scope.dataready = true;
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };
    
}
