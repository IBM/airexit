angular
    .module('app')
    .controller('LoginCtrl', ['$scope','$state','ApiService','$uibModalStack',LoginCtrl]);

function LoginCtrl($scope, $state, ApiService, $uibModalStack) {
    $scope.model = {
      email: '',
      password: ''
    };
    $scope.loginError = false;
    $scope.title = 'Login';
    $scope.processing = false;

    SSOButton.renderButton();

    SSOButton.onLogin(function(response) {
      ApiService.ssoLogin(response.access_token).then(function (response) {
            
            $scope.hideLoggin = true;
            $state.go('index');
            
        }, function(error) {
            $scope.processing = false;
            $scope.loginError = true;
        });
    });

    SSOButton.onError(function(error) {
        if (error === 'NOTLOGGEDIN') {
            
        }
        if (error === 'LOGINFAILED') {
            $scope.loginError = true;
        }
        $scope.$apply();
    });
}
