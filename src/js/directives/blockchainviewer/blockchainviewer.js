angular.module('app').directive('blockchainViewer', ['$timeout', blockchainViewer]);

function blockchainViewer($timeout) {

    var directive = {
        scope: {
            blockchaindata: '=',
            dataready: '='
        },
        controller: ['$scope', function($scope) {
          $scope.headerOffset = 90;
          $scope.dataHeader = 80;
          $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader - 20;

          window.onresize = function() {
              $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader -20;
              $scope.$apply();
          }

          $scope.$watch('cbpOptions', function(oldVal, newVal) {
            if (newVal) {
              $scope.selectedOption = 'cbp';
            }
          });
          $scope.$watch('airlineOptions', function(oldVal, newVal) {
            if (newVal) {
              $scope.selectedOption = 'airline';
            }
          });
          $scope.$watch('tsaOptions', function(oldVal, newVal) {
            if (newVal) {
              $scope.selectedOption = 'tsa';
            }
          });

          $scope.selectedOption = 'cbp';
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: '/js/directives/blockchainviewer/blockchainviewer.html',
        restrict: 'E'
    };
    return directive;
};
