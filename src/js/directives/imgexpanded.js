angular
    .module('app')
    .directive('imgExpanded', ImgExpanded);

function ImgExpanded() {
    var directive = {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.css('opacity',0);
            element.on('load', function() {
                console.log('Element: ', element);
                var width = element.parent().width();
                element.width(width*2);
                element.parent().height(116);
                element.css('opacity',1);
            });
        }
    };
    return directive;
}
