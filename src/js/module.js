angular.module('app', [
  'ui.bootstrap', 'ui.router', 'ngCookies',
  'ngAnimate', 'angular-growl','ngSanitize',
  'angular-svg-round-progress','angular-loading-bar', 'angucomplete',
  'angularMoment','jsonFormatter','webcam']);
angular.module("app").run(['$rootScope','amMoment', run]);

function run($rootScope, amMoment) {

  amMoment.changeLocale('en');

}
