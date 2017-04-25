angular
    .module('app')
    .controller('DashboardCtrl', ['$scope','$state','ApiService','growl', '$q', DashboardCtrl]);

function DashboardCtrl($scope, $state, ApiService, growl, $q) {
	  $scope.loading = {value: true};

    var loadData = function() {
        
    };

    loadData();

    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      if (!user) {
        return;
      }
      $scope.user = user;
      loadData();
    });

}
