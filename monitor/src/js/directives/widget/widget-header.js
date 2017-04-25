/**
 * Widget Header Directive
 */

angular
    .module('app')
    .directive('rdWidgetHeader', rdWidgetTitle);

function rdWidgetTitle() {
    var directive = {
        requires: '^rdWidget',
        transclude: true,
        template: '<div class="widget-header"><div class="row"><div class="pull-left col-xs-12"  style="margin-bottom: 0px;" ng-transclude></div></div></div>',
        restrict: 'E'
    };
    return directive;
};
