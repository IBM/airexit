angular
    .module('app')
    .controller('ChartsCtrl', ['$scope','$rootScope','$state','ApiService', 'growl', ChartsCtrl]);

function ChartsCtrl($scope, $rootScope, $state, ApiService, growl) {
    $scope.charts = [];

    $scope.$root.mainTitle = 'Charts';
    $scope.loading = {value: true};
    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    var loadData = function() {
        $scope.charts.length = 0;
        ApiService.getCharts().then(function(response) {
            response.data.forEach(function(chart) {
                console.log(chart);
                $scope.charts.push(chart);
            });
            $scope.loading.value = false;
        }, function(error) {
		     	growl.error('Error getting charts from Server.');
        });
    };

    $scope.edit = function(chart) {
        $state.go('editchart', {id: chart._id});
    };

    $scope.view = function(chart) {
        if ($scope.loggedUser.admin) {
            $state.go('editchart', {id: chart._id});
        }
        else {
            $state.go('viewchart', {id: chart._id});
        }
    };

    $scope.openConfirmModal = function(chart) {
      $scope.selectedChart = chart;
    };

    $scope.remove = function(chart) {
        ApiService.deleteChart(chart._id).then(function(response) {
            loadData();
            $rootScope.$emit('chart-deleted');
        }, function(error) {

        });
    };

    loadData();
}
