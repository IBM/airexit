angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService','$timeout','growl',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService, $timeout, growl) {

    $scope.selectedTraveller = null;
    localStorage.setItem('travellerSelected', null);
    $scope.travellers = [];
    $scope.travellersById = {};
    $scope.loading = {
        value: false
    };
    $scope.submitted = false;

    $scope.location = 'MT-BAW-001';

    $scope.picture = {
        picturebase64: ''
    };

    ApiService.getPassengers().then(function(response) {
        console.log('Passengers: ' , response);
        console.log("$scope.sessions")
        console.log($scope.sessions)

        if (response.data) {
          JSON.parse(response.data).map((passenger) => {
            // console.log(passenger['Record'].firstName)
            // $scope.travellers.push({
            // id: passenger['Record'].passportNumber,
            // name: passenger['Record'].firstName + " " + passenger['Record'].lastName,
            // description: "passenger"
            // })

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

    $scope.dataready = false;

    $scope.onSubmit = function() {

        console.log($scope.selectedTraveller)
        console.log("selectedTraveller.id")
        console.log($scope.selectedTraveller.id)

        $scope.loading.value = true;
        try {
            localStorage.setItem('travellerSelected', JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]));
        } catch (e) {
            growl.error('LocalStorage is full, please clean LocalStorage and try again');
        }
        // console.log($scope.travellersById[$scope.selectedTraveller.id].reservationNumber)
        $scope.showData = true;
        ApiService.submit(
          'checkin',
          'airline',
          $scope.selectedTraveller.id, // $scope.travellersById[$scope.selectedTraveller.id],
          $scope.picture.picturebase64,
          $scope.location,
          "4568"
        ).then(function(response) {
            $scope.session.pictures = {
              checkin: $scope.picture.picturebase64
            }
            // upload base64 image to


            /*
            $scope.blockchaindata = response;
            $scope.dataready = true;
            $scope.loading.value = false;
            var session = {
                checkin: $scope.blockchaindata,
                security: null,
                gatecheck: null,
                user: $scope.travellersById[$scope.selectedTraveller.id].passportInfo,
                pictures: {
                    checkin: $scope.picture.picturebase64
                }
            }
            var sessionId = '';
            ApiService.addSession(session).then(function(response) {
                // growl.success('Session saved');
                sessionId = response._id;
                $scope.submitted = true;
                $scope.showData = true;
                try {
                    localStorage.setItem('currentSession', sessionId);
                } catch (e) {
                    growl.error('LocalStorage is full, please clean LocalStorage and try again');
                }
            }, function() {
                growl.error('Error adding session');
            });*/

        });
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };

}
