angular.module('app').directive('entitySelector', ['$timeout', entitySelector]);

/**
The entities are like this:
{
id: String,
name: String,
description: String
}

*/

function entitySelector($timeout) {

    var instances = {};

    var closeOthers = function(id) {
      for (var key in instances) {
        if (key != id) {
          var scope = instances[key];
          scope.expanded = false;
        }
      }
    }

    var directive = {
        scope: {
            entities: '=',
            selected: '=',
            required: '='
        },
        controller: ['$scope', function($scope) {
          $scope.expanded = false;
          $scope.search = {};
          $scope.search.value = '';
          $scope.toggleExpand = function() {
            $scope.expanded = !$scope.expanded;
            if ($scope.expanded) {
              $scope.focusSearchInput();
              closeOthers($scope.$id);
              $scope.resize();
            }
          }
          $scope.select = function(item) {
            if ($scope.selected && item.id === $scope.selected.id) {
              $scope.selected = null;
            }
            else {
              $scope.selected = item;
              $scope.expanded = false;
            }
          };

          $scope.focused = function() {
            $scope.expanded=true;
            $scope.focusSearchInput();
          };

          $scope.$on('$destroy', function() {
            delete instances[$scope.$id];
          })
        }],
        link: function(scope, element, attrs, tabsCtrl) {
          instances[scope.$id] = scope;

          scope.focusSearchInput = function() {
            $timeout(function(){
              scope.search.value = '';
              var searchElem = angular.element(element).children().children()[1].children[0].children[0];
              if (searchElem) {
                  searchElem.focus();
              }
            },0);
          };

          scope.resize = function() {
            $timeout(function(){
              var popup = angular.element(element).children().children()[1];
              var inputTag = angular.element(element).children()[0];
              popup.style.width = inputTag.clientWidth +'px';
            },0);
          };

          var windowResize = window.onresize;
          var inputTag = angular.element(element).children()[0];
          window.onresize = function() {
              if (scope.expanded) {
                var popup = angular.element(element).children().children()[1];
                popup.style.width = inputTag.clientWidth +'px';
              }
              if (windowResize) windowResize();
          };
        },
        template:
' <div class="form-control">'+
'	  <div class="row">'+
'  		<div class="col-md-12" ng-click="toggleExpand()">'+
'    		<div ng-if="!selected" class="pull-left">&nbsp;<span style="color:gray;">please select one...</span></div>'+
'    		<div ng-if="selected" class="pull-left">&nbsp;<span>{{selected.name}}</span></div>'+
'       <div ng-show="!expanded" class="pull-right"><i class="glyphicon glyphicon-chevron-down"></i></div>'+
'       <div ng-show="expanded" class="pull-right"><i class="glyphicon glyphicon-chevron-up"></i></div>'+
//'       <button class="pull-right" ng-focus="focused()" ng-blur="expanded=false;"></button>'+
'  		</div>'+
'	  </div>'+
' </div>'+
' <div ng-if="entities.length" ng-show="expanded" class="entity-selector-popup" style="width:{{popupWidth}}px;">'+
'   <div class="row">'+
'    	<div class="col-md-12" style="margin-bottom: 0px;border-bottom: 1px solid #eee">'+
'       <input type="text" ng-model="search.value" ng-keyup="$event.keyCode == 13 && select(filteredEntities[0])" placeholder="Search..." class="entity-selector-search-input">'+
'    	</div>'+
'  	</div>'+
'   <div class="" style="height:100px; overflow: auto;">'+
'     <div class="list-group" style="margin-bottom: 0px;">'+
'       <a ng-repeat="item in filteredEntities = (entities | filter:search.value)" class="list-group-item" ng-click="select(item)" ng-class="{active: item.id === selected.id}">'+
'         <div class="list-group-item-heading" style="margin: 0;">{{item.name}} <small style="color:darkgray;">{{item.description}}</small></div>'+
'       </a>'+
'     </div>  '+
'	  </div>'+
' </div>'+
' <div ng-if="!entities.length && expanded">'+
'   <div class="row">'+
'    	<div class="col-md-12">'+
'       The are no items'+
'    	</div>'+
'  	</div>'+
' </div>',
        restrict: 'E'
    };
    return directive;
};
