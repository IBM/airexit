angular.module('app', ['ui.bootstrap', 'ui.router', 'ngCookies','ngAnimate','angular-growl','ngSanitize','angular-svg-round-progress','angular-loading-bar','angularMoment','jsonFormatter']);
angular.module("app").run(['$rootScope', '$state', 'ApiService', '$cookies', 'growl','$uibModalStack','amMoment', run]);

function run($rootScope, $state, ApiService, $cookies, growl, $uibModalStack, amMoment) {

  amMoment.changeLocale('en');

  var token = $cookies.get('token');

  if (token) {
    var user = $cookies.get('user') || null;
    ApiService.checkToken(token).then(function(response) {
      if (response == 'OK') {
        ApiService.setToken(token);
        var user = $cookies.get('user') || null;
        ApiService.user = JSON.parse(user);
        init();
      }
      if (response == 'UNREACHABLE') {
        growl.error('The server is down.');
        //init();
      }
      if (!response) {
        growl.error('Your session expired. Please login again.');
        ApiService.logout().then(function() {
          init();
          $state.transitionTo("login");
        });
      }
    }, init);
  }
  else {
    init();
  }

  ApiService.onUnauthorized(function() {
    $state.transitionTo("login");
    $uibModalStack.dismissAll();
  });

  function init() {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
      $rootScope.mainSubtitle = '';
      if (toState.authenticate && !ApiService.isAuthenticated()){
        // User isn’t authenticated
        ApiService.user = null;
        $state.transitionTo("login");
        $uibModalStack.dismissAll();
        event.preventDefault();
      }
      if (toState.authenticate && toState.admin && !ApiService.isAdmin()) {
        growl.error('You are not authorized to access this view.');
        event.preventDefault();
      }
    });
  }

}
