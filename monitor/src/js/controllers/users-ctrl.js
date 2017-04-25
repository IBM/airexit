angular
    .module('app')
    .controller('UsersCtrl', ['$scope','$state','ApiService', 'growl', UsersCtrl]);

function UsersCtrl($scope, $state, ApiService, growl) {
    $scope.users = [];

    $scope.$root.mainTitle = 'Users';
    $scope.loading = {value: true};
    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    var loadData = function() {
        $scope.users.length = 0;
        ApiService.getUsers().then(function(response) {
            response.data.forEach(function(user) {
                $scope.users.push(user);
            });
            $scope.loading.value = false;
        }, function(error) {
		     	growl.error('Error getting users from Server.');
        });
    };

    $scope.edit = function(user) {
        $state.go('edituser', {id: user._id});
    };

    $scope.view = function(user) {
        if ($scope.loggedUser.admin) {
            $state.go('edituser', {id: user._id});
        }
        else {
            $state.go('viewuser');
        }
    };

    $scope.openConfirmModal = function(user) {
      $scope.selectedUser = user;
    };

    $scope.remove = function(user) {
        ApiService.deleteUser(user._id).then(function(response) {
            loadData();
        }, function(error) {

        });
    };

    loadData();

}
