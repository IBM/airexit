angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService','$timeout','growl',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService, $timeout, growl) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.location = 'TSA-G01';

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
            'screen',
            'tsa',
            $scope.selectedTraveller,
            $scope.picture.picturebase64,
            $scope.location
        ).then(function(response) {
            $scope.blockchaindata = response.data;
            $scope.dataready = true;
            $scope.loading.value = false;
            var sessions = JSON.parse(localStorage.getItem('sessions'));
            if (sessions[localStorage.getItem('currentSession')]) {
                sessions[localStorage.getItem('currentSession')].security = $scope.blockchaindata;
                sessions[localStorage.getItem('currentSession')].pictures.security = $scope.picture.picturebase64;
                try {
                    localStorage.setItem('sessions', JSON.stringify(sessions));
                } catch (e) {
                    growl.error('LocalStorage is full, please clean LocalStorage and try again');
                }
            }
            $scope.submitted = true;
            $scope.showData = true;
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('gatecheck');
    };

}

