'use strict';

/**
 * Route configuration for the app module.
 */
angular.module('app').config(['$stateProvider', '$urlRouterProvider','growlProvider',
    function($stateProvider, $urlRouterProvider, growlProvider) {

        growlProvider.globalTimeToLive(5000);
        growlProvider.globalDisableCountDown(true);

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            })
            .state('checkin', {
                url: '/checkin',
                templateUrl: 'templates/checkin.html',
                controller: 'CheckinCtrl'
            })
            .state('security', {
                url: '/security',
                templateUrl: 'templates/security.html',
                controller: 'SecurityCtrl'
            })
            .state('gatecheck', {
                url: '/gatecheck',
                templateUrl: 'templates/gatecheck.html',
                controller: 'GateCheckCtrl'
            })
            .state('monitor', {
                url: '/monitor',
                templateUrl: 'templates/monitor.html',
                controller: 'MonitorCtrl'
            });
    }
]);
