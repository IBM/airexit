angular.module('app').directive('blockchainViewer', ['$timeout', blockchainViewer]);

function blockchainViewer($timeout) {

    var directive = {
        scope: {
            blockchaindata: '=',
            dataready: '=',
            loading: '='
        },
        controller: ['$scope', function($scope) {
          $scope.headerOffset = 145;

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
        templateUrl: 'js/directives/blockchainviewer/blockchainviewer.html',
        restrict: 'E'
    };
    return directive;
};
