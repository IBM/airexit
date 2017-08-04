angular.module('app').directive('userInfo', [userInfo]);

function userInfo() {

    var directive = {
        scope: {
            user: '='
        },
        controller: ['$scope', function($scope) {
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: 'js/directives/userinfo/userinfo.html',
        restrict: 'E'
    };
    return directive;
};
