angular
    .module('app')
    .controller('RegistrationCtrl', ['$scope','$state','ApiService','growl',RegistrationCtrl]);

function RegistrationCtrl($scope, $state, ApiService, growl) {
    $scope.loading = false;

    // $scope.traveller = {
    //     passportInfo: {},
    //     reservationInfo: {},
    //     visaInfo: {}
    // };

    $scope.passportInfo = {}

    $scope.passportInfo = {}
    $scope.picture = {
        picturebase64: ''
    };
    $scope.accept = function() {
        console.log('Model: ', $scope.passportInfo);
        // $scope.traveller.uuid = $scope.traveller.passportInfo.passportNumber;
        ApiService.registerTraveller($scope.passportInfo, $scope.picture.picturebase64).then(function(response) {
            console.log("registering traveller")
            console.log($scope.passportInfo)
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
