angular
    .module('app')
    .controller('UserFormCtrl', ['$scope','$state','ApiService','viewMode','$stateParams','growl', UserFormCtrl]);

function UserFormCtrl($scope, $state, ApiService, viewMode, $stateParams, growl) {

    $scope.viewMode = viewMode;
    $scope.user = {};
    $scope.loading = false;

    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    function loadData() {
      if ($stateParams.id) {
        ApiService.getUser($stateParams.id).then(function(response) {
          if (response.data.error) {
            growl.error('User not found.');
            $state.go('users');
          }
          else {
            $scope.user._id = response.data._id;
            $scope.user.name = response.data.name;
            $scope.user.email = response.data.email;
            $scope.user.admin = response.data.admin;
            $scope.user.updated_at = response.data.updated_at;
            $scope.user.created_at = response.data.created_at;
            $scope.loading = false;
          }
        }, function(error) {
            $scope.loading = false;
            growl.error('User not found.');
            $state.go('users');
        });
      }
      else {
        $state.go('users');
      }
    }

    $scope.accept = function() {
        if (viewMode === 'NEW') {
            ApiService.createUser($scope.user).then(function (response) {
                growl.success('User saved successfully.');
                $state.go('users');
            }, function(error) {
               if (error.data.error && error.data.error.code === 11000) {
                 growl.error('There is a user with email '+ $scope.user.email);
               }
               else {
                growl.error('Error saving user.');
               }

            });
        }
        if (viewMode === 'EDIT') {
            ApiService.updateUser($scope.user).then(function (response) {
                growl.success('User updated successfully.');
                $state.go('users');
            }, function(error) {
                growl.error('Error updating user.');
            });
        }
    };

    $scope.cancel = function() {
        $state.go('users');
    };

    if (viewMode === 'EDIT') {
        $scope.loading = true;
        $scope.$root.mainTitle = 'Edit user';
        loadData();
    }

    if (viewMode === 'VIEW') {
        $scope.loading = true;
        $scope.$root.mainTitle = 'View user';
        $scope.showPassword = false;
        loadData();
    }

    if (viewMode === 'NEW') {
        $scope.$root.mainTitle = 'New user';
        $scope.showPassword = true;
        $scope.loading = false;
    }
}
