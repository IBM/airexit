angular
    .module('app')
    .controller('TravellersCtrl', ['$scope','$state','ApiService','growl',TravellersCtrl]);

function TravellersCtrl($scope, $state, ApiService, growl) {
    $scope.loading = {
        value: true
    };
    $scope.travellers = [];

    var loadData = function() {
        $scope.loading.value = true;
        $scope.travellers.length = 0;
        ApiService.getTravellers().then(function(response) {
          if (response.data) {
            // console.log(response.data)
            // response.data.forEach(function(item) {
            //     $scope.travellers.push(item);
            // });
            console.log("response received")
            JSON.parse(response.data).map ( (passenger) => {
              // console.log(passenger['Record'].firstName)
              $scope.travellers.push(
                Object.assign(passenger['Record'], {
                  name: passenger['Record'].firstName + passenger['Record'].lastName,
                  id: passenger['Record'].passportNumber
                })
              );
            })
            $scope.loading.value = false;
          }
        }, function() {
            growl.error('Error getting Traveller');
            $scope.loading.value = false;
        });
    };

    loadData();

    $scope.cancel = function() {
        $state.transitionTo('index');
    };

    $scope.openConfirmModal = function(item) {
      $scope.selectedItemForRemove = item;
    };

    $scope.remove = function(item) {
        if (!item) {
          return;
        }
        $scope.loading.value = true;
        ApiService.deleteTraveller(item._id).then(function(response) {
            $scope.loading.value = false;
            loadData();
            $('#confirmModal').modal('hide');
        }, function(error) {
            growl.error('Error deleting Traveller');
            $scope.loading.value = false;
            $('#confirmModal').modal('hide');
        });
    };
}
