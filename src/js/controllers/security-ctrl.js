angular
    .module('app')
    .controller('SecurityCtrl', ['$scope','$state','ApiService','$timeout','growl',SecurityCtrl]);

function SecurityCtrl($scope, $state, ApiService, $timeout, growl) {

    $scope.selectedTraveller = JSON.parse(localStorage.getItem('travellerSelected'));
    if ($scope.selectedTraveller) {
        $scope.travellerName = $scope.selectedTraveller.passportInfo.firstName + ' ' + $scope.selectedTraveller.passportInfo.lastName;
    }

    $scope.location = 'TSA-G01';

    $scope.submitted = false;

    $scope.loading = {
        value: false
    };

    $scope.picture = {
        picturebase64: ''
    };

    $scope.travellers = [];
    $scope.travellersById = {};



    ApiService.getPassengers().then(function(response) {
        console.log('Passengers: ' , response);
        if (response.data) {
          JSON.parse(response.data).map((passenger) => {
            console.log("passenger")
            console.log(passenger)
            $scope.travellers.push(Object.assign(passenger['Record'], {
              name: passenger['Record'].firstName + " " + passenger['Record'].lastName,
              id: passenger['Record'].passportNumber
            }))
            $scope.travellersById[passenger['Record'].passportNumber] = Object.assign(passenger['Record'], {
              name: passenger['Record'].firstName + " " + passenger['Record'].lastName,
              id: passenger['Record'].passportNumber
            });

            $scope.blockchaindata.shared = {
              partnerId: passenger.reservation.id
              // reservation: passenger.reservation
            }
            console.log("$scope.travellers")
            console.log($scope.travellers)
          })
          // console.log($scope.travellers)
        // }
        // if (response.status == 'SUCCESS') {
        //     response.message.manifest.forEach(function(item) {
        //         $scope.travellers.push({
        //             id: item.uuid,
        //             name: item.passportInfo.firstName + ' ' + item.passportInfo.lastName,
        //             description: 'Passport number: ' + item.passportInfo.passportNumber
        //         });
        //         $scope.travellersById[item.uuid] = item;
        //     });
        } else {
            $scope.error = 'Error getting passengers.'
        }
    });


    $scope.onSubmit = function() {
        $scope.loading.value = true;
        ApiService.submit(
            'screen',
            'tsa',
            $scope.selectedTraveller,
            $scope.picture.picturebase64,
            $scope.location,
            "4568"
        ).then(function(response) {
            $scope.blockchaindata = response;
            $scope.dataready = true;
            $scope.loading.value = false;
            var session = {
                security: $scope.blockchaindata,
                pictures: {
                    security: $scope.picture.picturebase64
                }
            };
            ApiService.updateSession(localStorage.getItem('currentSession'), session).then(function(response) {
                $scope.submitted = true;
                $scope.showData = true;
            }, function() {
                growl.error('Error saving session');
            });
        });
    };

    $scope.onNext = function() {
        $state.transitionTo('gatecheck');
    };

}
