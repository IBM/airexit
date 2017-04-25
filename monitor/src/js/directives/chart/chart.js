angular.module('app').directive('chart', ['$http',chart]);

function chart($http) {
    var directive = {
        scope: {
            data: '='
        },
        controller: ['$scope', function($scope) {
          $scope.chart = $scope.data;
          function validURL(str) {
              var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
              return pattern.test(str);
          }

          if (validURL($scope.chart.url)) {
              $scope.apiError = '';
              $http.post('/request',{url: $scope.chart.url}).then(function(response){
                  $scope.apiJSONResponse = response.data;
                  $scope.transformFunctionChanged();
                  $scope.optionsChanged();
              }, function() {
                  $scope.apiJSONResponse = null;
                  $scope.apiError = 'Invalid request';
              });
          }

          function evalInContext(js, context) {
              //# Return the results of the in-line anonymous function we .call with the passed context
              return function() { return eval(js); }.call(context);
          }

          $scope.transformFunctionChanged = function(e) {
              var context = {
                  transformFunction: null
              };
              if (!$scope.apiJSONResponse || !$scope.chart.transformFunction) {
                  return;
              }
              if ($scope.chart.transformFunction.indexOf('transformFunction = function(apiResponse) {') != 0) {
                  console.log('Invalid function. Should be transformFunction = function(apiResponse) {};');
                  $scope.transformFunctionError = 'Invalid function. Should be transformFunction = function(apiResponse) {};';
                  $scope.chartData = null;
                  return;
              }
              try {
                  var code = 'this.' + $scope.chart.transformFunction;
                  evalInContext(code, context);
                  $scope.chartData = context.transformFunction($scope.apiJSONResponse);
                  $scope.transformFunctionError = null;
                  console.log('Chart Data: ', $scope.chartData);
              } catch (e) {
                  $scope.transformFunctionError = e.message;
                  $scope.chartData = null;
                  console.log(e.message);
              }
          };

          $scope.optionsChanged = function(e) {
              var context = {
                  options: null
              };
              if (!$scope.chart.options) {
                  return;
              }
              if ($scope.chart.options.indexOf('options = {') != 0) {
                  console.log('Invalid sentence. Should be options = {};');
                  return;
              }
              try {
                  var code = 'this.' + $scope.chart.options;
                  evalInContext(code, context);
                  $scope.options = context.options;
                  $scope.transformFunctionError = null;
                  console.log('Options: ', $scope.options);
              } catch (e) {
                  $scope.transformFunctionError = e.message;
                  $scope.options = null;
                  console.log(e.message);
              }
          };
        }],
        template: '<nvd3 options="options" data="chartData"></nvd3>',
        restrict: 'E'
    };
    return directive;
};
