angular
    .module('app')
    .controller('SquadFormCtrl', ['$scope', '$rootScope', '$state','ApiService','viewMode','$stateParams','growl', SquadFormCtrl]);

function SquadFormCtrl($scope, $rootScope, $state, ApiService, viewMode, $stateParams, growl) {

    $scope.viewMode = viewMode;
    $scope.squad = {};
    $scope.loading = false;
    $scope.showPassword = false;
    $scope.charts = [];

    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    function loadData() {
      if ($stateParams.name) {
        ApiService.getSquadByName($stateParams.name).then(function(response) {
          if (response.data.error) {
            growl.error('Squad not found.');
            $state.go('squads');
          }
          else {
            $scope.squad._id = response.data[0]._id;
            $scope.squad.name = response.data[0].name;
            $scope.squad.description = response.data[0].description;
            $scope.squad.updated_at = response.data[0].updated_at;
            $scope.squad.created_at = response.data[0].created_at;
            $scope.squad.created_by = response.data[0].created_by;
            $scope.squad.updated_by = response.data[0].updated_by;
            $scope.$root.mainTitle = $scope.squad.name;

            if ($scope.viewMode == 'VIEW') {
                ApiService.getCharts({squad: $scope.squad.name}).then(function(response) {
                    if (response.data.error) {
                        growl.error('Charts for squad not found.');
                        $scope.loading = false;
                    }
                    else {
                        $scope.charts.length = 0;
                        response.data.forEach(function(chart) {
                            $scope.charts.push(chart);
                        });
                        $scope.loading = false;
                    }
                    }, function(error) {
                        growl.error('Charts for squad not found.');
                        $scope.loading = false;
                    });
            } else {
                $scope.loading = false;
            }
          }
        }, function(error) {
            $scope.loading = false;
            growl.error('Squad not found.');
            $state.go('squads');
        });
      }
      else {
        $state.go('squads');
      }
    }

    $scope.accept = function() {
        if (viewMode === 'NEW') {
            ApiService.createSquad($scope.squad).then(function (response) {
                growl.success('Squad saved successfully.');
                $rootScope.$emit('squad-added');
                $state.go('squads');
            }, function(error) {
               if (error.data.error && error.data.error.code === 11000) {
                 growl.error('There is a squad with name '+ $scope.squad.name);
               }
               else {
                growl.error('Error saving squad.');
               }
            });
        }
        if (viewMode === 'EDIT') {
            ApiService.updateSquad($scope.squad).then(function (response) {
                growl.success('Squad updated successfully.');
                $rootScope.$emit('squad-updated');
                $state.go('squads');
            }, function(error) {
                growl.error('Error updating squad.');
            });
        }
    };

    $scope.cancel = function() {
        $state.go('squads');
    };

    $scope.goToNewChart = function() {
      var params = {
        name: $scope.squad.name,
      }
      $state.transitionTo('newsquadchart', params);
    };

    $scope.goToEditChart = function(chart) {
      var params = {
        id: chart._id,
        name: $scope.squad.name
      }
      $state.transitionTo('editsquadchart', params);
    }; 

    if (viewMode === 'EDIT') {
        $scope.loading = true;
        $scope.$root.mainTitle = 'Edit squad';
        loadData();
    }

    if (viewMode === 'VIEW') {
        $scope.loading = true;
        $scope.$root.mainTitle = 'View squad';
        loadData();
    }

    if (viewMode === 'NEW') {
        $scope.$root.mainTitle = 'New squad';
        $scope.loading = false;
    }
}
