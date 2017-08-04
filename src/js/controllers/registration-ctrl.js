angular
    .module('app')
    .controller('RegistrationCtrl', ['$scope','$state','ApiService','growl',RegistrationCtrl]);

function RegistrationCtrl($scope, $state, ApiService, growl) {
    $scope.loading = false;

    $scope.traveller = {
        passportInfo: {},
        reservationInfo: {},
        visaInfo: {}
    };

    $scope.accept = function() {
        console.log('Model: ', $scope.traveller);
        $scope.traveller.uuid = $scope.traveller.passportInfo.passportNumber;
        ApiService.registerTraveller($scope.traveller).then(function(response) {
            growl.success('Traveller registered succesfully');
            $state.transitionTo('index');  
        }, function(reason) {
            growl.error('Error: ' + reason.error);
        });
    };

    $scope.cancel = function() {
        $state.transitionTo('index');
    };
}
