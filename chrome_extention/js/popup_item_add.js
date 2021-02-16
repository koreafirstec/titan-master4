'use strict';

angular.module('titanPopup', ['api', 'angularFileUpload'])
.controller('PopupItemAddCtrl',['$scope', '$window', '$upload', 'api_make_titan_video', 'api_progress_process', 'api_item', 'api_item_detail', function PopupItemAddCtrl($scope, $upload, api_make_titan_video, api_progress_process, api_item, api_item_detail){
    $scope.ENV = 'http://118.37.64.217/';

    var url_params = location.search.split('=');
    $scope.video_idx = url_params[1].split('&')[0];
    $scope.shape_type = url_params[2];
    console.log($scope.video_idx);
    console.log($scope.shape_type);

    $scope.ai_status = 0;
    $scope.update_table = false;
    $scope.noimg_image = $scope.ENV + "images/common/noimg.png";
    $scope.img_url_past = $scope.noimg_image;
    $scope.img_url_current = $scope.noimg_image;
    $scope.img_url_future = $scope.noimg_image;

    var api_params = {};
    api_params['fk_video_idx'] = $scope.video_idx;
    api_params['fk_user_idx'] = 29;
    api_params['item_title'] = '의류';
    api_params['item_description'] = '크롬 익스텐션 테스트';
    api_params['item_price'] = '50000';
    api_params['item_redirect_url'] = 'http://hsmoa.co.kr/i?id=8540042&from=timeline';
    api_params['fk_item_main_type'] = 0;
    api_params['fk_item_sub_type'] = $scope.shape_type;
    api_params['item_img_path'] = '/images/uploads/';
    api_params['item_shape_type'] = 0;
    api_params['using'] = 1;
    api_params['update_check'] = 0;
    api_params['item_description_toggle'] = 0;

    api_item.save({}, api_params, function (data) {
        if(data.status == 200) {
            $scope.item_idx = data.objects[0].fk_item_idx;
            $scope.video_url = data.objects[0].video_url;
            $scope.video_id = $scope.video_url.substr(32, 11);
            $scope.item_info = data.objects[0];
            makeTitan();
        }
    });

    function makeTitan() {
        api_params = {};

        api_params['user_idx'] = 29;
        api_params['video_url'] = $scope.video_url;
        api_params['fk_item_idx'] = $scope.item_idx;
        api_params['fk_item_main_type'] = 0;
        api_params['fk_item_sub_type'] = $scope.shape_type;

        api_make_titan_video.save(api_params, function (data) {});

        var api_params2 = {};
        var img_url_past = '';
        var img_url_current = '';
        var img_url_future = '';
        var image_path = $scope.ENV + 'make_image/' + $scope.item_idx;
        var video_thumbnail = "http://img.youtube.com/vi/"+ $scope.video_id +"/hqdefault.jpg";
        
        api_params2['item_idx'] = $scope.item_idx;

        // FIXME: $scope.ai_status 100을 가져가지 못함 -> (임시) 99로 해놓음
        $scope.progress_interval = setInterval(function (){
            api_progress_process.get(api_params2, function (data) {
                if(data.status == 200 && data.objects[0].ai_status == 1) {
                    var item_div = document.getElementById("item_div");
                    if(data.objects[0].draw_img_name != "" && data.objects[0].draw_img_name != undefined && $scope.ai_status != 100){
                        img_url_past = image_path + '/images/' + data.objects[0].draw_img_name + '.jpg'
                        img_url_current = image_path + '/images/' + data.objects[0].draw_img_name + '.jpg';
                        if(data.objects[0].check)
                            img_url_future = image_path + '/draw_images/' + data.objects[0].draw_img_name + '.jpg';
                        else{
                            img_url_future = image_path + '/images/' + data.objects[0].draw_img_name + '.jpg';
                        }
                        if(document.getElementById('current_img')) {
                            var w = document.getElementById('current_img').width;
                            var h = document.getElementById('current_img').height;

                            var left = Math.floor(data.objects[0].x / (1920 / w));
                            var top = Math.floor(data.objects[0].y / (1080 / h));
                            var width = Math.floor(data.objects[0].width / (1920 / w)) - left;
                            var height = Math.floor(data.objects[0].height / (1080 / h)) - top;

                            item_div.style.left = left + "px";
                            item_div.style.top = top + "px";
                            item_div.style.width = width + "px";
                            item_div.style.height = height + "px";
                            item_div.style.display = "inline-block";
                        }
                    } else {
                        if(item_div) item_div.style.display = "none";
                        img_url_past = video_thumbnail;
                        img_url_current = video_thumbnail;
                        img_url_future = video_thumbnail;
                    }
                    $scope.img_url_past = img_url_past;
                    $scope.img_url_current = img_url_current;
                    $scope.img_url_future = img_url_future;
                    $scope.ai_status = data.objects[0].progress;
                    console.log($scope.ai_status);
                    var progress_bar = document.getElementById("progress_bar");
                    if(progress_bar) progress_bar.style.width = $scope.ai_status + "%";
                    if($scope.ai_status == 100){
                        $scope.img_url_past = video_thumbnail;
                        $scope.img_url_current = video_thumbnail;
                        $scope.img_url_future = video_thumbnail;
                        console.log("end", $scope.ai_status);
                        clearInterval($scope.progress_interval);
                    }
                }
                // else if(data.objects[0].ai_status != 1) {
                //     $scope.message = "잘못된 값으로 인해 5초 후 강제 종료됩니다.";
                //     clearInterval($scope.progress_interval);
                //     setTimeout(window.close(), 5000);
                // }
            });
        },850);
    }
    
    // FIXME: X 클릭 시 메시지(변경사항이 저장되지 않을 수 있습니다.) - 이벤트 불가능
    // $window.onbeforeunload = function(e) {
    //     return true;
    // }

    function remove_item() {
        var delete_params = {};
        delete_params['d_item_idx'] = $scope.item_idx;

        console.log(1);
        api_item.delete(delete_params, function (data) {
            console.log(2);
            api_item_detail.delete(delete_params, function (data) {
            console.log(3);
            return true;
            });
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////

    $scope.updateOn = function() {
        $scope.update_table = true;

        $scope.new_data = {};
        
        $scope.new_data.item_price = String($scope.item_info.item_price);
        $scope.new_data.item_title = $scope.item_info.item_title;
        $scope.new_data.item_description = $scope.item_info.item_description;
        $scope.new_data.item_redirect_url = $scope.item_info.item_redirect_url;
        $scope.new_data.item_img_path = $scope.item_info.item_img_path;
    
        $scope.item_main_type = [
            {index: 0, item: '의류', value: 0},
            {index: 1, item: '가전류', value: 1}
        ];
    
        $scope.new_data.item_main = $scope.item_main_type[$scope.item_info.fk_item_main_type];
    
        $scope.item_sub_s_type = [
            {index: 0, item: '티셔츠', value: 0},
            {index: 1, item: '바지', value: 1},
            {index: 2, item: '블라우스', value: 2},
            {index: 3, item: '점퍼', value: 3},
            {index: 4, item: '신발', value: 4}
        ];
    
        $scope.item_sub_e_type = [
            {index: 0, item: '전자레인지', value: 0},
            {index: 1, item: '냉장고', value: 1},
            {index: 2, item: 'TV', value: 2}
        ];
    
        if($scope.new_data.item_main.value == 0){
           $scope.new_data.item_sub = $scope.item_sub_s_type[$scope.item_info.fk_item_sub_type];
        }else if($scope.new_data.item_main.value == 1){
           $scope.item_sub = $scope.item_sub_e_type[$scope.item_info.fk_item_sub_type];
        }
    
        $scope.item_shape_type = [
            {index: 0, item: '사각형', value: 0},
            {index: 1, item: '선물상자', value: 1}
        ];
    
        $scope.new_data.item_shape = $scope.item_shape_type[$scope.item_info.item_shape_type];
    }

    $scope.updateOff = function() {
        $scope.update_table = false;
    }

    $scope.fileClick = function() {
        var item_file = document.getElementById("item_file");
        
        item_file.click();

        function fileChange() {
            var item_img = document.getElementById("item_img");
            
            $scope.file = item_file.files[0];
            if($scope.file) {
                var reader = new FileReader();
                reader.onload = (function(aImg) {
                    return function(e) {
                        aImg.src = e.target.result;
                        $scope.file = e.target.result;
                    }
                })(item_img);
    
                reader.readAsDataURL($scope.file);
            }
            item_file.removeEventListener('change', fileChange);
        }

        item_file.addEventListener('change', fileChange);
    }

    function imgUpload(url, width, height, updateFunc) {
        var file = $scope.file;

        function dataURItoBlob(dataURI) {
          var byteString;
          if (dataURI.split(',')[0].indexOf('base64') >= 0){
              byteString = atob(dataURI.split(',')[1]);
          } else
              byteString = unescape(dataURI.split(',')[1]);
    
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
          var ia = new Uint8Array(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }
    
          return new Blob([ia], {type:mimeString});
        };
    
        function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
          var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          return { width: srcWidth*ratio, height: srcHeight*ratio };
        };
    
        var canvasElement = document.createElement('canvas');
        var imagenElement = document.createElement('img');
        imagenElement.onload = function () {
            var dimensions = calculateAspectRatioFit(imagenElement.width, imagenElement.height, width, height);
            canvasElement.width = dimensions.width;
            canvasElement.height = dimensions.height;
            var context = canvasElement.getContext('2d');
            context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
            var file = canvasElement.toDataURL('image/jpeg', 0.9);
            var blob = dataURItoBlob(file);
            $scope.upload = $upload.upload({
                url: url,
                method: 'POST',
                file: blob
            }).success(function(data, status, headers, config) {
                if(status == 200){
                    $scope.new_data.item_img_path = data.objects['fileurl'];
                    updateFunc();
                }else{
                }
            });
    
        };
        imagenElement.src = file;
    }

    $scope.updateItem = function() {
        function updateFunc() {
            var api_params = {};
            api_params['item_idx'] = $scope.item_idx;
            api_params['fk_video_idx'] = $scope.video_idx;
            api_params['fk_user_idx'] = 29;
            api_params['item_title'] = $scope.new_data.item_title;
            api_params['item_description'] = $scope.new_data.item_description;
            api_params['item_price'] = $scope.new_data.item_price;
            api_params['item_redirect_url'] = $scope.new_data.item_redirect_url;
            api_params['fk_item_main_type'] = $scope.new_data.item_main.value;
            api_params['fk_item_sub_type'] = $scope.new_data.item_sub.value;
            api_params['item_shape_type'] = $scope.new_data.item_shape.value;
            api_params['shape_title'] = 'sample_pants';
            api_params['using'] = 0;
      
            api_item.update(api_params, function (data) {
                window.close();
            });
        }
      
        var url = $scope.ENV + "api/file_upload?item_idx=999";
        if($scope.file) {
            imgUpload(url, 800, 600, updateFunc);
        } else {
            updateFunc();
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////
    $scope.deleteItem = function() {
        var api_params = {};
        api_params['d_item_idx'] = $scope.item_idx;
        api_params['d_shape_idx'] = $scope.shape_idx;
        api_item.delete(api_params, function(data){
            window.close();
        });
    }
}])

// FIXME: A cookie associated with a cross-site resource at http://youtube.com/ was set without the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032.
.directive('youtube', ['$window', 'api_item_detail', function($window, api_item_detail) {
    return {
        restrict: "E",
        scope: {
            videoid: "@",
            videoidx: "@",
            itemidx: "@"
        },
    
        template: '<div></div>',
    
        link: function(scope, element) {
            var player;
            if (!window.YT) {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                $window.onYouTubeIframeAPIReady = function () {
                    runPlayer();
                };
            } else
                runPlayer();
      
            function runPlayer() {
              player = new YT.Player(element.children()[0], {
                playerVars: {
                  autoplay: 0,
                  html5: 1,
                  theme: "light",
                  modesbranding: 0,
                  color: "white",
                  iv_load_policy: 3,
                  showinfo: 1,
                  controls: 1
                },
                events: {
                 onStateChange: onPlayerStateChange
                },
                height: "100%",
                width: "100%",
                videoId: scope.videoid,
              });
            };

            var api_params = {};
            var dataObjects;
            var count;
            var prev_item_div = document.getElementById("prev_item_div");

            api_params['video_idx'] = scope.videoidx;
            api_params['item_detail_idx'] = scope.itemidx;
            api_item_detail.get(api_params, function (data) {
                dataObjects = data.objects;
            });

            var rect_interval;

            function drawRect(left, top, width, height) {
                prev_item_div.style.left = left + "px";
                prev_item_div.style.top = top + "px";
                prev_item_div.style.width = width + "px";
                prev_item_div.style.height = height + "px";
                prev_item_div.style.display = "flex";
            }

            function onPlayerStateChange() {
                if(player.getPlayerState() == 1) {
                    rect_interval = setInterval(function drawStart() {
                        prev_item_div.style.display = "none";
                        count = parseInt(player.getCurrentTime() + 0.8) * 10;
                        count = dataObjects.filter(d => d.position == count)[0];
                        console.log(count);
                        count = dataObjects.indexOf(count);
                        console.log(count);
                        var item = dataObjects[count];
                        if (item != undefined) {
                            var left = Math.floor(item.x / (1920 / player.a.clientWidth));
                            var top = Math.floor(item.y / (1080 / player.a.clientHeight));
                            var width = Math.floor(item.width / (1920 / player.a.clientWidth)) - left;
                            var height = Math.floor(item.height / (1080 / player.a.clientHeight)) - top;

                            drawRect(left, top, width, height);
                        }
                    })
                } else {
                    if(rect_interval) {
                        clearInterval(rect_interval);
                    }
                }
            }
        }
    }
}]);