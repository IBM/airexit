/**
 * Widget Header Directive
 */

angular
    .module('app')
    .directive('collapsableHeader', collapsableHeader);

function collapsableHeader() {
    var directive = {
        requires: '^collapsable',
        transclude: true,
        scope: {
          text: '='
        },
        template: '<div class="panel-heading"><div class="panel-title"><div class="pull-right" ng-transclude></div>'+
          '<h4 title="Click to expand" data-toggle="collapse" href="#{{id}}" style="cursor: pointer;" ng-bind-html="text"></h4>'+
        '</div></div>',
        restrict: 'E',
        link: function link(scope, element, attrs, collapsableCtrl) {
            scope.id = scope.id = scope.$parent.$parent.$parent.$index;
            //collapsableCtrl.setHeader(scope);

        }
    };
    return directive;
};
