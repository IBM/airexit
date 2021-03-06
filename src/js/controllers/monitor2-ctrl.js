angular
    .module('app')
    .controller('Monitor2Ctrl', ['$scope','$state','ApiService','growl',Monitor2Ctrl]);

function Monitor2Ctrl($scope, $state, ApiService, growl) {

    $scope.sessions = [];
    $scope.sessionsById = {};
    $scope.selectedSession = null;
    $scope.session = null;
    $scope.dataready = false;
    $scope.headerOffset = 210;
    var load = function() {
        // ApiService.getSessions().then(function(sessions) {
        //     $scope.session = localStorage.getItem('sessionSelected') ? JSON.parse(localStorage.getItem('sessionSelected')) : null;
        //     if (sessions) {
        //         for (var key in sessions) {
        //             var item = sessions[key];
        //             var selectableItem = {
        //                 id: item._id,
        //                 name: item.user.firstName + ' ' + item.user.lastName,
        //                 description: 'Timestamp: ' + item.checkin.shared.timestamp
        //             };
        //             $scope.sessions.push(selectableItem);
        //
        //             if ($scope.session && item._id == $scope.session._id) {
        //                 $scope.selectedSession = selectableItem;
        //             }
        //             $scope.sessionsById[item.id] = item;
        //         }
        //     }
        // }, function(reason) {

        /*
        ApiService.getReservation().then ( (res) => {
          if (response.data) {

          }
        })
        */
        ApiService.getPassengers().then(function(response) {
            // TODO, uncomment below line
            // $scope.session = localStorage.getItem('sessionSelected') ? JSON.parse(localStorage.getItem('sessionSelected')) : null;

            var eventTypes = ["checkin", "security", "gate"]

            if (response.data) {
              JSON.parse(response.data).map((passenger) => {
                var events = passenger['Record'].reservation.Events
                console.log("events")
                console.log(events)
                var checkInEvents = events.filter(event => event.eventType == "checkin")
                var securityEvents = events.filter(event => event.eventType == "screen")

                var checkInImage = checkInEvents[checkInEvents.length - 1]['faceImage']
                // localStorage.setItem('sessionSelected', JSON.stringify($scope.session));
//
                var pass = Object.assign(passenger['Record'], {
                  name: passenger['Record'].firstName + " " + passenger['Record'].lastName,
                  id: passenger['Record'].passportNumber,
                  pictures: {
                    "checkin": localStorage.getItem("checkinpic"),
                    "screen": localStorage.getItem("screenpic"),
                    "gate": localStorage.getItem("gatepic")
                  },
                  checkin: (checkInEvents[checkInEvents.length - 1 ] || []),
                  "screen": (securityEvents[securityEvents.length - 1 ] || [])
                  // cbp: {
                  //   reservationInfo: {
                  //     reservationNumber: 2
                  //   }
                  // },
                  // tsa: {
                  //   tsaInfo: {
                  //     secureFlightStatus: true
                  //   }
                  // },
                  // checkin: {
                  //
                  // },

                })
                $scope.sessions.push(pass)
                // $scope.session.pictures['checkin'] = localStorage.getItem("checkinpic")
                if ($scope.session && passenger.passportNumber == $scope.session.id) {
                  $scope.selectedSession = pass;
                }
                $scope.sessionsById[pass.id] = pass;

              })
            }

            /*
            if (sessions) {
                for (var key in sessions) {
                    var item = sessions[key];
                    var selectableItem = {
                        id: item._id,
                        name: item.user.firstName + ' ' + item.user.lastName,
                        description: 'Timestamp: ' + item.checkin.shared.timestamp
                    };
                    $scope.sessions.push(selectableItem);

                    if ($scope.session && item._id == $scope.session._id) {
                        $scope.selectedSession = selectableItem;
                    }
                    $scope.sessionsById[item.id] = item;
                }
            }*/



        }, function(reason) {
            growl.error('Error getting Sessions');
        });
    }

    $scope.dataHeight = window.innerHeight - $scope.headerOffset;

    window.addEventListener("resize", function() {
        $scope.dataHeight = window.innerHeight - $scope.headerOffset;
        $scope.$apply();
    });

    $scope.$watch('selectedSession', function(ov, nv) {
        if (ov != nv && $scope.selectedSession) {
            $scope.session = $scope.sessionsById[$scope.selectedSession.id];
            // $scope.session.pictures['checkin'] = $scope.session.reservation.Events[1]['faceImage']
            localStorage.setItem('sessionSelected', JSON.stringify($scope.session));
            $scope.dataready = true;
        }
    });

    $scope.deleteSession = function(id) {
        ApiService.deleteSession(id).then(function() {
            load();
            $scope.selectedSession = null;
            localStorage.setItem('sessionSelected', null);
            $scope.session = null;
            $scope.dataready = false;
        }, function() {
            growl.error('Error deleting Session');
        });
    };

    $scope.refresh = function() {
        $scope.sessions.length = 0;
        load();
    };

    load();

    $scope.selectedOption = 'checkin';
}
