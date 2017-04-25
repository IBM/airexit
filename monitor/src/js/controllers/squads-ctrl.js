angular
    .module('app')
    .controller('SquadsCtrl', ['$scope','$rootScope','$state','ApiService', 'growl', SquadsCtrl]);

function SquadsCtrl($scope, $rootScope, $state, ApiService, growl) {
    $scope.squads = [];

    $scope.$root.mainTitle = 'Squads';
    $scope.loading = {value: true};
    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    var loadData = function() {
        $scope.squads.length = 0;
        ApiService.getSquads().then(function(response) {
            response.data.forEach(function(squad) {
                $scope.squads.push(squad);
            });
            $scope.loading.value = false;
        }, function(error) {
		     	growl.error('Error getting squads from Server.');
        });
    };

    $scope.edit = function(squad) {
        $state.go('editsquad', {name: squad.name});
    };

    $scope.view = function(squad) {
        $state.go('squad', {name: squad.name});
    };

    $scope.openConfirmModal = function(squad) {
      $scope.selectedSquad = squad;
    };

    $scope.remove = function(squad) {
        ApiService.deleteSquad(squad._id).then(function(response) {
            loadData();
            $rootScope.$emit('squad-deleted');
        }, function(error) {

        });
    };

    loadData();
}
