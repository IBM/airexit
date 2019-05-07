angular
    .module('app')
    .controller('GateCheckCtrl', ['$scope','$state','ApiService','$timeout','growl',GateCheckCtrl]);

function GateCheckCtrl($scope, $state, ApiService,$timeout, growl) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.location = 'T2-G31';

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
            'gate',
            'airline',
            $scope.selectedTraveller,
            $scope.picture.picturebase64,
            $scope.location
        ).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
            $scope.loading.value = false;
            var session = {
                gatecheck: $scope.blockchaindata,
                pictures: {
                    gatecheck: $scope.picture.picturebase64
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
        $state.transitionTo('checkin');
    };

}
