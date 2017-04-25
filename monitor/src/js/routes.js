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

        var tokenCheckResolver = ['ApiService','$cookies',function(ApiService, $cookies) {
          return ApiService.checkToken($cookies.get('token'));
        }];

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl',
                authenticate: true,
                resolve: {
                  token: tokenCheckResolver
                }
            })
            .state('login', {
                url: '/',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl',
                authenticate: false
            })
            .state('users', {
                url: '/users',
                templateUrl: 'templates/users.html',
                controller: 'UsersCtrl',
                authenticate: true,
                admin: true,
                resolve: {
                  token: tokenCheckResolver
                }
            })
            .state('newuser', {
                url: '/newuser',
                templateUrl: 'templates/userform.html',
                controller: 'UserFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'NEW';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            .state('edituser', {
                url: '/users/:id/edit',
                templateUrl: 'templates/userform.html',
                controller: 'UserFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'EDIT';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            .state('viewuser', {
                url: '/users/:id',
                templateUrl: 'templates/userform.html',
                controller: 'UserFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'VIEW';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            .state('squads', {
                url: '/squads',
                templateUrl: 'templates/squads.html',
                controller: 'SquadsCtrl',
                authenticate: true,
                resolve: {
                  token: tokenCheckResolver
                }
            })
            .state('squad', {
                url: '/squads/:name',
                templateUrl: 'templates/squadform.html',
                controller: 'SquadFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'VIEW';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true
            })
            .state('editsquad', {
                url: '/squads/:name/edit',
                templateUrl: 'templates/squadform.html',
                controller: 'SquadFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'EDIT';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            .state('newsquad', {
                url: '/newsquad',
                templateUrl: 'templates/squadform.html',
                controller: 'SquadFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'NEW';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            //------------
            .state('newsquadchart', {
                url: '/squads/:name/newchart',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'NEW';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return false;
                    }
                },
                authenticate: true,
                admin: true
            })
            .state('editsquadchart', {
                url: '/squads/:name/charts/:id/edit',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'EDIT';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return false;
                    } 
                },
                authenticate: true,
                admin: true
            })
            .state('viewsquadchart', {
                url: '/squads/:name/charts/:id',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'VIEW';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return false;
                    }
                },
                authenticate: true,
                admin: true
            })
            .state('newchart', {
                url: '/newchart',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'NEW';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return true;
                    }
                },
                authenticate: true,
                admin: true
            })
            .state('editchart', {
                url: '/charts/:id/edit',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'EDIT';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return true;
                    }
                },
                authenticate: true,
                admin: true
            })
            .state('viewchart', {
                url: '/charts/:id',
                templateUrl: 'templates/chartform.html',
                controller: 'ChartFormCtrl',
                resolve: {
                    viewMode: function(){
                        return 'VIEW';
                    },
                    token: tokenCheckResolver,
                    showSquadSelector: function(){
                        return true;
                    }
                },
                authenticate: true,
                admin: true
            })
            .state('charts', {
                url: '/charts',
                templateUrl: 'templates/charts.html',
                controller: 'ChartsCtrl',
                authenticate: true,
                admin: true,
                resolve: {
                  token: tokenCheckResolver
                }
            })
            //------------
            .state('reports', {
                url: '/reports',
                templateUrl: 'templates/reports.html',
                controller: 'ReportsCtrl',
                authenticate: true,
                resolve: {
                  token: tokenCheckResolver
                }
            })
            .state('report', {
                url: '/reports/:id',
                templateUrl: 'templates/reportform.html',
                controller: 'ReportFormCtrl',
                resolve: {
                    viewMode: function(){
                        return  'VIEW';
                    },
                    token: tokenCheckResolver
                }
            })
            .state('editreport', {
                url: '/reports/:id/edit',
                templateUrl: 'templates/reportform.html',
                controller: 'ReportFormCtrl',
                resolve: {
                    viewMode: function(){
                        return  'EDIT';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            })
            .state('newreport', {
                url: '/newreport',
                templateUrl: 'templates/reportform.html',
                controller: 'ReportFormCtrl',
                resolve: {
                    viewMode: function(){
                        return  'NEW';
                    },
                    token: tokenCheckResolver
                },
                authenticate: true,
                admin: true
            });

    }
]);
