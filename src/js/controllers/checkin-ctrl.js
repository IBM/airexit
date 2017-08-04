angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService','$timeout','growl',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService, $timeout, growl) {
    
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

    ApiService.getPassengers().then(function(response) {
        console.log('Passengers: ' , response);
        if (response.status == 'SUCCESS') {
            response.message.manifest.forEach(function(item) {
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
        try {
            localStorage.setItem('travellerSelected', JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]));
        } catch (e) {
            growl.error('LocalStorage is full, please clean LocalStorage and try again');
        }
        ApiService.submit(
            'checkin',
            'airline',
            $scope.travellersById[$scope.selectedTraveller.id],
            $scope.picture.picturebase64,
            $scope.location
        ).then(function(response) {
            $scope.blockchaindata = response;
            $scope.dataready = true;
            $scope.loading.value = false;
            var session = {
                checkin: $scope.blockchaindata,
                security: null,
                gatecheck: null,
                user: $scope.travellersById[$scope.selectedTraveller.id].passportInfo,
                pictures: {
                    checkin: $scope.picture.picturebase64
                }
            }
            var sessionId = '';
            ApiService.addSession(session).then(function(response) {
                // growl.success('Session saved');
                sessionId = response._id;
                $scope.submitted = true;
                $scope.showData = true;
                try {
                    localStorage.setItem('currentSession', sessionId);
                } catch (e) {
                    growl.error('LocalStorage is full, please clean LocalStorage and try again');
                }
            }, function() {
                growl.error('Error adding session');
            });
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };
    
}
