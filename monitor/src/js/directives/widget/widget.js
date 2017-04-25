/**
 * Widget Directive
 */

angular
    .module('app')
    .directive('rdWidget', rdWidget);

function rdWidget() {
    var directive = {
        transclude: true,
        replace: true,
        template: '<div class="widget" style="margin-bottom:10px;" ng-transclude></div>',
        restrict: 'EA'
    };
    return directive;

    function link(scope, element, attrs) {
        /* */
    }
};
