angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService','$timeout','growl',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService, $timeout, growl) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.location = 'TSA-G01';

    $scope.loading = {
        value: false
    };

    $scope.submitted = false;

    $scope.picture = {
        picturebase64: '' 
    };

    $scope.containerWidth = '100%';
    $scope.selectorLeft = '25%';
    $scope.selectorWidth = '50%';
    $scope.blockchainDataOpacity = '0';

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
            $scope.containerWidth = '50%';
            $scope.blockchainDataOpacity = '1';
            $scope.selectorLeft = '0px';
            $scope.selectorWidth = '100%';
            $timeout(function() {
                $scope.showData = true;
            }, 500);
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('gatecheck');
    };

}

