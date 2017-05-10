angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }
    $scope.picture = {
        picturebase64: '' 
    };

    $scope.onSubmit = function() {
        ApiService.submit('screen', 'tsa', $scope.selectedTraveller, $scope.picture.picturebase64).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
        });
    };

    $scope.onNext = function() {
        var sessions = JSON.parse(localStorage.getItem('sessions'));
        if (sessions[localStorage.getItem('currentSession')]) {
            sessions[localStorage.getItem('currentSession')].security = $scope.blockchaindata;
            sessions[localStorage.getItem('currentSession')].pictures.security = $scope.picture.picturebase64;
            localStorage.setItem('sessions', JSON.stringify(sessions));
        }
        $state.transitionTo('gatecheck');
    };

}

