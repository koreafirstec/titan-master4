'use strict';

angular.module('titanApp')
    .controller('VideoEditorModifyCtrl', function ($scope, $window, $filter, $route, $rootScope, $location, video_idx, selectedVideoItem, api_editor_list, api_video, $interval, $timeout, Modal, api_item, $modalInstance, api_shape, api_titan_model, AuthService, api_make_titan_video, api_progress_process, api_item_position_detail, api_item_detail, api_video_capture, ENV) {
        $scope.user_id = AuthService.getUserId();
        $scope.user_idx = AuthService.getIdx();
        $rootScope.selectedVideoItem = video_idx;
        $scope.selectedItemList = selectedVideoItem;
        $scope.env_webs = ENV.webs;

        $scope.editor_title = "unSelected";
        $scope.show_itemList = '';
        $scope.make_item_list = '';

        $scope.current_image = []
        $scope.array_img = [];
        $scope.img_editor_modify = [];
        $scope.rectPosition = [];
        $scope.detail_selected;
        $scope.modify_success_list = [];

        $scope.width_img = 0;
        $scope.height_img = 0;
        $scope.youtube_width = 0;
        $scope.youtube_height = 0;
        $scope.modify_titan_status = 200;
        $rootScope.current_time_youtube = 0;

        let diff = 0;
        let ticking = false;
        $scope.modify_display = 'none';
        $scope.show_position = true;
        $scope.show_item_lib = true;
        $scope.show_detail_lib = false;
        $scope.modify_and_delete_button_status = false;

        $scope.item_detail_list = function(item_idx){
            var api_params = {};
            api_params['video_idx'] = $rootScope.selectedVideoItem.idx;
            api_params['fk_item_idx'] = item_idx;
            api_item_detail.get(api_params, function(data){
                if(data.status == 200){
                    $scope.detail_list = data.objects;
                    $scope.detail_selected = $scope.detail_list[0];
                }
            });
        }

        $scope.item_position_rect_list = function(item_idx, item_position, video_idx){
            $scope.modify_success.map(value => {value.display= "none"});
            $scope.width_img = $('#editors_modify_video')[0].clientWidth;
            $scope.height_img = $('#editors_modify_video')[0].clientHeight;
            var api_params = {}
            api_params['item_idx'] = item_idx;
            api_params['video_idx'] = video_idx;
            api_params['image_frame'] = parseInt(item_position);
            api_item_position_detail.get(api_params, function(data){
                if(data.status == 200){
                    $rootScope.video_modify_rect = data.objects;
                    $("#adding_modify_position").css('display', 'flex');
                    $("#cancel_modify_position").css('display', 'none');
                    var indexMody = $scope.modify_success.findIndex(mody => mody.position === item_position);
                    $scope.modify_success[indexMody].display = "inline-block";
                    var Objects = data.objects;
                    if($rootScope.local_player.getPlayerState() == 1){
                        $rootScope.local_player.pauseVideo();
                    }
                    $scope.rectPosition = [];
                    for(let i = 0; i < Objects.length; i++){
                         $scope.p_time = Objects[i].position_time;
                         $scope.fk_item_idx = item_idx;
                         $scope.position_order = Objects[i].position_order;
                         $scope.editor_i = $scope.position_order;
                         $scope.item_position_value = Objects[i].position;
                         $scope.rectLeft = Math.floor(Objects[i].x / (1920 / $scope.width_img));
                         $scope.rectTop = Math.floor(Objects[i].y / (1080 / $scope.height_img));
                         $scope.rectWidth = Math.floor(Objects[i].width / (1920 / $scope.width_img)) - $scope.rectLeft;
                         $scope.rectHeight = Math.floor(Objects[i].height / (1080 / $scope.height_img)) - $scope.rectTop;
                         $scope.rectPosition.push({
                             item_idx: $scope.fk_item_idx,
                             position: $scope.image_frame,
                             p_order: $scope.position_order,
                             rectLeft: $scope.rectLeft * (1920/$scope.width_img),
                             rectTop: $scope.rectTop * (1080/$scope.height_img),
                             rectWidth: $scope.rectWidth * (1920/$scope.width_img)+($scope.rectLeft * (1920/$scope.width_img)),
                             rectHeight: $scope.rectHeight * (1080/$scope.height_img)+($scope.rectTop * (1080/$scope.height_img)),
                         });
                    }
                }
            });
        }

        $scope.position_change_play = function(){
            $scope.show_position = true;
        }

        $scope.position_change_pause = function(){
            $scope.show_position = false;
            if($rootScope.current_time_youtube != 0){
                angular.element('#meta_data_detector').css('display', 'none');
                $rootScope.local_player.seekTo(parseFloat($rootScope.current_time_youtube));
                clearInterval($rootScope.update_timer);
                $rootScope.local_player.pauseVideo();
                $('.video_editor_modify_div').css('display', 'flex');
            }else{
                clearInterval($rootScope.update_timer);
                $rootScope.local_player.pauseVideo();
                $('.video_editor_modify_div').css('display', 'flex');
                if($scope.make_item_list){
                   get_current_position($scope.make_item_list.idx);
                }
            }
        }

        function get_current_position(item_idx){
            $scope.modify_success.map(value => {value.display= "none"});
            var api_params = {};
            api_params['image_frame'] = Math.floor($rootScope.local_player.getCurrentTime() + 0.8) * 30;
            api_params['item_idx'] = item_idx;
            api_params['video_idx'] = $rootScope.selectedVideoItem.idx;
            api_item_position_detail.get(api_params, function(data){
                if(data.status == 200){
                    var indexMody = $scope.modify_success.findIndex(mody => mody.position === api_params['image_frame']);
                    $scope.modify_success[indexMody].display = "inline-block";
                    $rootScope.video_modify_rect = data.objects;
                    $scope.img_modify_url_current = ENV.webs + data.objects[0].draw_img_name;
                    $scope.editor_title = $scope.modify_success[indexMody].detail_index;
                    $scope.image_frame = parseInt($scope.modify_success[indexMody].position);
                    $rootScope.local_player.seekTo(parseFloat($scope.modify_success[indexMody].position_time));
                    var time = parseInt($scope.modify_success[indexMody].position_time);

                    var hour = Math.floor(time / 3600),
                    minutes = Math.floor((time - (hour * 3600)) / 60),
                    seconds = time - (hour * 3600) - (minutes * 60);

                    hour = hour < 10 ? '0' + hour : hour;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    seconds = seconds < 10 ? '0' + seconds : seconds;
                    $('#current-time').text(String(hour+":"+minutes+":"+seconds));
                    for(let i = 0; i < data.objects.length; i++){
                         $scope.rect_position_modify_func(data.objects, i);
                    }
                }
            });
        }

        $scope.ItemModifyEditor = function(item, video_idx, item_idx){
            $scope.show_position = false;
            $scope.show_item_lib = false;
            $scope.modify_and_delete_button_status = false;
            $('#editors_none').css("display", 'none');
            $('#editors_title').css("display", 'flex');
            $('.video_item_position').css("display", 'none');
            $('.video_editor_modify_div').css('display', 'none');
            $('#item_'+item_idx).css('display', 'none');
            $('#img_'+item_idx).css('display', 'none');
            $scope.modify_display = 'flex';
            $rootScope.local_player.seekTo(parseFloat(item.position_time));
            if($rootScope.local_player.getPlayerState() == 1)
                $rootScope.local_player.pauseVideo();
            const list = document.querySelector('#modify_list');

            function doSomething(diff) {
              list.scrollLeft += (diff);
            }

            list.addEventListener('wheel', function(e) {
              diff = e.deltaY;
              if (!ticking) {
                window.requestAnimationFrame(function() {
                  doSomething(diff);
                  ticking = false;
                });
              }
              ticking = true;
            }, { passive: true });
            $scope.p_time = item.position_time;
            var time = parseInt($scope.p_time);

            var hour = Math.floor(time / 3600),
            minutes = Math.floor((time - (hour * 3600)) / 60),
            seconds = time - (hour * 3600) - (minutes * 60);

            hour = hour < 10 ? '0' + hour : hour;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            $('#current-time').text(String(hour+":"+minutes+":"+seconds));
            $scope.width_img = $('#editors_modify_video')[0].clientWidth;
            $scope.height_img = $('#editors_modify_video')[0].clientHeight;
            $scope.youtube_width = $("youtube iframe")[0].clientWidth;
            $scope.youtube_height = $("youtube iframe")[0].clientHeight;
            $scope.youtube_canvas = $("#video_modify_canvas")[0].clientWidth;
            $scope.video_modify_canvas = $("#youtube_modify_if")[0].clientWidth;
            $scope.calc_value = Math.floor(($scope.video_modify_canvas-$scope.youtube_canvas)/2);
            var api_params = {};
            $scope.item_idx = item_idx;
            $scope.image_frame = parseInt(item.position);
            $scope.editor_title = item.detail_index;
            $scope.img_modify_url_current = ENV.webs + item.draw_img_name;
            $scope.item_position_rect_list(item_idx, $scope.image_frame, video_idx);
        }

        $scope.position_modify = function(x, y, w, h, position, iw, ih, item_idx, p_order, video_idx){
            var drop_confirm = confirm('현재 영역을 수정하시겠습니까?');

            if(drop_confirm){
                $scope.dataStatus = 203;
                var api_params = {};
                api_params['fk_item_idx'] = item_idx;
                api_params['fk_video_idx'] = video_idx;
                api_params['item_position'] = position;
                api_params['p_order'] = p_order;
                api_params['rect_x'] = x * (1920/iw);
                api_params['rect_y'] = y * (1080/ih);
                api_params['rect_w'] = w * (1920/iw)+api_params['rect_x'];
                api_params['rect_h'] = h * (1080/ih)+api_params['rect_y'];
                api_item_detail.update(api_params, function(data){
                    if(data.status == 200){
                        $scope.dataStatus = data.status;
                        $rootScope.video_modify_rect = data.objects;
                        for(let i = 0; i < data.objects.length; i++){
                             $scope.rect_position_modify_func(data.objects, i);
                        }
                        const indexMody = $scope.modify_success.findIndex(mody => mody.position === position);
                        $scope.modify_success[indexMody].border_color = "5px solid green";
                    }
                });
            }else{
                alert("취소하였습니다.");
            }
        }

        $scope.position_delete = function(position, item_idx, p_order, video_idx){
            var drop_confirm = confirm('현재 영역을 삭제하시겠습니까?');

            if(drop_confirm){
                var api_params = {};

                api_params['rect_item_idx'] = item_idx;
                api_params['rect_video_idx'] = video_idx;
                api_params['rect_position'] = position;
                api_params['p_order'] = p_order;
                api_item_detail.delete(api_params, function(data){
                    if(data.status == 200){
                        if(data.objects != '' && data.objects != undefined){
                            $scope.dataStatus = data.status;
                            $rootScope.video_modify_rect = data.objects;
                            for(let i = 0; i < data.objects.length; i++){
                                 $scope.rect_position_modify_func(data.objects, i);
                            }
                            const indexMody = $scope.modify_success.findIndex(mody => mody.position === position);
                            $scope.modify_success[indexMody].border_color = "5px solid red";
                            $('#item_modify_div_'+p_order).css('display', 'none');
                        }else{
                            const index = $scope.modify_success.findIndex(idx => idx.position === position);
                            $scope.modify_success.splice(index, 1);
                        }
                    }
                });
            }else{
                alert("취소하였습니다.");
            }
        }

        $scope.position_all_drop = function(rectPosition, video_idx){
            var drop_confirm = confirm('모든 영역을 삭제하시겠습니까?');

            if(drop_confirm){
                var api_params = {};

                for(var i in rectPosition){
                    api_params['rect_item_idx'] = rectPosition[i].item_idx;
                    api_params['rect_video_idx'] = video_idx;
                    api_params['rect_position'] = rectPosition[i].position;
                    api_params['p_order'] = rectPosition[i].p_order;
                    api_item_detail.delete(api_params, function(data){
                        if(data.status == 200){
                            if(data.objects != '' && data.objects != undefined){
                                $scope.dataStatus = data.status;
                                $('.modify__div').css('display', 'none');
                            }else{
                                const index = $scope.modify_success.findIndex(idx => idx.position === rectPosition[i].position);
                                $scope.modify_success.splice(index, 1);
                            }
                        }
                    });
                }
            }else{
                alert("취소하였습니다.");
            }
        }

        $(window).resize(function () {
            $timeout(function(){
                $('#context1').css('display', 'none');
                var editor_id = document.getElementById('video_modify_Editors_content');
                if(editor_id){
                    if($scope.rectPosition != ''){
                        $scope.width_img = $('#editors_modify_video')[0].clientWidth;
                        $scope.height_img = $('#editors_modify_video')[0].clientHeight;
                        $scope.youtube_width = $("youtube iframe")[0].clientWidth;
                        $scope.youtube_height = $("youtube iframe")[0].clientHeight;
                        $scope.youtube_canvas = $("#video_modify_canvas")[0].clientWidth;
                        $scope.video_modify_canvas = $("#youtube_modify_if")[0].clientWidth;
                        $scope.calc_value = Math.floor(($scope.video_modify_canvas-$scope.youtube_canvas)/2);
                        for(var i in $scope.rectPosition){
                            $scope.rectLeft = Math.floor($scope.rectPosition[i].rectLeft / (1920 / $scope.width_img));
                            $scope.rectTop = Math.floor($scope.rectPosition[i].rectTop / (1080 / $scope.height_img));
                            $scope.rectWidth = Math.floor($scope.rectPosition[i].rectWidth / (1920 / $scope.width_img)) - $scope.rectLeft;
                            $scope.rectHeight = Math.floor($scope.rectPosition[i].rectHeight / (1080 / $scope.height_img)) - $scope.rectTop;
                        }
                    }
                }
            }, 1);
        });

        $scope.item_modify_click = function(item){
            var item_confirm = confirm('해당 상품의 값을 보시거나, 추가/수정/삭제를 수행하시겠습니까?');
            if(item_confirm){
                $rootScope.local_player.playVideo();
                $scope.width_img = $('#editors_modify_video')[0].clientWidth;
                $scope.height_img = $('#editors_modify_video')[0].clientHeight;
                $scope.youtube_width = $("youtube iframe")[0].clientWidth;
                $scope.youtube_height = $("youtube iframe")[0].clientHeight;
                $scope.youtube_canvas = $("#video_modify_canvas")[0].clientWidth;
                $scope.video_modify_canvas = $("#youtube_modify_if")[0].clientWidth;
                $scope.calc_value = Math.floor(($scope.video_modify_canvas-$scope.youtube_canvas)/2);
                var api_params = {};
                $scope.modify_display = 'none';

                api_params['item_idx'] = item.idx;
                api_params['video_idx'] = $scope.selectedVideoItem.idx;
                api_item_position_detail.get(api_params, function(data){
                    if(data.status == 200){
                        $('#editors_none').css("display", 'none');
                        $('#editors_title').css("display", 'flex');
                        $('.video_editor_modify_div').css('display', 'none');
                        $rootScope.video_modify_rect = data.objects;
                        $scope.editor_title = 1;
                        for(var i in data.objects){
                            $scope.p_time = data.objects[0].position_time;
                            $scope.image_frame = data.objects[data.objects.length-1].position;
                            $scope.editor_i = data.objects[data.objects.length-1].position_order;
                            $scope.img_modify_url_current = ENV.webs + data.objects[i].draw_img_name;
                            $rootScope.local_player.seekTo(parseFloat(data.objects[i].position_time), true);
                            $scope.rect_position_modify_func(data.objects, i);
                            $scope.modify_success_list.push({
                                "position": data.objects[i].position,
                                "detail_index": item.index,
                                "position_time": data.objects[i].position_time,
                                "draw_img_name": data.objects[i].draw_img_name,
                                "display": "none",
                                "border_color": "5px solid #87ceeb"
                            });
                        }
                        var time = parseInt($scope.p_time);

                        var hour = Math.floor(time / 3600),
                        minutes = Math.floor((time - (hour * 3600)) / 60),
                        seconds = time - (hour * 3600) - (minutes * 60);

                        hour = hour < 10 ? '0' + hour : hour;
                        minutes = minutes < 10 ? '0' + minutes : minutes;
                        seconds = seconds < 10 ? '0' + seconds : seconds;
                        $('#current-time').text(String(hour+":"+minutes+":"+seconds));
                        $scope.detail_index = item.index;
                        $scope.modify_success = Array.from(new Set($scope.modify_success_list.map(JSON.stringify))).map(JSON.parse);
                        $scope.modify_success.sort(function(a, b) {
                            return a["position"] - b["position"];
                        });
                    }
                });
                $scope.show_item_lib = false;
                $scope.show_detail_lib = true;
                $scope.item_detail_list(item.idx);
                $scope.make_item_list = item;
                if($rootScope.local_player.getPlayerState() == 1)
                    $rootScope.local_player.pauseVideo();
            }
        }

        $scope.video_pause = function(){
            $scope.position_move_status = 200;
            $scope.img_editor_modify = [];
            $rootScope.local_player.pauseVideo();
        }

        $scope.img_editor = [];
        $scope.position_move_status = 400;

        $(document).on('keydown', function(e){
            var code = (e.keyCode ? e.keyCode : e.which);
            switch (code) {
                case 27: //ESC
                    var editor_close = confirm('해당 편집기를 종료하시겠습니까?(단, 이미 삭제하거나 수정하신 것은 바꿀 수 없습니다.)');
                    var api_params = {};
                    if(editor_close){
                        $scope.item_detection = false;
                        if($scope.modify_titan_status == 200){
                            $modalInstance.dismiss('cancel');
                            $window.location.reload();
                            $(document).off("keydown");
                        }else{
                            Modal.open(
                                'views/alert_modal.html',
                                'AlertCtrl',
                                'choiC',
                                {
                                    alertTitle: function () {
                                        return '종료 실패';
                                    },
                                    alertMsg: function () {
                                        return '취소 버튼을 클릭 후 종료해주세요';
                                    }
                                }
                            );
                        }
                    }
                    break;
            }
        });

        $scope.close = function(modify_titan_status){
            var editor_close = confirm('해당 편집기를 종료하시겠습니까?(단, 이미 삭제하거나 수정하신 것은 바꿀 수 없습니다.)');
            var api_params = {};
            if(editor_close){
                $scope.item_detection = false;
                if(modify_titan_status == 200){
                    $window.location.reload();
                    $modalInstance.dismiss('cancel');
                }else{
                    Modal.open(
                        'views/alert_modal.html',
                        'AlertCtrl',
                        'choiC',
                        {
                            alertTitle: function () {
                                return '종료 실패';
                            },
                            alertMsg: function () {
                                return '취소 버튼을 클릭 후 종료해주세요';
                            }
                        }
                    );
                }
            }
        };

        $scope.position_arr = [];
        $scope.fk_item_idx_arr = [];
        $scope.meta_position_editor = function(video, item){
            $scope.modify_success.map(value => {value.display= "none"});
            $scope.width_img = $('#editors_modify_video')[0].clientWidth;
            $scope.height_img = $('#editors_modify_video')[0].clientHeight;
            var api_params = {};
            $rootScope.local_player.pauseVideo();
            $scope.editor_title = item.index;
            $scope.image_frame = item.position;
            for(var i = 0; i < $scope.detail_list.length; i++){
                $scope.position_arr.push($scope.detail_list[i].position);
                $scope.fk_item_idx_arr.push($scope.detail_list[i].fk_item_idx);
            }
            const list = document.querySelector('#modify_list');

            function doSomething(diff) {
              list.scrollLeft += (diff);
            }

            list.addEventListener('wheel', function(e) {
              diff = e.deltaY;
              if (!ticking) {
                window.requestAnimationFrame(function() {
                  doSomething(diff);
                  ticking = false;
                });
              }
              ticking = true;
            }, { passive: true });
            api_params['image_frame']= item.position;
            api_params['item_idx']= item.fk_item_idx;
            api_params['video_idx']= video.idx;
            api_item_position_detail.get(api_params, function(data){
                if(data.status == 200){
                    $('#editors_none').css("display", 'none');
                    $('.video_editor_modify_div').css('display', 'none');
                    $('#editors_title').css("display", 'flex');
                    $rootScope.video_modify_rect = data.objects;
                    for(var i in data.objects){
                        $scope.p_time = data.objects[0].position_time;
                        $scope.image_frame = data.objects[data.objects.length-1].position;
                        $scope.editor_i = data.objects[data.objects.length-1].position_order;
                        $scope.img_modify_url_current = ENV.webs + data.objects[i].draw_img_name;
                        $rootScope.local_player.seekTo(parseFloat(data.objects[i].position_time), true);
                        if($rootScope.local_player.getPlayerState() == 1)
                            $rootScope.local_player.pauseVideo();
                        $scope.rect_position_modify_func(data.objects, i);
                        $scope.modify_success_list.push({
                            "position": data.objects[i].position,
                            "detail_index": item.index,
                            "position_time": data.objects[i].position_time,
                            "draw_img_name": data.objects[i].draw_img_name,
                            "display": "none",
                            "border_color": "5px solid #87ceeb"
                        });
                    }
                    var time = parseInt($scope.p_time);

                    var hour = Math.floor(time / 3600),
                    minutes = Math.floor((time - (hour * 3600)) / 60),
                    seconds = time - (hour * 3600) - (minutes * 60);

                    hour = hour < 10 ? '0' + hour : hour;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    seconds = seconds < 10 ? '0' + seconds : seconds;
                    $('#current-time').text(String(hour+":"+minutes+":"+seconds));
                    $scope.detail_index = item.index;
                    var uniqueArray = removeDuplicates($scope.modify_success_list, "position");
                    $scope.modify_success = Array.from(uniqueArray.map(JSON.stringify)).map(JSON.parse);
                    $scope.modify_success.sort(function(a, b) {
                        return a["position"] - b["position"];
                    });
                    var indexModySucc = $scope.modify_success.findIndex(Mody => Mody.position === item.position);
                    $scope.modify_success[indexModySucc].display = "inline-block";
                    $scope.modify_display = 'flex';
                }
            });
        }
        function removeDuplicates(originalArray, prop) {
             var newArray = [];
             var lookupObject  = {};

             for(var i in originalArray) {
                lookupObject[originalArray[i][prop]] = originalArray[i];
             }

             for(i in lookupObject) {
                 newArray.push(lookupObject[i]);
             }
              return newArray;
        }

        $scope.get_position_all = function(video, item){
            $scope.modify_success_list = [];
            $scope.modify_success = [];
            $scope.width_img = $('#editors_modify_video')[0].clientWidth;
            $scope.height_img = $('#editors_modify_video')[0].clientHeight;
            var api_params = {};
            $rootScope.local_player.pauseVideo();
            $scope.image_frame = item.position;
            for(var i = 0; i < $scope.detail_list.length; i++){
                $scope.position_arr.push($scope.detail_list[i].position);
                $scope.fk_item_idx_arr.push($scope.detail_list[i].fk_item_idx);
            }
            var i = 0;
            api_params['image_frame']= item.position;
            api_params['item_idx']= item.fk_item_idx;
            api_params['video_idx']= video.idx;
            const list = document.querySelector('#modify_list');

            function doSomething(diff) {
              list.scrollLeft += (diff);
            }

            list.addEventListener('wheel', function(e) {
              diff = e.deltaY;
              if (!ticking) {
                window.requestAnimationFrame(function() {
                  doSomething(diff);
                  ticking = false;
                });
              }
              ticking = true;
            }, { passive: true });
            $('#editors_none').css("display", 'none');
            $('#editors_title').css("display", 'flex');
            $('.video_editor_modify_div').css('display', 'none');
            for(var j in $scope.detail_list){
                $scope.modify_item_idx = $scope.detail_list[j].fk_item_idx;
                $scope.editor_i = $scope.detail_list[j].position_order;
                $scope.img_modify_url_current = ENV.webs + $scope.detail_list[j].draw_img_name;
                $rootScope.local_player.seekTo(parseFloat($scope.detail_list[j].position_time), true);
                $scope.modify_success_list.push({
                    "position": $scope.detail_list[j].position,
                    "detail_index": $scope.detail_list[j].index,
                    "position_time": $scope.detail_list[j].position_time,
                    "draw_img_name": $scope.detail_list[j].draw_img_name,
                    "display": "none",
                    "border_color": "5px solid #87ceeb"
                });
            }
            $scope.editor_title = $scope.detail_list[$scope.detail_list.length-1].index;
            $scope.modify_success = Array.from(new Set($scope.modify_success_list.map(JSON.stringify))).map(JSON.parse);
            var uniqueArray = removeDuplicates($scope.modify_success, "position");
            $scope.modify_success = Array.from(uniqueArray.map(JSON.stringify)).map(JSON.parse);
            $scope.modify_success.sort(function(a, b) {
                return a["position"] - b["position"];
            });
            for(var i in $scope.modify_success){
                $scope.rect_position_modify_func($scope.modify_success, i);
            }
            $scope.item_position_rect_list(item.fk_item_idx, $scope.modify_success[$scope.modify_success.length-1].position, video.idx)
            $scope.img_modify_url_current = ENV.webs + $scope.modify_success[$scope.modify_success.length-1].draw_img_name;
            $rootScope.local_player.seekTo(parseFloat($scope.modify_success[$scope.modify_success.length-1].position_time), true);
            var time = parseInt($scope.modify_success[$scope.modify_success.length-1].position_time);

            var hour = Math.floor(time / 3600),
            minutes = Math.floor((time - (hour * 3600)) / 60),
            seconds = time - (hour * 3600) - (minutes * 60);

            hour = hour < 10 ? '0' + hour : hour;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            $('#current-time').text(String(hour+":"+minutes+":"+seconds));
        }

        $scope.all_position = function(video, item){
            if($rootScope.local_player.getPlayerState() != 1){
                $scope.item_detail_list(item.fk_item_idx);
                $scope.get_position_all(video, item);
                $scope.modify_display = 'flex';
            }else{
                Modal.open(
                    'views/alert_modal.html',
                    'AlertCtrl',
                    'choiC',
                    {
                        alertTitle: function () {
                            return '정지';
                        },
                        alertMsg: function () {
                            return '동영상을 정지 후 실행해주세요';
                        }
                    }
                );
            }
        }

        $scope.back_modify_editor = function(){
            if($scope.show_item_lib){
                Modal.open(
                    'views/alert_modal.html',
                    'AlertCtrl',
                    'choiC',
                    {
                        alertTitle: function () {
                            return '이전 실패';
                        },
                        alertMsg: function () {
                            return '처음 단계입니다.';
                        }
                    }
                );
            }else if($scope.show_detail_lib){
                $scope.show_detail_lib = false;
                $scope.show_item_lib = true;
                $scope.editor_title = "unSelected";
                $("#current-time").text('00:00:00');
                $('#duration').text('00:00:00');
                $('#editors_title').css('display', 'none');
                $('#editors_none').css('display', 'flex');
                $scope.modify_success_list = [];
                $rootScope.local_player.stopVideo();
                $rootScope.video_modify_rect = '';
                $scope.img_modify_url_current = '';
                $scope.make_item_list = '';
                $scope.detail_list = '';
                $scope.detail_selected = '';
                $scope.modify_success = '';
            }
        }

        $scope.modify_and_delete_work = function(position_order){
            $scope.position_order = position_order;
            $scope.modify_and_delete_button_status = !$scope.modify_and_delete_button_status;
        }

        $scope.check_left_top = function(y, x, ui){
            $scope.rectLeft = x;
            $scope.rectTop = y;
        }


        $scope.check_wid_hei = function(w, h, ui){
            $scope.rectWidth = w;
            $scope.rectHeight = h;
        }

        $scope.offset = function() {
            var rec = document.getElementById('current_modify_editor_img').getBoundingClientRect(),
                bodyElt = document.body;
            return {
                top: rec.top + bodyElt.scrollTop,
                left: rec.left + bodyElt.scrollLeft
            }
        };
        function disableF5(e) { if ((e.which || e.keyCode) == 116) e.preventDefault(); if( (event.ctrlKey == true && (event.keyCode == 78 || event.keyCode == 82))) e.preventDefault();}

        $scope.rect_position_modify_func = function(Objects, i){
             $scope.fk_item_idx = $scope.item_idx;
             $scope.position_order = Objects[i].position_order;
             $scope.rectLeft = Math.floor(Objects[i].x / (1920 / $scope.width_img));
             $scope.rectTop = Math.floor(Objects[i].y / (1080 / $scope.height_img));
             $scope.rectWidth = Math.floor(Objects[i].width / (1920 / $scope.width_img)) - $scope.rectLeft;
             $scope.rectHeight = Math.floor(Objects[i].height / (1080 / $scope.height_img)) - $scope.rectTop;
             $scope.editor_i = Objects[i].position_order;
             $scope.rectPosition.push({
                 item_idx: $scope.fk_item_idx,
                 position: $scope.image_frame,
                 p_order: $scope.position_order,
                 rectLeft: $scope.rectLeft * (1920/$scope.width_img),
                 rectTop: $scope.rectTop * (1080/$scope.h),
                 rectWidth: $scope.rectWidth * (1920/$scope.width_img)+($scope.rectLeft * (1920/$scope.width_img)),
                 rectHeight: $scope.rectHeight * (1080/$scope.height_img)+($scope.rectTop * (1080/$scope.height_img)),
             });
        }

        var image_area;
        $scope.canvas;
        var mouse = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };
        $scope.modify_drawing = false;
        $scope.modify_element = null;
        $scope.editor_i = 0;

        function setMousePosition(e) {
            var ev = e || window.event;
            mouse.x = e.clientX - image_area.getBoundingClientRect().x;
            mouse.y = e.clientY - image_area.getBoundingClientRect().y;
        };

        $scope.Add_Draw = function(editor_i){
            var multi_confirm = confirm("다른 영역을 추가하시겠습니까?");
            if(multi_confirm){
                $("#cancel_modify_position").css('display', 'flex');
                $("#adding_modify_position").css('display', 'none');
                $scope.init_Draw(editor_i);
            }else{
                $("#cancel_modify_position").css('display', 'none');
                $("#adding_modify_position").css('display', 'flex');
            }
        }

        $scope.Cancel_Draw = function(){
            $("#cancel_modify_position").css('display', 'none');
            $("#adding_modify_position").css('display', 'flex');
            $scope.editor_i = 0;
            $scope.modify_drawing = false;
            $scope.modify_element = null;
            $scope.canvas.style.cursor = "default";
            $scope.canvas_jq.children().remove();
        }

        $scope.init_Draw = function(editor_i) {
            $scope.editor_i = editor_i;
            $scope.canvas = document.getElementById('canvas_modify_editor');
            $scope.canvas_jq = $('#canvas_modify_editor');
            $scope.canvas.style.cursor = "crosshair";
            $scope.modify_drawing = true;
            $scope.editor_i+=1;
            $scope.modify_element = null;

            $scope.canvas.onmousemove = function (e) {
                if(!$scope.modify_drawing) return;
                image_area = document.getElementsByClassName('current_modify_editor_img')[0];
                $scope.canvas = document.getElementById('canvas_modify_editor');
                setMousePosition(e);
                if ($scope.modify_element !== null) {
                    $scope.modify_element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
                    $scope.modify_element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
                    $scope.modify_element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
                    $scope.modify_element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
                    $scope.modify_element.style.border = '1px solid red';
                }
            }

            $scope.canvas.onmousedown = function (e) {
              if(!$scope.modify_drawing) return;
              mouse.startX = mouse.x;
              mouse.startY = mouse.y;
              $scope.modify_element = document.createElement('div');
              $scope.modify_element.className = 'modify_rectangle';
              $scope.modify_element.id = 'rect_'+$scope.editor_i;
              $scope.modify_element.style.left = mouse.x + 'px';
              $scope.modify_element.style.top = mouse.y + 'px';
              $scope.canvas.appendChild($scope.modify_element)
            }

            $scope.canvas.onmouseup = function(e){
              if ($scope.modify_element !== null) {
                $scope.width_img = $('#editors_modify_video')[0].clientWidth;
                $scope.height_img = $('#editors_modify_video')[0].clientHeight;
                var x = parseInt($scope.modify_element.style.left)*(1920/$scope.width_img);
                var y = parseInt($scope.modify_element.style.top)*(1080/$scope.height_img);
                var w = parseInt($scope.modify_element.style.width)*(1920/$scope.width_img)+x;
                var h = parseInt($scope.modify_element.style.height)*(1080/$scope.height_img)+y;
                $scope.modify_element = null;
                $scope.modify_drawing = false;
                $scope.canvas.style.cursor = "default";
                $("#cancel_modify_position").css('display', 'none');

                var insert_confirm = confirm('해당 영역을 추가하시겠습니까?')
                if(insert_confirm){
                    var api_insert_params = {};
                    api_insert_params['fk_item_idx'] = $scope.item_idx;
                    api_insert_params['fk_video_idx'] = $scope.selectedVideoItem.idx;
                    api_insert_params['item_position'] = $scope.image_frame;
                    api_insert_params['p_order'] = $scope.editor_i;
                    api_insert_params['p_time'] = $scope.p_time;
                    api_insert_params['rect_x'] = x;
                    api_insert_params['rect_y'] = y;
                    api_insert_params['rect_w'] = w;
                    api_insert_params['rect_h'] = h;
                    api_item_detail.save(api_insert_params, function(data){
                        if(data.status == 200){
                            $("#adding_modify_position").css('display', 'flex');
                            var all_Objects = data.objects[0].all_position;
                            var rect_position = data.objects[0].rect_position;
                            var image_path = ENV.webs + '/make_image/' + $scope.item_idx;
                            $rootScope.video_modify_rect = data.objects[0].rect_position;
                            $scope.rectPosition = [];
                            for(let i in data.objects[0].rect_position){
                                 $scope.rect_position_modify_func(rect_position, i)
                            }
                            $scope.canvas_jq.children().remove();
                            Modal.open(
                                'views/alert_modal.html',
                                'AlertCtrl',
                                'sisung',
                                {
                                    alertTitle: function () {
                                        return "성공";
                                    },
                                    alertMsg: function () {
                                        return "영역이 성공적으로 추가 되었습니다.";
                                    }
                                }
                            );
                        }
                    });
                }else{
                    $scope.modify_drawing = false;
                    $("#adding_modify_position").css('display', 'flex');
                    $("#cancel_modify_position").css('display', 'none');
                    $scope.canvas_jq.children().remove();
                }
              }
            }
        }

}).directive('modifyPosition', ['myConfig', 'myValue', function (myConfig, myValue) {
    return {
        restrict: 'E',
        template: '<div></div>',
        link: function postLink(scope, elem, attrs) {
            let position_order = $(this).data('position');
            elem.resizable({ handles: " n, e, s, w, ne, se, sw, nw"});
            elem.on('resizestop', function (event, ui) {
                var posOff = scope.offset(),
                newPosW = ui.size.width,
                newPosH = ui.size.height;
                scope.check_wid_hei(newPosW, newPosH);
            });
            elem.on('resize', function(event, ui){
                var newPosW = ui.size.width,
                newPosH = ui.size.height;
                scope.check_wid_hei(newPosW, newPosH);
            });
            elem.on('mouseover',function() {
                elem.addClass('enter');
            });
            elem.on('mouseleave',function() {
                elem.removeClass('enter');
            });
            elem.on('drag', function(event, ui){
                var posOff = scope.offset(),
                newPosX = ui.position.left,
                newPosY = ui.position.top;
                scope.check_left_top(newPosY, newPosX);
            });
            elem.on('dragstop',function(event,ui) {
                var posOff = scope.offset(),
                newPosX = ui.position.left,
                newPosY = ui.position.top;
                scope.check_left_top(newPosY, newPosX);
            });
            elem.draggable({containment: "#current_modify_editor_img"});
        }
    }
}]);