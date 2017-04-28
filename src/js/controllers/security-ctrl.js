angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService) {

    var traveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if (traveller) $scope.selectedTraveller = traveller.name + ' ' + traveller.lastname;

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.onSubmit = function() {
        
    };

    $scope.onNext = function() {
        $state.transitionTo('gatecheck');
    };

}

