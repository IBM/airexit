/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('app')
    .directive('field', field);

function field() {
    var directive = {
        restrict: 'E',
		scope: {
			name: '@',
            label: '@',
            required: '=?',
            type: '@',
            model: '=',
            form: '='
		},
        template: 
          '<div class="form-group row" style="font-size: 12px;margin: 5px;" ng-class="{ \'has-error\' : form[name].$invalid && form[name].$dirty}">'+
          '  <label class="col-xs-3" style="text-align: right; top: 7px;">{{label}}</label>'+
          '  <input ng-if="!required" type="{{type}}" class="col-xs-6 input-sm" name="{{name}}" ng-model="model[name]">'+
          '  <input ng-if="required" type="{{type}}" class="col-xs-6 input-sm" name="{{name}}" ng-model="model[name]" required>'+
          '  <p ng-if="required" class="help-block col-xs-3" ng-show="form[name].$invalid && form[name].$dirty">Field is required</p>'+
          '</div>'
    };
    return directive;
}
