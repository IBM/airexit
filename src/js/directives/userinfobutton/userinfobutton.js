angular.module('app').directive('userInfoButton', [userInfoButton]);

function userInfoButton() {

    var directive = {
        scope: {
            user: '='
        },
        controller: ['$scope', function($scope) {
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: 'js/directives/userinfobutton/userinfobutton.html',
        restrict: 'E'
    };
    return directive;
};
