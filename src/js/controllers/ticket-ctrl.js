angular
    .module('app')
    .controller('TicketCtrl', ['$scope','$state','ApiService','growl', TicketCtrl]);

function TicketCtrl($scope, $state, ApiService, growl) {
    $scope.loading = false;

    // $scope.traveller = {
    // //     passportInfo: {},
    $scope.reservationInfo = {}
    // //     visaInfo: {}
    // };

    $scope.accept = function() {
        console.log('Creating reservation: ', $scope.reservationInfo);
        // $scope.traveller.uuid = $scope.traveller.passportInfo.passportNumber;
        ApiService.createReservation($scope.reservationInfo).then(function(response) {
            growl.success('Reservation created succesfully');
            $state.transitionTo('index');
        }, function(reason) {
            growl.error('Error: ' + reason.error);
        });
    };

    $scope.cancel = function() {
        $state.transitionTo('index');
    };
}
