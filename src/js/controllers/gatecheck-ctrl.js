angular
    .module('app')
    .controller('GateCheckCtrl', ['$scope','$state','ApiService',GateCheckCtrl]);

function GateCheckCtrl($scope, $state, ApiService) {

    var _video = null;
    $scope.status = 'RECORDING';
    $scope.headerOffset = 90;
    $scope.footerOffset = 50;
    $scope.dataHeader = 80;
    $scope.leftMargin = 15;

    $scope.selectedTraveller = localStorage.getItem('travellerSelected');

    $scope.videoHeight = window.innerHeight - $scope.headerOffset - $scope.footerOffset;
    $scope.videoWidth = window.innerWidth/2 - $scope.leftMargin;
    $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader - 20;
    if ($scope.videoHeight > $scope.videoWidth) {
        $scope.videoHeight = $scope.videoWidth;
    }
    $scope.channel = {
        videoHeight: $scope.videoHeight,
        videoWidth: $scope.videoWidth
    };
    $scope.focusBox = {
        x: $scope.videoWidth/4,
        y: $scope.videoHeight*0.125,
        w: $scope.videoWidth/2,
        h: $scope.videoHeight*0.75
    };

    window.onresize = function() {
        $scope.videoHeight = window.innerHeight - $scope.headerOffset - $scope.footerOffset;
        $scope.videoWidth = window.innerWidth/2 - $scope.leftMargin;
        if ($scope.videoHeight > $scope.videoWidth) {
            $scope.videoHeight = $scope.videoWidth;
        }
        $scope.channel.videoHeight = $scope.videoHeight;
        $scope.channel.videoWidth = $scope.videoWidth;
        
        $scope.focusBox.x = $scope.videoWidth/4;
        $scope.focusBox.y = $scope.videoHeight*0.125;
        $scope.focusBox.w = $scope.videoWidth/2;
        $scope.focusBox.h = $scope.videoHeight*0.75;

        $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader;

        $scope.$apply();
    }

    $scope.onSuccess = function () {
        _video = $scope.channel.video;
        $scope.$apply(function() {
            $scope.videoReady = true;
        });
    };

    $scope.onStream = function (stream) {
        // You could do something manually with the stream.
    };

    $scope.tryagain = function() {
        $scope.status = 'RECORDING';
    };

    $scope.submit = function() {
        $scope.status = 'SUBMITTED';
    };

    $scope.startover = function() {
        $state.transitionTo('checkin');
    };

    $scope.makeSnapshot = function makeSnapshot() {
        if (_video) {
            var patCanvas = document.querySelector('#snapshot');
            if (!patCanvas) return;

            patCanvas.width = _video.width;
            patCanvas.height = _video.height;
            var ctxPat = patCanvas.getContext('2d');
            
            var idata = getVideoData($scope.focusBox.x, $scope.focusBox.y, $scope.focusBox.w, $scope.focusBox.h);
            ctxPat.putImageData(idata, 0, 0);

            //sendSnapshotToServer(patCanvas.toDataURL());

            patData = idata;
            $scope.status = 'SHOWSNAP';
        }
    };

    var getVideoData = function getVideoData(x, y, w, h) {
        var hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = _video.width;
        hiddenCanvas.height = _video.height;
        var ctx = hiddenCanvas.getContext('2d');
        ctx.drawImage(_video, 0, 0, _video.width, _video.height);
        // invert image horizontally
        //ctx.save();
        //ctx.scale(-1,1);
        //ctx.drawImage(_video,0,0,_video.width*-1,_video.height);
        //ctx.restore();
        return ctx.getImageData(x, y, w, h);
    };
}


