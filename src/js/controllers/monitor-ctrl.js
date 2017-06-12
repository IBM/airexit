angular
    .module('app')
    .controller('MonitorCtrl', ['$scope','$state','ApiService',MonitorCtrl]);

function MonitorCtrl($scope, $state, ApiService) {
    
    $scope.sessions = [];
    $scope.sessionsById = {};
    $scope.selectedSession = null;
    $scope.session = null;
    $scope.dataready = false;
    $scope.headerOffset = 160;

    var sessions = JSON.parse(localStorage.getItem('sessions'));
    if (sessions) {
        for (var key in sessions) {
            var item = sessions[key];
            $scope.sessions.push({
                id: item.id,
                name: item.user.firstName + ' ' + item.user.lastName,
                description: 'Timestamp: ' + item.checkin.shared.timestamp 
            });
            $scope.sessionsById[item.id] = item;
        }
    }

    $scope.dataHeight = window.innerHeight - $scope.headerOffset;

    window.addEventListener("resize", function() {
        $scope.dataHeight = window.innerHeight - $scope.headerOffset;
        $scope.$apply();
    });

    $scope.$watch('selectedSession', function(ov, nv) {
        if (ov != nv && $scope.selectedSession) {
            $scope.session = $scope.sessionsById[$scope.selectedSession.id];
            $scope.dataready = true;
        }
    });

    $scope.deleteSession = function(id) {
        var sessions = JSON.parse(localStorage.getItem('sessions'));
        if (sessions) {
            delete $scope.sessionsById[id];
            var index = 0;
            for (var i = 0; i < $scope.sessions.length; i++) {
                if ($scope.sessions[i].id == id) {
                    index = i;
                    break;
                }
            }
            $scope.sessions.splice(index, 1);
            delete sessions[id];
            $scope.selectedSession = null;
            $scope.session = null;
            $scope.dataready = false;
            localStorage.setItem('sessions', JSON.stringify(sessions));
        }
    }

    $scope.selectedOption = 'checkin';
}
