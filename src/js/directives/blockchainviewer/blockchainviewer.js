angular.module('app').directive('blockchainViewer', ['$timeout', blockchainViewer]);

function blockchainViewer($timeout) {

    var directive = {
        scope: {
            blockchaindata: '='
        },
        controller: ['$scope', function($scope) {
          $scope.headerOffset = 90;
          $scope.dataHeader = 80;
          $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader - 20;

          window.onresize = function() {
              $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader -20;
              $scope.$apply();
          }
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: '/js/directives/blockchainviewer/blockchainviewer.html',
        restrict: 'E'
    };
    return directive;
};
