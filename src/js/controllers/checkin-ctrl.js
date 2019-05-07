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
    $scope.retry = false;
    $scope.location = 'LAX-T-03';
    $scope.session = {}

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
    // $scope.$ = $;
    $scope.onSubmit = function() {
        var popup = angular.element("#proceedModal");
      // popup.modal('show');
        $scope.loading.value = true;
        try {
            console.log("setting traveller to localstorage")
            console.log(JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]))
            localStorage.setItem('travellerSelected', JSON.stringify($scope.travellersById[$scope.selectedTraveller.id]));
        } catch (e) {
            growl.error('LocalStorage is full, please clean LocalStorage and try again');
        }
        // console.log($scope.travellersById[$scope.selectedTraveller.id].reservationNumber)
        // $scope.showData = true;
        // $scope.showCheckin = true;
        ApiService.submit(
          'checkin',
          'airline',
          $scope.selectedTraveller.id, // $scope.travellersById[$scope.selectedTraveller.id],
          $scope.picture.picturebase64,
          $scope.location,
          "4568" // reservation id
        ).then(function(response) {
            // TODO, set image in localStorage
            // localStorage.setItem('sessionSelected', JSON.stringify($scope.session));
            localStorage.setItem("checkinpic", $scope.picture.picturebase64)
            console.log("face matches, proceed to next checkpoint")
            // TODO, TODO, maybe add time delay to show modal, render scope based off face rec response
            // $scope.session.pictures = {
            //   checkin: $scope.picture.picturebase64
            // }
            // $scope.checkinpic =

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
            $scope.showData = true;
            $scope.showCheckin = true;
            $scope.submitted = true;
            popup.modal('show')

            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                items: function () {
                  return $scope.items;
                }
              }
            });
            // $scope.dataready = true;
        }).catch( (err) => {
          console.log("face didn't match")
          console.log(err)
          $scope.failCheckIn = true;
          // $scope.submitted = true;
          $scope.retry = true;
          /*
          $scope.dataready = false;
          // $scope.showCheckin = false;
          $scope.showData = false;
          $scope.videoReady = true;
          $scope.submitted = false;
          */

        } ) ;
    };

    $scope.onNext = function() {
        $state.transitionTo('security');
    };

    $scope.reloadPage = function(){window.location.reload();}


}
