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

    $scope.dataready = false;

    $scope.onSubmit = function() {
        localStorage.setItem('travellerSelected', JSON.stringify($scope.selectedTraveller.originalObject));
        ApiService.submit('CheckIn', 'airline', {}).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };
    
}
