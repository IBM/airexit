angular
    .module('app')
    .controller('GateCheckCtrl', ['$scope','$state','ApiService',GateCheckCtrl]);

function GateCheckCtrl($scope, $state, ApiService) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.onSubmit = function() {
        ApiService.submit('gate', 'airline', $scope.selectedTraveller, $scope.picture.picturebase64).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
            var sessions = JSON.parse(localStorage.getItem('sessions'));
            if (sessions[localStorage.getItem('currentSession')]) {
                sessions[localStorage.getItem('currentSession')].gatecheck = $scope.blockchaindata;
                localStorage.setItem('sessions', JSON.stringify(sessions));
            }
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('monitor');
    };

}


