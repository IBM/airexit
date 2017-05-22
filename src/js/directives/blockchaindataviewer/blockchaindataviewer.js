angular.module('app').directive('blockchainDataViewer', ['$timeout', blockchainDataViewer]);

function blockchainDataViewer($timeout) {

    var directive = {
        scope: {
            blockchaindata: '=',
            dataready: '=',
            selectedOption: '=',
            headerOffset: '=',
            picture: '='
        },
        controller: ['$scope', function($scope) {
          $scope.dataHeight = window.innerHeight - $scope.headerOffset;

          window.onresize = function() {
              $scope.dataHeight = window.innerHeight - $scope.headerOffset;
              $scope.$apply();
          }

        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: 'js/directives/blockchaindataviewer/blockchaindataviewer.html',
        restrict: 'E'
    };
    return directive;
};
