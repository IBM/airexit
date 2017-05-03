angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService) {
    
    $scope.selectedTraveller = {};
    localStorage.setItem('travellerSelected', null);
    $scope.travellers = [];

    $scope.picture = {
        picturebase64: '' 
    };

    ApiService.getPassengers().then(function(response) {
        console.log('Passengers: ' , response.data);
        if (response.data.status == 'SUCCESS') {
            response.data.message.manifest.forEach(function(item) {
                $scope.travellers.push(item);
            });
        } else {
            $scope.error = 'Error getting passengers.'
        }
    });

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
