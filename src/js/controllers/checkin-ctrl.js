angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService) {
    
    $scope.selectedTraveller = {};
    localStorage.setItem('travellerSelected', null);
    $scope.travellers = [{
        name: 'User',
        lastname: 'One'
      },{
        name: 'User',
        lastname: 'Two'
    }];

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.onSubmit = function() {
        localStorage.setItem('travellerSelected', JSON.stringify($scope.selectedTraveller.originalObject));
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };
    
}
