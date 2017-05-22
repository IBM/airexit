angular.module('app').directive('sharedDataViewer', [sharedDataViewer]);

function sharedDataViewer() {

    var directive = {
        scope: {
            shareddata: '=',
            picture: '='
        },
        controller: ['$scope', function($scope) {
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: '/js/directives/shareddataviewer/shareddataviewer.html',
        restrict: 'E'
    };
    return directive;
};
