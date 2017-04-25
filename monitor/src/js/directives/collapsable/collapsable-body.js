/**
 * Widget Body Directive
 */

angular
    .module('app')
    .directive('collapsableBody', collapsableBody);

function collapsableBody() {
    var directive = {
        requires: '^collapsable',
        scope: {
        },
        transclude: true,
        template: '<div id="{{id}}" class="panel-collapse collapse">'+
        '<div class="panel-body" ng-transclude></div>'+
        //'<div class="panel-footer">Panel Footer</div>'+
        '</div>',
        restrict: 'E',
        link: function link(scope, element, attrs, collapsableCtrl) {
            scope.id = scope.$parent.$parent.$parent.$index;
            //collapsableCtrl.setBody(scope);
        }
    };
    return directive;
};
