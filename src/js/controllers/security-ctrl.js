angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService','$timeout','growl',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService, $timeout, growl) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.location = 'TSA-G01';

    $scope.submitted = false;
    
    $scope.loading = {
        value: false
    };

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.onSubmit = function() {
        $scope.loading.value = true;
        ApiService.submit(
            'screen',
            'tsa',
            $scope.selectedTraveller,
            $scope.picture.picturebase64,
            $scope.location
        ).then(function(response) {
            $scope.blockchaindata = response;
            $scope.dataready = true;
            $scope.loading.value = false;
            var session = {
                security: $scope.blockchaindata,
                pictures: {
                    security: $scope.picture.picturebase64
                }
            };
            ApiService.updateSession(localStorage.getItem('currentSession'), session).then(function(response) {
                $scope.submitted = true;
                $scope.showData = true;
            }, function() {
                growl.error('Error saving session');
            });
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('gatecheck');
    };

}

