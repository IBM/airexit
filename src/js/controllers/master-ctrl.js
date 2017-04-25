/**
 * Master Controller
 */

angular.module('app')
    .controller('MasterCtrl', ['$scope', '$rootScope','ApiService','$state', MasterCtrl]);

function MasterCtrl($scope, $rootScope, ApiService, $state) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $rootScope.mainTitle = 'Main';

    $scope.state = $state;

    $scope.loading = {value: true};

    $scope.goTo = function(view, params) {
      $state.transitionTo(view, params);
    };
}
