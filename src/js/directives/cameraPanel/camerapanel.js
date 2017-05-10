angular.module('app').directive('cameraPanel', ['$timeout', '$state', cameraPanel]);

function cameraPanel($timeout, $state) {

    var directive = {
        scope: {
            picture: '=',
            onSubmit: '=',
            user: '=',
            onNext: '=',
            nextLabel: '@'
        },
        controller: ['$scope', function($scope) {
            var _video = null;
            var canvas = null;
            var tracker = new tracking.ObjectTracker('face');
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);
            
            $scope.status = 'RECORDING';
            $scope.headerOffset = 90 + 64;
            $scope.footerOffset = 74;
            $scope.dataHeader = 80;
            $scope.leftMargin = 15;

            $scope.channel = {
                videoHeight: 0,
                videoWidth: 0
            };
            $scope.focusBox = {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                color: '3px solid #fff'
            };

            var render = function() {
                $scope.videoHeight = window.innerHeight - $scope.headerOffset - $scope.footerOffset;
                $scope.videoWidth = window.innerWidth/2 - $scope.leftMargin*2;
                $scope.dataHeight = window.innerHeight - $scope.headerOffset - $scope.dataHeader - 20;

                var calculatedHeight = $scope.videoWidth*3/4;
                var channelWidth = $scope.videoWidth;
                if (calculatedHeight < $scope.videoHeight) {
                    channelWidth = $scope.videoHeight/calculatedHeight * $scope.videoWidth;
                }
                $scope.channel.videoHeight = $scope.videoHeight;
                $scope.channel.videoWidth = channelWidth;
                
                $scope.focusBox.x = $scope.videoWidth/4;
                $scope.focusBox.y = $scope.videoHeight*0.125;
                $scope.focusBox.w = $scope.videoWidth/2;
                $scope.focusBox.h = $scope.videoHeight*0.875 - $scope.videoHeight*0.125;
            }

            render();

            window.onresize = function() {
                render();
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
                                if (rect.x > $scope.focusBox.x && rect.y > $scope.focusBox.y &&
                                        rect.width + rect.x < $scope.focusBox.x + $scope.focusBox.w &&
                                            rect.height + rect.y < $scope.focusBox.y + $scope.focusBox.h) {
                                    $scope.focusBox.color = '3px solid rgba(0, 255, 0, 0.5)';
                                } else {
                                    $scope.focusBox.color = '3px solid rgba(255, 0, 0, 0.5)';
                                }
                                $('.focusBoxTopLeft').css('border-top', $scope.focusBox.color);
                                $('.focusBoxTopLeft').css('border-left', $scope.focusBox.color);
                                $('.focusBoxTopRight').css('border-top', $scope.focusBox.color);
                                $('.focusBoxTopRight').css('border-right', $scope.focusBox.color);
                                $('.focusBoxBottomLeft').css('border-bottom', $scope.focusBox.color);
                                $('.focusBoxBottomLeft').css('border-left', $scope.focusBox.color);
                                $('.focusBoxBottomRight').css('border-bottom', $scope.focusBox.color);
                                $('.focusBoxBottomRight').css('border-right', $scope.focusBox.color);
                                // $scope.$apply();
                            });
                        });
                    });
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
                $scope.onSubmit();
            };

            $scope.next = function() {
                $scope.onNext();
            };

            var timerId;
            $scope.seconds = 2;
            $scope.makingSnapshot = false;

            $scope.makeSnapshot = function makeSnapshot() {
                if (_video) {
                    var patCanvas = document.querySelector('#snapshot');
                    if (!patCanvas) return;

                    $scope.makingSnapshot = true;
                    $scope.seconds = 2;
                    timerId = setInterval(function () {
                        $scope.seconds--;
                        if ($scope.seconds == 0) {
                            clearInterval(timerId);
                            $scope.makingSnapshot = false;
                            patCanvas.width = _video.width;
                            patCanvas.height = _video.height;
                            var ctxPat = patCanvas.getContext('2d');
                            
                            var idata = getVideoData($scope.focusBox.x, $scope.focusBox.y, $scope.focusBox.w, $scope.focusBox.h);
                            ctxPat.putImageData(idata, 0, 0);

                            $scope.picture.picturebase64 = patCanvas.toDataURL();

                            patData = idata;
                            $scope.status = 'SHOWSNAP';
                        }
                        $scope.$apply();
                    }, 1000);

                    
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
        }],
        link: function(scope, element, attrs, tabsCtrl) {

        },
        templateUrl: '/js/directives/camerapanel/camerapanel.html',
        restrict: 'E'
    };
    return directive;
};
