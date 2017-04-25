/**
 * Widget Directive
 */

angular
    .module('app')
    .directive('collapsable', collapsable);

function collapsable() {
    var directive = {
        transclude: true,
        template: '<div class="panel panel-default" ng-transclude></div>',
        restrict: 'E',
        scope: {
          id: '='
        },
        controller: function($scope, $compile, $http) {
          var headerScope;
          var bodyScope;
          this.setHeader = function(_headerScope) {
            headerScope = _headerScope;
          };
          this.setBody = function(_bodyScope) {
            bodyScope = _bodyScope;
          };
        }
    };
    return directive;
};
