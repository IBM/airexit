/**
 * Master Controller
 */

angular.module('app')
    .controller('MasterCtrl', ['$scope', '$rootScope', '$cookieStore','ApiService','$state', '$http', 'growl','RealtimeNotifier', MasterCtrl]);

function MasterCtrl($scope, $rootScope, $cookieStore, ApiService, $state, $http, growl, RealtimeNotifier) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $rootScope.mainTitle = 'Main';

    $scope.state = $state;

    $scope.squads = [];
    $scope.loading = {value: true};

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            $scope.mobile = false;
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.mobile = true;
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() {
        $scope.$apply();
    };

    $scope.$watch(function() {
      return ApiService.user;
    }, function(user) {
      $scope.user = user;
      if ($scope.user) {
        $scope.imageSrc = 'http://images.tap.ibm.com:10000/image/' + $scope.user.email;
        loadData();
        joinRoom();
      }
      else {
        $scope.imageSrc = 'http://9.45.91.127:10000/image/blank/';
      }
    });

    $scope.logout = function() {
      ApiService.logout().then(function() {
          $state.transitionTo("login");
      });
    };

    $scope.openUpdatePasswordModal = function() {
      Modal.openChangePassword();
    };

    $scope.goTo = function(view, params) {
      $state.transitionTo(view, params);
    };

    var loadData = function() {
        $scope.squads.length = 0;
        $scope.loading.value = true;
        ApiService.getSquads().then(function(response) {
            response.data.forEach(function(squad) {
                $scope.squads.push(squad);
            });
            $scope.loading.value = false;
        }, function(error) {
		     	growl.error('Error getting squads from Server.');
        });
    };
    
    $rootScope.$on('squad-added', function() {
        loadData();
    });
    $rootScope.$on('squad-updated', function() {
        loadData();
    });
    $rootScope.$on('squad-deleted', function() {
        loadData();
    });

    var joinRoom = function() {
      room = RealtimeNotifier.joinRoom('squads', $scope.user._id);

      room.on('squad-added', function(notification) {
        ApiService.getUser(notification.whoId).then(function(response) {
          growl.success('Squad added by '+ response.data.name);
          loadData();
        });
      });

      room.on('squad-updated', function(notification) {
        ApiService.getUser(notification.whoId).then(function(response) {
          growl.success('Squad updated by '+ response.data.name);
          loadData();
        });
      });

      room.on('squad-deleted', function(notification) {
        ApiService.getUser(notification.whoId).then(function(response) {
          growl.success('Squad deleted by '+ response.data.name);
          loadData();
        });
      });

      $scope.$on('$destroy', function() {
        if ($scope.user && room) {
          room.leaveRoom('squads', $scope.user._id);
        }
      });

    }
}
