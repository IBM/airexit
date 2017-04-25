angular
    .module('app')
    .controller('ChartFormCtrl', ['$scope', '$rootScope', '$state','ApiService','viewMode','showSquadSelector','$stateParams','growl','$http', ChartFormCtrl]);

function ChartFormCtrl($scope, $rootScope, $state, ApiService, viewMode, showSquadSelector, $stateParams, growl, $http) {

    $scope.viewMode = viewMode;
    $scope.showSquadSelector = showSquadSelector;
    $scope.chart = {};
    $scope.errors = {};
    $scope.loading = {}
    $scope.loading.value = true;
    $scope.squadSelectEntities = [];
    $scope.transformFunction = '';

    var defaultTransformFunction = 'transformFunction = function(apiResponse) {//not change this line\n'+
                                   '  var chartData = [];\n'+
                                   '  // transform the data here\n'+
                                   '  \n'+
                                   '  return chartData;\n'+
                                   '};';
    var defaultOptions = 'options = {//not change this line\n'+
                         '  key: \'value\'\n'+
                         '};';;

    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.loggedUser = user;
    });

    function loadData() {
      if ($stateParams.id) {
        ApiService.getChart($stateParams.id).then(function(response) {
          if (response.data.error) {
            growl.error('Chart not found.');
            $scope.cancel();
          } else {
            $scope.chart._id = response.data._id;
            $scope.chart.name = response.data.name;
            $scope.chart.url = response.data.url;
            $scope.transformFunctionModel = response.data.transformFunction || defaultTransformFunction;
            $scope.optionsModel = response.data.options || defaultOptions;
            $scope.loading.value = false;
            if ($scope.showSquadSelector) {
                loadSquads(response.data.squad);
            }
            $scope.urlChanged();
          }
        }, function(error) {
            $scope.loading.value = false;
            growl.error('chart not found.');
            $scope.cancel();
        });
      }
      else {
        $scope.cancel();
      }
    }

    function loadSquads(selected) {
        $scope.loading.value = true;
        $scope.squadSelectEntities.length = 0;
        ApiService.getSquads().then(function(response) {
            response.data.forEach(function(squad) {
                $scope.squadSelectEntities.push({
                    id: squad._id,
                    name: squad.name,
                    description: squad.description,
                });
                if (selected && selected == squad.name) {
                    $scope.squadSelected = {
                        id: squad._id,
                        name: squad.name,
                        description: squad.description,
                    };
                }
            });
            $scope.loading.value = false;
        }, function() {
            $scope.errors.squads = 'Error getting squads';
            $scope.loading.value = false;
        });
    }

    function validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(str);
    }

    $scope.urlChanged = function() {
        if (validURL($scope.chart.url)) {
            $scope.apiError = '';
            $http.post('/request',{url: $scope.chart.url}).then(function(response){
                $scope.apiJSONResponse = response.data;
                $scope.transformFunctionChanged();
            }, function() {
                $scope.apiJSONResponse = null;
                $scope.apiError = 'Invalid request';
            });
        }
    };

    function evalInContext(js, context) {
        //# Return the results of the in-line anonymous function we .call with the passed context
        return function() { return eval(js); }.call(context);
    }

    $scope.transformFunctionChanged = function(e) {
        var context = {
            transformFunction: null
        };
        if (!$scope.apiJSONResponse || !$scope.transformFunctionModel) {
            return;
        }
        if ($scope.transformFunctionModel.indexOf('transformFunction = function(apiResponse) {') != 0) {
            console.log('Invalid function. Should be transformFunction = function(apiResponse) {};');
            $scope.transformFunctionError = 'Invalid function. Should be transformFunction = function(apiResponse) {};';
            $scope.chartData = null;
            return;
        }
        try {
            var code = 'this.' + $scope.transformFunctionModel;
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
        if (!$scope.optionsModel) {
            return;
        }
        if ($scope.optionsModel.indexOf('options = {') != 0) {
            console.log('Invalid sentence. Should be options = {};');
            $scope.optionsError = 'Invalid sentence. Should be options = {};';
            $scope.options = null;
            return;
        }
        try {
            var code = 'this.' + $scope.optionsModel;
            evalInContext(code, context);
            $scope.options = context.options;
            $scope.optionsError = null;
            console.log('Options: ', $scope.options);
        } catch (e) {
            $scope.optionsError = e.message;
            $scope.options = null;
            console.log(e.message);
        }
    };

    $scope.accept = function() {
        var chart = {
            _id: $scope.chart._id,
            name: $scope.chart.name,
            url: $scope.chart.url || '',
            options: $scope.optionsModel || '',
            squad: $scope.showSquadSelector ? $scope.squadSelected.name: $scope.squad.name,
            transformFunction: $scope.transformFunctionModel
        };
        if (viewMode === 'NEW') {
            ApiService.createChart(chart).then(function (response) {
                growl.success('Chart saved successfully.');
                $rootScope.$emit('chart-added');
                if ($scope.squad) {
                    $state.go('squad', { name: $scope.squad.name});    
                } else {
                    $state.go('charts');
                }
            }, function(error) {
                growl.error('Error saving chart.');
            });
        }
        if (viewMode === 'EDIT') {
            ApiService.updateChart(chart).then(function (response) {
                growl.success('Chart updated successfully.');
                $rootScope.$emit('chart-updated');
                if ($scope.squad) {
                    $state.go('squad', { name: $scope.squad.name});    
                } else {
                    $state.go('charts');
                }
            }, function(error) {
                growl.error('Error updating chart.');
            });
        }
    };

    $scope.cancel = function() {
        if ($scope.squad) {
            $state.go('squad', { name: $scope.squad.name});    
        } else {
            $state.go('charts');
        }
    };

    $scope.$watch('squadSelected', function(nv, ov) {
      if (nv !== ov) {
        $scope.errors.squad = null;
      }
    });

    function init() {
        if (viewMode === 'EDIT') {
            $scope.loading.value = true;
            $scope.$root.mainTitle = 'Edit chart';
            loadData();
        }

        if (viewMode === 'VIEW') {
            $scope.loading.value = true;
            $scope.$root.mainTitle = 'View chart';
            loadData();
        }

        if (viewMode === 'NEW') {
            $scope.$root.mainTitle = 'New chart';
            $scope.loading.value = false;
            if ($scope.showSquadSelector) {
                loadSquads();
            }
            $scope.transformFunctionModel = defaultTransformFunction;
            $scope.optionsModel = defaultOptions;
        }
    }

    if (!$scope.showSquadSelector) {
        if ($stateParams.name) {
            ApiService.getSquadByName($stateParams.name).then(function(response) {
                if (response.data.error) {
                    growl.error('Squad not found.');
                    $state.go('squads');
                } else {
                    $scope.squad = response.data[0];
                    init();
                }
            }, function(error) {
                $scope.loading.value.value = false;
                growl.error('Squad not found.');
                $state.go('squads');
            });
        } else {
            $state.go('squads');
        }
    } else {
        init();
    }
}
