angular
    .module('app')
    .controller('CheckinCtrl', ['$scope','$state','ApiService',CheckinCtrl]);

function CheckinCtrl($scope, $state, ApiService) {
    var _video = null;
    var canvas = null;
    var tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);
    $scope.status = 'RECORDING';
    $scope.headerOffset = 90;
    $scope.footerOffset = 50;
    $scope.dataHeader = 80;
    $scope.leftMargin = 15;
    $scope.selectedTraveller = null;
    $scope.travellers = [{
        name: 'User',
        lastname: 'One'
      },{
        name: 'User',
        lastname: 'Two'
    }];

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

            //
            tracking.track('.webcam-live', tracker, { camera: true });
            setTimeout(function() {
                if (canvas) {
                    return;
                }
                canvas = document.getElementById('canvas');
                var context = canvas.getContext('2d');
                tracker.on('track', function(event) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    event.data.forEach(function(rect) {
                        context.strokeStyle = '#a64ceb';
                        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                        context.font = '11px Helvetica';
                        context.fillStyle = "#fff";
                        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
                        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
                        if (rect.x > $scope.focusBox.x && rect.y > $scope.focusBox.y &&
                            rect.width + rect.x < $scope.focusBox.x + $scope.focusBox.w &&
                            rect.height + rect.y < $scope.focusBox.y + $scope.focusBox.h) {
                                $('#capture-button').show();
                            } else {
                                $('#capture-button').hide();
                            }
                    });
                });
            });
            
            //
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

    $scope.next = function() {
        $state.transitionTo('security');
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
