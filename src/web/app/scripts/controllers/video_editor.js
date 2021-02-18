'use strict';

angular.module('titanApp')
    .controller('VideoEditorCtrl', function ($scope, $window, $http, $filter, $route, $rootScope, $location, ENV, AuthService, api_video, api_item_position_detail, $timeout, api_item, api_video_capture, api_item_detail, api_progress_process, api_make_titan_video, $interval) {

//         $scope.user_id = AuthService.getUserId();
//         $scope.user_idx = AuthService.getIdx();
//
//         $rootScope.selectedItem = '';
        $scope.make_ai_level = 1;
        $scope.show_videoList = '';
        $scope.searchTitle = '';
        $scope.show_itemList = '';
        $scope.user_video_list = '';
        $scope.make_ai_video_search = '';
        $scope.make_ai_item_search = '';
        $scope.modify_success_list = [];
        $scope.selected_video = '';
        $scope.check_item = [];
        $scope.selected_item = '';
        $scope.video_image = 'https://img.youtube.com/vi//hqdefault.jpg';
        $scope.draw_image = 'https://img.youtube.com/vi//hqdefault.jpg';
        $scope.modeling_loading = false;
        $scope.modeling_progress = 0;
        $scope.start_time = '';
        $scope.end_time = '';

        $scope.enter_status = false;
        $scope.modify_rect_down = function(item, enter_status){
            $scope.position_order = item.position_order;
            $scope.enter_status = true;
            $("#meta_data_editor_btn").css('display', 'flex');
        }

        $scope.position_molra = function(s, e){
            if(s !== '' && e !== ''){
                var st = $scope.modify_success_list.findIndex(i => i.position_time_d == s);
                var et = $scope.modify_success_list.findIndex(i => i.position_time_d == e);

                $scope.position_modify = $scope.modify_success_list.slice(st, (et+1))
                $scope.modify_success_list = $scope.position_modify
            }else{
                console.log($scope.modify_success_list)
            }
        }

        $scope.position_editor_modify = function(x, y, w, h, position, iw, ih, item_idx, p_order, video_idx){
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
                    $scope.modify_rect = data.objects
                    $scope.rectPosition = [];
                    for(let i = 0; i < data.objects.length; i++){
                         $scope.rect_position_func(data.objects, i)
                    }
                }
            });
        }

        var api_video_params = {};
        api_video_params['user_idx'] = AuthService.getIdx();
        api_video_params['fk_group_idx'] = AuthService.getFkGroupIdx();
        api_video.get(api_video_params, function (data) {
            if(data.status == 200){
                $scope.show_videoList = data.objects;
            }
        });

        var api_item_params = {};
        api_item_params['user_idx'] = AuthService.getIdx();
        api_item_params['fk_group_idx'] = AuthService.getFkGroupIdx();
        api_item.get(api_item_params, function(data){
            if(data.status == 200){
                if(data.objects != undefined && data.objects != ''){
                    $scope.show_itemList = data.objects;
                }else{
                    $scope.show_itemList = '';
                }
            }
        });

        $scope.video_click = function(video){
            $scope.selected_video = video;
            $scope.video_image = 'https://img.youtube.com/vi/' + $scope.selected_video.video_url.substr(32, 11) + '/hqdefault.jpg';
            $scope.make_ai_level = 2;
        };

        $scope.item_check = function (item) {

        };

        $scope.item_click = function(item) {
            $scope.selected_item = item;
            $scope.item_idx = item.idx;
            $scope.make_ai_level = 3;
        };

        $scope.start_modeling = function () {
            $scope.modeling_loading = true;
            let api_item_params = {};
            api_item_params['video_idx'] = $scope.selected_video.idx;
            api_item_params['video_url'] = $scope.selected_video.video_url;
            api_item_params['fk_item_idx'] = $scope.selected_item.idx;

            api_make_titan_video.save(api_item_params, function(data){
                if(data.status == 200) {
                    $scope.make_ai_level = 4;
                    $scope.video_capture_func($scope.selected_video, $scope.selected_item);
                }
            });

            let api_params2 = {};
            let image_path = ENV.webs + '/make_image/' + $scope.selected_video.idx + '/';
            let video_image_path = image_path + 'images/';
            let draw_image_path = image_path + 'draw_images/';
            api_params2['fk_video_idx'] = $scope.selected_video.idx;
            $scope.progressTimer = $interval(function () {
                api_progress_process.get(api_params2, function (data) {
                    if (data.status == 200) {
                        let datas = data.objects[0];
                        if (datas.draw_img_name != '') {
                            $scope.video_image = video_image_path + datas.draw_img_name + '.jpg';
                            $scope.draw_image = draw_image_path + datas.draw_img_name + '.jpg';
                            $scope.modeling_progress = datas.progress;
                            $scope.progress = datas.progress;
                            if (datas.progress >= 95) {
                                $interval.cancel($scope.progressTimer);
                            }
                        }
                    }
                });
            }, 500);
        }


        $scope.video_capture_func = function(video, item){
            $scope.make_ai_level = 4;
            var api_params = {};
            api_params['video_idx'] = video.idx;
            api_params['fk_item_idx'] = item.idx;
            api_item_detail.get(api_params, function(data){
                if(data.status == 200){
                    $scope.detail_list = data.objects;
                    $scope.detail_selected = $scope.detail_list[0];
                    $scope.get_position_all(video, $scope.detail_selected);
                }
            });
//            var api_capture_params = {}
//            api_capture_params['video_idx'] = video.idx;
//            api_capture_params['item_idx'] = item.idx;
//
//            api_video_capture.save(api_capture_params, function(data){
//                if(data.status == 200){
//                    $scope.captured_video = data.objects;
//                    console.log(data.objects);
//                }
//            });
        }

        $scope.position_all = function(all_position){
            $scope.modify_success_list = all_position;
        }


        $scope.get_position_all = function(video, item){
            $scope.width_img = $('#current_modify_editor_img')[0].clientWidth;
            $scope.height_img = $('#current_modify_editor_img')[0].clientHeight;
            var api_params = {};
            $scope.image_frame = item.position;
            var i = 0;
            api_params['image_frame']= item.position;
            api_params['item_idx']= item.fk_item_idx;
            api_params['video_idx']= video.idx;
//            const list = document.querySelector('#modify_list');

//            function doSomething(diff) {
//              list.scrollLeft += (diff);
//            }

//            list.addEventListener('wheel', function(e) {
//              diff = e.deltaY;
//              if (!ticking) {
//                window.requestAnimationFrame(function() {
//                  doSomething(diff);
//                  ticking = false;
//                });
//              }
//              ticking = true;
//            }, { passive: true });
            for(var j in $scope.detail_list){
                $scope.modify_item_idx = $scope.detail_list[j].fk_item_idx;
                $scope.editor_i = $scope.detail_list[j].position_order;
                $scope.img_modify_url_current = ENV.webs + $scope.detail_list[j].draw_img_name;
                $scope.modify_success_list.push({
                    "position": $scope.detail_list[j].position,
                    "detail_index": $scope.detail_list[j].index,
                    "position_time": $scope.detail_list[j].position_time,
                    "position_time_d": $scope.detail_list[j].position_time_d,
                    "draw_img_name": $scope.detail_list[j].draw_img_name,
                    "display": "none",
                });
                $scope.modify_rect_position = $scope.modify_success_list;
            }

            for(var i in $scope.modify_success){
                $scope.rect_position_modify_func($scope.modify_success, i);
            }
        }

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

        $scope.item_position_rect_list = function(item_idx, item_position, video_idx){
            $scope.width_img = $('#current_modify_editor_img')[0].clientWidth;
            $scope.height_img = $('#current_modify_editor_img')[0].clientHeight;
            var api_params = {}
            api_params['item_idx'] = item_idx;
            api_params['video_idx'] = video_idx;
            api_params['image_frame'] = parseInt(item_position);
            api_item_position_detail.get(api_params, function(data){
                if(data.status == 200){
                    $scope.modify_rect = data.objects;
                    var Objects = data.objects;
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

        $scope.ItemModifyEditor = function(item, video_idx, item_idx){
            const list = document.querySelector('#modify_list');

//            function doSomething(diff) {
//              list.scrollLeft += (diff);
//            }
            var api_params = {};
            $scope.item_idx = item_idx;
            $scope.image_frame = parseInt(item.position);
            $scope.img_modify_url_current = ENV.webs + item.draw_img_name;
            $scope.item_position_rect_list(item_idx, $scope.image_frame, video_idx);
        }


// video_click 부분------------------------------------------------------------------------------
        // if($scope.main_model != ''){
            //     $scope.item_model_type.map(value => {value.text_color= "black"});
            //     $scope.item_add_able = false;
            //     $scope.make_video_title = item.video_title;
            //     $rootScope.current_time_youtube = 0;
            //     $rootScope.selectedItem = item;
            //     $scope.youtube_width = $("youtube iframe")[0].clientWidth;
            //     $scope.youtube_height = $("youtube iframe")[0].clientHeight;
            //     // $scope.youtube_canvas = $("#video_canvas")[0].clientWidth;
            //     $scope.youtube_if = $("#youtube_if")[0].clientWidth;
            //     $scope.calc_value = Math.floor(($scope.youtube_if-$scope.youtube_width)/2);
            //     $rootScope.meta_data_insert = true;
            //     $rootScope.item_rect_detection = '';
            //     $scope.showlib = true;
            //     angular.element('#meta_data_detector').css('display', 'none');
            //     angular.element('#item_detection').css('display', 'none');
            //     $scope.youtube_width = $("youtube iframe")[0].clientWidth;
            //     $scope.youtube_height = $("youtube iframe")[0].clientHeight;
            //     $scope.current_time = 0;
            //     $rootScope.current_time_youtube = 0;
            //     // $("#AIList").css('display', 'block');
            //     var indexModel = $scope.item_model_type.findIndex(item_model => item_model.value === String($scope.user_model));
            //     $scope.item_model_type[indexModel].text_color = "green";
            // }else{
            //     $scope.make_video_title = item.video_title;
            //     $rootScope.current_time_youtube = 0;
            //     $rootScope.meta_data_insert = true;
            //     $scope.item_add_able = false;
            //     $rootScope.selectedItem = item;
            //     $rootScope.item_rect_detection = '';
            //     $scope.showlib = true;
            //     $scope.show_item_lib = false;
            //     $scope.modellib = false;
            //     $("#AIList").css('display', 'block');
            //     // $('#video_canvas').css('display', 'flex');
            //     $('#video_canvas').css('background-color', 'unset');
            //     angular.element('#meta_data_detector').css('display', 'none');
            //     angular.element('#item_detection').css('display', 'none');
            //     $scope.youtube_width = $("#editors_insert_video")[0].clientWidth;
            //     $scope.youtube_height = $("#editors_insert_video")[0].clientHeight;
            //     $scope.current_time = 0;
            //     $rootScope.current_time_youtube = 0;
            // }
            // $scope.main_model_click();
//----------------------------------------------------------------------------------------------

//         $rootScope.loading_title = '';
//
//         $scope.img_editor_locker = [];
//         $scope.img_editor_locker_drawing = [];
//         $scope.img_editor_locker_not_drawing = [];
//         $scope.editor_locker_drawing = [];
//         $scope.insert_rect = [];
//         $scope.editor_locker = [];
//         $scope.rectPosition = [];
//         $scope.modify_rect = [];
//         $scope.All_modify_rect = [];
//
//         $scope.d_item_idx = 0;
//         $scope.youtube_width = 0;
//         $scope.youtube_height = 0;
//         $scope.ai_status = 0;
//         $scope.editor_i = 0;
//         $rootScope.current_time_youtube = 0;
//         $rootScope.make_titan_status = 200;
//         $rootScope.item_detect_status = 404;
//
//         $scope.make_video_title = "선택 없음";
//         $scope.make_model_title = "선택 없음";
//         $scope.make_item_title = "선택 없음";
//         $scope.ai_tooltip = "1. 모델 선택";
//         $scope.rect_display = "none";
//         $scope.modify_rect_display = "none";
//         $rootScope.selected_video_status_title = "상품 동영상 수";
//         $rootScope.prev_model_item = "이전 사용한 A.I.모델";
//
//         $scope.editor_title = '동영상 편집';
//
//         var _apiKey = "AIzaSyAmEqE9mZWPIY0qSIkQfHok7ugaR0t871s";
//
//         $rootScope.meta_data_insert = false;
//         $rootScope.loading_alert = false;
//         $scope.search_status = false;
//         $scope.search_value_status = false;
//         $scope.item_add_able = false;
//         $scope.item_detection = false;
//
//         $scope.item_model_type = [
//             {index: 0, item: '의류 AI 모델', value: '1', description: "데님 바지 모델", model_maker: "공유 모델", text_color: "black"},
//             {index: 1, item: '고전 AI 모델', value: '2', description: "고전 상품 모델", model_maker: "공유 모델", text_color: "black"},
//             {index: 2, item: '얼굴 AI 모델', value: '3', description: "얼굴 인식 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 3, item: '가방 AI 모델', value: '4', description: "구찌 가방 모델", model_maker: "공유 모델", text_color: "black"},
//             {index: 4, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 5, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 6, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 7, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 8, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 9, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 10, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 11, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 12, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 13, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//             {index: 14, item: '없는 AI 모델', value: '3', description: "구찌 가방 모델", model_maker: "사이트 관리자", text_color: "black"},
//         ];
//
//         $scope.showlib = true;
//         $scope.shared_status = false;
//         $scope.show_item_lib = false;
//         $scope.modellib = false;
//         $rootScope.playerCheck = false;
//         $scope.show_video_add = false;
//

//
//         $scope.shared_video_get = function(){
//             var api_params = {};
//             api_params['filter_editor'] = "shared";
//             api_params['filter_user_idx'] = $scope.user_idx;
//             api_video.get(api_params, function (data) {
//                 if(data.status == 200){
//                     $rootScope.show_videoList = data.objects;
//                     $rootScope.selected_video_status_title = "공유된 상품 동영상 수";
//                     $('#insert_video_item').css('display', 'none');
//                     $scope.shared_status = true;
//                     $scope.show_video_add = false;
//                     $scope.showlib = true;
//                 }
//             });
//         }

        // $scope.video_list_get = function(){

            // api_shape.get(null, function (data) {
            //     if(data.status == 200){

                // }
            // });
        // }
//
//         $scope.video_list_get();
//         $scope.item_list_get();
//
//         $scope.VideoShared = function(){
//             if($scope.showlib || $scope.show_video_add){
//                 $scope.show_video_add = false;
//                 $scope.shared_video_get();
//                 $scope.video_list = [];
//             }
//             $scope.editor_title = '공유된 영상';
//         }
//
//         $scope.VideoList = function(){
//             if($scope.showlib || $scope.show_video_add){
//                 $scope.show_video_add = false;
//                 $scope.video_list_get();
//                 $scope.video_list = [];
//                 $scope.editor_title = '내 동영상';
//             }
//         }
//
//         $scope.VideoAdd = function(){
//             $scope.show_video_add = true;
//             $scope.showlib = false;
//             $scope.editor_title = '동영상 추가';
//             $scope.search_status = false;
//             $scope.search_value_status = false;
//             $scope.searchTitle = '';
//         }
//
//         $scope.VideoSearch = function(searchTitle) {
//                 $scope.video_list = [];
//                 $scope.editor_title = '동영상 검색';
//                 if(searchTitle != '') {
//                     youtubeFactory.getVideosFromSearchByParams({
//                         q: searchTitle,
//                         maxResults: 100,
//                         key: _apiKey,
//                     }).then(function (data) {
//                         for (var itemKey in data.data.items) {
//                             var items = data.data.items[itemKey];
//                             $scope.video_list.push({
//                                 "videoId": items.id.videoId,
//                                 "title": items.snippet.title,
//                                 "channelTitle": items.snippet.channelTitle,
//                                 "description": items.snippet.description
//                             });
//                         }
//                     });
//                     $scope.searchTitle = '';
//                 var api_params = {};
//                 if(searchTitle){
//                     $scope.search_status = true;
//                     $scope.search_value_status = false;
//                     api_params['search_title'] = searchTitle;
//                     api_search_youtube.get(api_params, function(data){
//                         if(data.status == 200){
//                             $scope.search_status = false;
//                             $scope.search_value_status = false;
//                             if(data.objects != '' && data.objects != undefined){
//                                 $scope.video_list = data.objects;
//                             }else{
//                                 $scope.video_list = [];
//                                 $scope.searchTitle = '';
//                                 $scope.search_status = false;
//                                 $scope.search_value_status = true;
//                             }
//                         }else{
//                             if(data.objects != '' && data.objects != undefined){
//                                 $scope.video_list = data.objects;
//                                 $scope.search_status = false;
//                                 $scope.search_value_status = false;
//                             }else{
//                                 $scope.video_list = [];
//                                 $scope.searchTitle = '';
//                                 $scope.search_status = false;
//                                 $scope.search_value_status = true;
//                             }
//                         }
//                     })
//                 }
//             }
//         }
//
//         $scope.AIList = function(video){
//             if($rootScope.selectedItem != ''){
//                 if ($("#AIList").css('display') == 'block'){
//                     $("#AIList").css('display', 'none');
//                 }else if ($("#AIList").css('display') == 'none'){
//                     $("#AIList").css('display', 'block');
//                 }
//             }else{
//                 Modal.open(
//                     'views/alert_modal.html',
//                     'AlertCtrl',
//                     'choiC',
//                     {
//                         alertTitle: function () {
//                             return '선택 없음';
//                         },
//                         alertMsg: function () {
//                             return '사용하실 동영상을 먼저 선택해주세요';
//                         }
//                     }
//                 );
//             }
//         }
//
//         function removeDuplicates(originalArray, prop) {
//              var newArray = [];
//              var lookupObject  = {};
//
//              for(var i in originalArray) {
//                 lookupObject[originalArray[i][prop]] = originalArray[i];
//              }
//
//              for(i in lookupObject) {
//                  newArray.push(lookupObject[i]);
//              }
//               return newArray;
//          }
//
//         $scope.ItemEditorDetection = function(main) {
//             if(main == undefined){
//                 Modal.open(
//                     'views/alert_modal.html',
//                     'AlertCtrl',
//                     'choiC',
//                     {
//                         alertTitle: function () {
//                             return '선택 없음';
//                         },
//                         alertMsg: function () {
//                             return 'A.I.모델을 선택해주세요';
//                         }
//                     }
//                 );
//             }else{
//                 $rootScope.image_capture = [];
//                 $scope.img_editor_locker = [];
//                 $scope.img_editor_locker_drawing = [];
//                 $scope.editor_locker = [];
//                 $scope.editor_locker_second = [];
//                 $rootScope.image_capture_status = 404;
//                 angular.element('#item_detection').css('display', 'none');
//                 angular.element('#meta_data_detector').css('display', 'none');
//                 $scope.item_detection = !$scope.item_detection;
//             }
//         };
//
//         $scope.itemAdd = function(selectedItem, make_item, make_item_idx, main) {
//             $(".add_ai").css("display", "none");
//             if(make_item != undefined){
//                 var item_insert = confirm($scope.make_item_title+'을 등록 하시겠습니까?');
//                 if(item_insert){
//                     // $(".progress").css("display", "flex");
//                     $("#editor_list").css("display", "flex");
//
//                     $scope.rect_display = "flex";
//                     $rootScope.make_titan_status = 404;
//                     $rootScope.item_detect_status = 200;
//                     if(make_item != undefined){
//                         $scope.item_add_able = true;
//                         if($rootScope.current_time_youtube != 0){
//                             $rootScope.local_player.seekTo(parseFloat($rootScope.current_time_youtube));
//                             $rootScope.local_player.pauseVideo();
//                         }
//                         $('#editors_select_title').css('display', 'none');
//                         let diff = 0;
//                         let ticking = false;
//
//                         const list = document.querySelector('#editor_list');
//
//                         function doSomething(diff) {
//                           list.scrollLeft += (diff);
//                         }
//
//                         list.addEventListener('wheel', function(e) {
//                           diff = e.deltaY;
//                           if (!ticking) {
//                             window.requestAnimationFrame(function() {
//                               doSomething(diff);
//                               ticking = false;
//                             });
//                           }
//                           ticking = true;
//                         }, { passive: true });
//                         $scope.img_editor_locker = [];
//                         $scope.img_editor_locker_drawing = [];
//                         $scope.editor_locker = [];
//                         $scope.image_capture_status = 204;
//                         angular.element('#video_cap_img').css('display', 'none');
//                         angular.element('#editors_none').css('display', 'none');
//                         angular.element('#current_editor_img').css('display', 'flex');
//                         angular.element('#item_detection').css('display', 'none');
//                         angular.element('#editors_title').css('display', 'flex');
//                         // angular.element('#video_canvas').css('display', 'flex');
//                         $('#play_btn').attr('disabled', true);
//                         $scope.showlib = false;
//                         $scope.show_item_lib = false;
//                         $rootScope.meta_data_insert = true;
//
//                         var api_params = {};
//                         var video_url = selectedItem.video_url;
//                         api_params['video_idx'] = selectedItem.idx;
//                         api_params['video_url'] = video_url;
//                         api_params['fk_user_idx'] = AuthService.getIdx();
//                         api_params['getSession'] = 1;
//                         $scope.video_id = video_url.substr(32, 11);
//                         api_params['fk_item_idx'] = make_item_idx;
//                         if(main != '')
//                             api_params['model_title'] = main;
//                         else
//                             api_params['model_title'] = $scope.user_model;
//
//                         api_make_titan_video.save({}, api_params, function(data){
//                            if(data.status == 200){
//                                $rootScope.make_titan_status = 200;
//                                $rootScope.item_detect_status = 404;
//                                angular.element('#all_drop').css('display', 'flex');
//                                $(".position_btn").css('cursor', 'pointer');
//                                $scope.rect_display = "none";
//                                $scope.modify_rect_display = "none";
//                                var image_path = ENV.webs + '/make_image/' + data.objects[0].item_idx;
//                                var Objects = data.objects;
//                                for(var i in data.objects){
//                                    $scope.img_editor_locker.push({
//                                         "image_frame": parseInt(data.objects[i].position),
//                                         "draw_name": data.objects[i].position,
//                                         "position_time": data.objects[i].position_time,
//                                         "current_time": parseInt(data.objects[i].position_time),
//                                         "fk_item_idx": data.objects[0].item_idx,
//                                         "draw_image": image_path+'/images/'+data.objects[i].position+".jpg",
//                                         // "border_color": "5px solid #87ceeb",
//                                         "border_color": "5px solid #fff",
//                                         "display": "none"
//                                      });
//                                      $scope.rect_display = "flex";
//                                      $scope.modify_rect_display = "flex";
//                                      $scope.img_editor_locker_not_drawing.push({
//                                         "image_frame": parseInt( data.objects[i].position),
//                                         "draw_name":  data.objects[i].position,
//                                         "position_time": data.objects[i].position_time,
//                                         "current_time": parseInt(data.objects[i].position_time),
//                                         "fk_item_idx":  data.objects[0].item_idx,
//                                         "draw_image": image_path+'/images/'+ data.objects[i].position+".jpg",
//                                         "border_color": "5px solid #fff",
//                                         "display": "none"
//                                      });
//                                }
//                                // $scope.editor_locker_all = Array.from(new Set($scope.img_editor_locker.map(JSON.stringify))).map(JSON.parse);
//                                $scope.editor_locker_all = $scope.img_editor_locker;
//                                $scope.editor_locker = $scope.editor_locker_all;
//                                $scope.editor_locker_drawing = [];
//                                // $scope.editor_locker_drawing = Array.from(new Set($scope.img_editor_locker_drawing.map(JSON.stringify))).map(JSON.parse);
//                                // $scope.editor_locker_not_drawing = Array.from(new Set($scope.img_editor_locker_not_drawing.map(JSON.stringify))).map(JSON.parse);
//                                $scope.editor_locker_not_drawing = $scope.img_editor_locker_not_drawing;
//                                $scope.img_url_current = image_path + '/images/' + data.objects[0].position + '.jpg';
//                            }
//                         });
//                         // var api_params2 = {};
//                         // var image_path = ENV.webs + '/make_image/' + make_item_idx;
//                         //
//                         // api_params2['item_idx'] = make_item_idx;
//                         // api_params2['fk_video_idx'] = selectedItem.idx;
//                         // api_params2['fk_user_idx'] = AuthService.getIdx();
//                         //
//                         // $scope.progressTimer = setInterval(function (){
//                         //    api_progress_process.get(api_params2, function (data) {
//                         //       if(data.status == 200){
//                         //          $scope.rect_display = "none";
//                         //          $scope.modify_rect_display = "none";
//                         //          if(data.objects[0].draw_img_name != "" && data.objects[0].draw_img_name != undefined){
//                         //              var Objects = data.objects;
//                         //              $scope.position_time = data.objects[0].position_time;
//                         //              $scope.EditorObjects = data.objects;
//                         //              $rootScope.item_rect_detection = data.objects;
//                         //              $rootScope.make_titan_status = 403;
//                         //              $rootScope.item_detect_status = 200;
//                         //              $scope.img_url_current = image_path + '/images/' + Objects[0].draw_img_name + '.jpg';
//                         //              $rootScope.local_player.seekTo(parseFloat(Objects[0].position_time), true);
//                         //              if(Objects[0].check){
//                         //                  $scope.img_editor_locker.push({
//                         //                     "image_frame": parseInt(Objects[0].draw_img_name),
//                         //                     "draw_name": Objects[0].draw_img_name,
//                         //                     "position_time": Objects[0].position_time,
//                         //                     "current_time": parseInt(Objects[0].position_time),
//                         //                     "fk_item_idx": Objects[0].fk_item_idx,
//                         //                     "draw_image": image_path+'/draw_images/'+Objects[0].draw_img_name+".jpg",
//                         //                     "border_color": "5px solid #87ceeb",
//                         //                     "display": "none"
//                         //                  });
//                         //                  $scope.img_editor_locker_drawing.push({
//                         //                     "image_frame": parseInt(Objects[0].draw_img_name),
//                         //                     "draw_name": Objects[0].draw_img_name,
//                         //                     "position_time": Objects[0].position_time,
//                         //                     "current_time": parseInt(Objects[0].position_time),
//                         //                     "fk_item_idx": Objects[0].fk_item_idx,
//                         //                     "draw_image": image_path+'/draw_images/'+Objects[0].draw_img_name+".jpg",
//                         //                     "border_color": "5px solid #87ceeb",
//                         //                     "display": "none"
//                         //                  });
//                         //                  $scope.rect_display = "flex";
//                         //                  $scope.modify_rect_display = "flex";
//                         //              }else{
//                         //                  $scope.img_editor_locker.push({
//                         //                     "image_frame": parseInt(Objects[0].draw_img_name),
//                         //                     "draw_name": Objects[0].draw_img_name,
//                         //                     "position_time": Objects[0].position_time,
//                         //                     "current_time": parseInt(Objects[0].position_time),
//                         //                     "fk_item_idx": Objects[0].fk_item_idx,
//                         //                     "draw_image": image_path+'/images/'+Objects[0].draw_img_name+".jpg",
//                         //                     "border_color": "5px solid #fff",
//                         //                     "display": "none"
//                         //                  });
//                         //                  $scope.img_editor_locker_not_drawing.push({
//                         //                     "image_frame": parseInt(Objects[0].draw_img_name),
//                         //                     "draw_name": Objects[0].draw_img_name,
//                         //                     "position_time": Objects[0].position_time,
//                         //                     "current_time": parseInt(Objects[0].position_time),
//                         //                     "fk_item_idx": Objects[0].fk_item_idx,
//                         //                     "draw_image": image_path+'/images/'+Objects[0].draw_img_name+".jpg",
//                         //                     "border_color": "5px solid #fff",
//                         //                     "display": "none"
//                         //                  });
//                         //                  $scope.rect_display = "none";
//                         //                  $scope.modify_rect_display = "none";
//                         //              }
//                         //             $scope.editor_locker_all = Array.from(new Set($scope.img_editor_locker.map(JSON.stringify))).map(JSON.parse);
//                         //             $scope.editor_locker = $scope.editor_locker_all;
//                         //             $scope.editor_locker_drawing = Array.from(new Set($scope.img_editor_locker_drawing.map(JSON.stringify))).map(JSON.parse);
//                         //             $scope.editor_locker_not_drawing = Array.from(new Set($scope.img_editor_locker_not_drawing.map(JSON.stringify))).map(JSON.parse);
//                         //             $scope.w = $('#current_editor_img')[0].clientWidth;
//                         //             $scope.h = $('#current_editor_img')[0].clientHeight;
//                         //          }else{
//                         //              $scope.rect_display = "none";
//                         //              $scope.modify_rect_display = "none";
//                         //          }
//                         //          var time = parseInt($scope.position_time);
//                         //          var hour = Math.floor(time / 3600),
//                         //          minutes = Math.floor((time - (hour * 3600)) / 60),
//                         //          seconds = time - (hour * 3600) - (minutes * 60);
//                         //
//                         //          hour = hour < 10 ? '0' + hour : hour;
//                         //          minutes = minutes < 10 ? '0' + minutes : minutes;
//                         //          seconds = seconds < 10 ? '0' + seconds : seconds;
//                         //          $('#current-time').text(String(hour+":"+minutes+":"+seconds));
//                         //          $('#editor_list').animate({scrollLeft: $('#editor_list').prop("scrollWidth")}, 100);
//                         //          $('#editor_time_list').animate({scrollLeft: $('#editor_time_list').prop("scrollWidth")}, 100);
//                         //          $scope.ai_status = data.objects[0].progress;
//                         //          if($scope.ai_status == 100){
//                         //              $rootScope.make_titan_status = 200;
//                         //              $rootScope.item_detect_status = 404;
//                         //              progress_timer_clear($scope.progressTimer);
//                         //          }
//                         //       }
//                         //    });
//                         // },500);
//                     }
//                 }else{
//                     $scope.rect_display = "none";
//                 }
//             }else if($scope.show_itemList == undefined && $scope.show_itemList == ''){
//                 var item_check = confirm("상품을 추가하시겠습니까?");
//                 if(item_check){
//                     $location.path("/manage/item_check", true);
//                     $modalInstance.dismiss('cancel');
//                 }else{
//                     $modalInstance.dismiss('cancel');
//                     Modal.open(
//                         'views/alert_modal.html',
//                         'AlertCtrl',
//                         'choiC',
//                         {
//                             alertTitle: function () {
//                                 return '종료';
//                             },
//                             alertMsg: function () {
//                                 return '추가된 상품이 없어서 종료합니다.';
//                             }
//                         }
//                     );
//                 }
//             }else if(make_item == undefined){
//                 Modal.open(
//                     'views/alert_modal.html',
//                     'AlertCtrl',
//                     'choiC',
//                     {
//                         alertTitle: function () {
//                             return '선택 없음';
//                         },
//                         alertMsg: function () {
//                             return '상품 아이템을 선택해주세요';
//                         }
//                     }
//                 );
//             }
//         }
//
//         $scope.enter_status = false;
//         $scope.modify_rect_down = function(item, enter_status){
//             $scope.position_order = item.position_order;
//             $scope.enter_status = true;
//             $("#meta_data_editor_btn").css('display', 'flex');
//         }
//
//         var progress_timer_clear = function(progressTimer){
//             clearInterval(progressTimer);
//             $(".position_btn").css('cursor', 'pointer');
//             $scope.rect_display = "none";
//             $scope.modify_rect_display = "none";
//             Modal.open(
//                 'views/alert_modal.html',
//                 'AlertCtrl',
//                 'choiC',
//                 {
//                     alertTitle: function () {
//                         return '추가 성공';
//                     },
//                     alertMsg: function () {
//                         return '메타 데이터의 추가가 성공적으로 끝났습니다.';
//                     }
//                 }
//             );
//         }
//
         $scope.rect_position_func = function(Objects, i){
              $scope.fk_item_idx = $scope.item_idx;
              $scope.image_frame = Objects[i].position;
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
                  rectLeft: $scope.rectLeft * (1920/$scope.w),
                  rectTop: $scope.rectTop * (1080/$scope.h),
                  rectWidth: $scope.rectWidth * (1920/$scope.w)+($scope.rectLeft * (1920/$scope.width_img)),
                  rectHeight: $scope.rectHeight * (1080/$scope.h)+($scope.rectTop * (1080/$scope.height_img)),
              });
         }
//
//         $scope.ItemEditor = function(item, video_idx){
//             $scope.editor_locker_drawing.map(value => {value.display= "none"});
//             $scope.editor_locker_all.map(value => {value.display= "none"});
//             $scope.editor_locker.map(value => {value.display= "none"});
//             $scope.editor_locker_not_drawing.map(value => {value.display= "none"});
//
//             $("#adding_position").css('display', 'none');
//             $scope.drawing = false;
//             $scope.canvas = document.getElementById('canvas_editor');
//             $scope.canvas_jq = $('#canvas_editor');
//             $rootScope.item_rect_detection = '';
//             $scope.EditorObjects = [];
//             $scope.modify_rect = [];
//             $('#item_detection').css('display', 'none');
//             $('.item_div').css('display', 'none');
//             $('.meta_data_editor_btn').css('display', 'none');
//             $scope.youtube_width = $("youtube iframe")[0].clientWidth;
//             $scope.youtube_height = $("youtube iframe")[0].clientHeight;
//             $scope.tag_name = $("youtube iframe")[0];
//             $scope.w = $('#current_editor_img')[0].clientWidth;
//             $scope.h = $('#current_editor_img')[0].clientHeight;
//             var api_params = {};
//
//             $scope.item_idx = item.fk_item_idx;
//             // console.log($scope.item_idx);
//             $scope.image_frame = parseInt(item.draw_name);
//             $scope.p_time = item.position_time;
//             // $scope.img_url_current = ENV.webs + '/make_image/'+ String(item.fk_item_idx) + '/images/' + item.draw_name + '.jpg';
//             $scope.img_url_current = item.draw_image;
//             api_params['item_idx'] = $scope.item_idx;
//             api_params['video_idx'] = video_idx;
//             api_params['image_frame'] = parseInt(item.draw_name);
//             $rootScope.local_player.seekTo(parseFloat($scope.p_time));
//             var time = parseInt($scope.p_time);
//
//             var hour = Math.floor(time / 3600),
//             minutes = Math.floor((time - (hour * 3600)) / 60),
//             seconds = time - (hour * 3600) - (minutes * 60);
//
//             hour = hour < 10 ? '0' + hour : hour;
//             minutes = minutes < 10 ? '0' + minutes : minutes;
//             seconds = seconds < 10 ? '0' + seconds : seconds;
//             $('#current-time').text(String(hour+":"+minutes+":"+seconds));
//             if($rootScope.local_player.getPlayerState() == 1){
//                 $rootScope.local_player.pauseVideo();
//             }
//             if($scope.canvas.hasChildNodes()){
//                 $scope.canvas_jq.children().remove();
//             }
//
//             api_item_position_detail.get(api_params, function(data){
//                 if(data.status == 200){
//                     if(data.objects != '' && data.objects != undefined){
//                         // var image_path = ENV.webs + '/make_image/' + data.objects[0].fk_item_idx;
//                         // for(var i in data.objects){
//                         //     $scope.editor_locker_drawing.push({
//                         //         "image_frame": parseInt(data.objects[i].position),
//                         //         "draw_name": data.objects[i].position,
//                         //         "position_time": data.objects[i].position_time,
//                         //         "current_time": parseInt(data.objects[i].position_time),
//                         //         "fk_item_idx": data.objects[i].fk_item_idx,
//                         //         "draw_image": image_path+'/images/'+data.objects[i].position+".jpg",
//                         //         "border_color": "5px solid #87ceeb",
//                         //         "display": "inline-block"
//                         //     });
//                         // }
//                         // $scope.editor_locker_all = Array.from(new Set($scope.img_editor_locker.map(JSON.stringify))).map(JSON.parse);
//                         // $scope.editor_locker_drawing = Array.from(new Set($scope.editor_locker_drawing.map(JSON.stringify))).map(JSON.parse);
//                         // $scope.editor_locker = $scope.editor_locker_all;
//                         // console.log($scope.editor_locker_all);
//                         var indexAll = $scope.editor_locker_all.findIndex(all => all.image_frame === $scope.image_frame);
//                         var index = $scope.editor_locker.findIndex(idx => idx.image_frame === $scope.image_frame);
//                         // var indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === $scope.image_frame);
//                         $scope.editor_locker_all[indexAll].display = "inline-block";
//                         $scope.editor_locker[index].display = "inline-block";
//                         // $scope.editor_locker_drawing[indexDraw].display = "inline-block";
//                         $("#adding_position").css('display', 'flex');
//                         $('#cancel_position').css('display', 'none');
//                         $scope.modify_rect = data.objects;
//                         var Objects = data.objects;
//                         $scope.rectPosition = [];
//                         for(let i = 0; i < Objects.length; i++){
//                              $scope.rect_position_func(Objects, i)
//                         }
//                     }else{
//                         // $scope.editor_locker_all = Array.from(new Set($scope.img_editor_locker.map(JSON.stringify))).map(JSON.parse);
//                         // $scope.editor_locker = $scope.editor_locker_all;
//                         // console.log($scope.editor_locker_all);
//                         // $scope.editor_locker_drawing = Array.from(new Set($scope.img_editor_locker_drawing.map(JSON.stringify))).map(JSON.parse);
//                         // $scope.editor_locker_not_drawing = Array.from(new Set($scope.img_editor_locker_not_drawing.map(JSON.stringify))).map(JSON.parse);
//                         // console.log($scope.editor_locker_not_drawing);
//                         var indexNotDraw = $scope.editor_locker_not_drawing.findIndex(notdraw => notdraw.image_frame === $scope.image_frame);
//                         var index = $scope.editor_locker.findIndex(idx => idx.image_frame === $scope.image_frame);
//                         var indexAll = $scope.editor_locker_all.findIndex(all => all.image_frame === $scope.image_frame);
//                         $scope.editor_locker_not_drawing[indexNotDraw].display = "inline-block";
//                         $scope.editor_locker[index].display = "inline-block";
//                         $scope.editor_locker_all[indexAll].display = "inline-block";
//                         // var add_confirm = confirm("현재 클릭하신 이미지에 영역이 없습니다. 영역을 추가하시겠습니까?");
//                         // if(add_confirm){
//                             indexNotDraw = $scope.editor_locker_not_drawing.findIndex(notdraw => notdraw.image_frame === $scope.image_frame);
//                             index = $scope.editor_locker.findIndex(idx => idx.image_frame === $scope.image_frame);
//                             indexAll = $scope.editor_locker_all.findIndex(all => all.image_frame === $scope.image_frame);
//                             $scope.editor_locker_not_drawing[indexNotDraw].display = "inline-block";
//                             $scope.editor_locker[index].display = "inline-block";
//                             $scope.editor_locker_all[indexAll].display = "inline-block";
//                             $('#adding_position').css('display', 'none');
//                             $('#cancel_position').css('display', 'flex');
//                             $scope.initDraw(0);
//                         // }else{
//                         //     indexNotDraw = $scope.editor_locker_not_drawing.findIndex(notdraw => notdraw.image_frame === $scope.image_frame);
//                         //     index = $scope.editor_locker.findIndex(idx => idx.image_frame === $scope.image_frame);
//                         //     indexAll = $scope.editor_locker_all.findIndex(all => all.image_frame === $scope.image_frame);
//                         //     $scope.editor_locker_not_drawing[indexNotDraw].display = "inline-block";
//                         //     $scope.editor_locker[index].display = "inline-block";
//                         //     $scope.editor_locker_all[indexAll].display = "inline-block";
//                         //     $('#adding_position').css('display', 'flex');
//                         //     $('#cancel_position').css('display', 'none');
//                         // }
//                     }
//                 }
//             });
//             // console.log($scope.item_rect_detection);
//         }
//
//         $scope.position_editor_modify = function(x, y, w, h, position, iw, ih, item_idx, p_order, video_idx){
//             // var drop_confirm = confirm('현재 영역을 수정하시겠습니까?');
//             //
//             // if(drop_confirm){
//                 $scope.dataStatus = 203;
//                 var api_params = {};
//                 api_params['fk_item_idx'] = item_idx;
//                 api_params['fk_video_idx'] = video_idx;
//                 api_params['item_position'] = position;
//                 api_params['p_order'] = p_order;
//                 api_params['rect_x'] = x * (1920/iw);
//                 api_params['rect_y'] = y * (1080/ih);
//                 api_params['rect_w'] = w * (1920/iw)+api_params['rect_x'];
//                 api_params['rect_h'] = h * (1080/ih)+api_params['rect_y'];
//                 api_item_detail.update(api_params, function(data){
//                     if(data.status == 200){
//                         $scope.dataStatus = data.status;
//                         $scope.modify_rect = data.objects
//                         $scope.rectPosition = [];
//                         for(let i = 0; i < data.objects.length; i++){
//                              $scope.rect_position_func(data.objects, i)
//                         }
//                         const indexLock = $scope.editor_locker_all.findIndex(lock => lock.image_frame === position);
//                         const index = $scope.editor_locker.findIndex(idx => idx.image_frame === position);
//                         const indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === position);
//                         $scope.editor_locker_all[indexLock].border_color = "5px solid green";
//                         $scope.editor_locker[index].border_color = "5px solid green";
//                         $scope.editor_locker_drawing[indexDraw].border_color = "5px solid green";
//                     }
//                 });
//             // }else{
//             //     alert("취소하였습니다.");
//             // }
//         }
//
//         function lpad(s, padLength, padString){
//             while(s.length < padLength)
//                 s = padString + s;
//             return s;
//         }
//
//         $scope.position_editor_delete = function(position, item_idx, p_order, video_idx){
//             var drop_confirm = confirm('현재 영역을 삭제하시겠습니까?');
//
//             if(drop_confirm){
//                 var api_params = {};
//
//                 api_params['rect_item_idx'] = item_idx;
//                 api_params['rect_video_idx'] = video_idx;
//                 api_params['rect_position'] = position;
//                 api_params['p_order'] = p_order;
//                 var image_path = ENV.webs + '/make_image/' + item_idx;
//                 api_item_detail.delete(api_params, function(data){
//                     if(data.status == 200){
//                         if(data.objects != '' && data.objects != undefined){
//                             $scope.dataStatus = data.status;
//                             // var um = $scope.editor_locker_not_drawing.filter(function (not_drawing) { return not_drawing.image_frame == position });
//                             $scope.modify_rect = data.objects;
//                             $scope.rectPosition = [];
//                             for(let i = 0; i < data.objects.length; i++){
//                                  $scope.rect_position_func(data.objects, i)
//                             }
//                             const indexLock = $scope.editor_locker_all.findIndex(lock => lock.image_frame === position);
//                             const index = $scope.editor_locker.findIndex(idx => idx.image_frame === position);
//                             const indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === position);
//                             $scope.editor_locker[index].border_color = "5px solid red";
//                             $scope.editor_locker_all[indexLock].border_color = "5px solid red";
//                             $scope.editor_locker_drawing[indexDraw].border_color = "5px solid red";
//                             $('#item_modify_div_'+p_order).css('display', 'none');
//                             $('#item_modify_div_video_'+p_order).css('display', 'none');
//                         }else{
//                             $scope.editor_locker_not_drawing.push({
//                                "image_frame": parseInt(position),
//                                "draw_name": lpad(String(position), 5, 0),
//                                "position_time": $scope.p_time,
//                                "current_time": parseInt($scope.p_time),
//                                "fk_item_idx": item_idx,
//                                "draw_image": image_path+'/images/'+lpad(String(position), 5, 0)+".jpg",
//                                "border_color": "5px solid #fff",
//                                "display": "inline-block"
//                             });
//                             $scope.editor_locker_not_drawing = Array.from(new Set($scope.editor_locker_not_drawing.map(JSON.stringify))).map(JSON.parse);
//                             $scope.editor_locker_not_drawing.sort(function(a, b) {
//                                 return a["image_frame"] - b["image_frame"];
//                             });
//                             $('.item_modify_div').css('display', 'none');
//                             // const indexNot = $scope.editor_locker_not_drawing.findIndex(notDraw => notDraw.image_frame === position);
//                             // const indexLock = $scope.editor_locker_all.findIndex(lock => lock.image_frame === position);
//                             // const indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === position);
//                             // const index = $scope.editor_locker.findIndex(idx => idx.image_frame === position);
//                             // if($scope.draw_stat != 2)
//                             //     $scope.editor_locker.splice(index, 1);
//                             // $scope.editor_locker_drawing.splice(indexDraw, 1);
//                             // $scope.editor_locker_all[indexLock].border_color = "5px solid #fff";
//                             // $scope.editor_locker_all[indexLock].display = "inline-block";
//                         }
//                     }
//                 });
//             }else{
//                 alert("취소하였습니다.");
//             }
//         }
//
//         $scope.position_editor_all_drop = function(rectPosition, item_idx, position, video_idx){
//             var drop_confirm = confirm('모든 영역을 삭제하시겠습니까?');
//
//             if(drop_confirm){
//                 var api_params = {};
//                 var image_path = ENV.webs + '/make_image/' + item_idx;
//
//                 for(var i in rectPosition){
//                     api_params['rect_item_idx'] = item_idx;
//                     api_params['rect_position'] = rectPosition[i].position;
//                     api_params['rect_video_idx'] = video_idx;
//                     api_params['p_order'] = rectPosition[i].p_order;
//                     api_item_detail.delete(api_params, function(data){
//                         if(data.status == 200){
//                             if(data.objects != '' && data.objects != undefined){
//                                 $scope.dataStatus = data.status;
//                                 // const indexLock = $scope.editor_locker_all.findIndex(lock => lock.image_frame === position);
//                                 // const index = $scope.editor_locker.findIndex(idx => idx.image_frame === position);
//                                 // const indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === position);
//                                 // $scope.editor_locker[index].border_color = "5px solid red";
//                                 // $scope.editor_locker_all[indexLock].border_color = "5px solid red";
//                                 // $scope.editor_locker_drawing[indexDraw].border_color = "5px solid red";
//                                 $('.item_modify_div').css('display', 'none');
//                             }else{
//                                 // $scope.editor_locker_not_drawing.push({
//                                 //    "image_frame": parseInt(position),
//                                 //    "draw_name": lpad(String(position), 5, 0),
//                                 //    "position_time": $scope.p_time,
//                                 //    "current_time": parseInt($scope.p_time),
//                                 //    "fk_item_idx": item_idx,
//                                 //    "draw_image": image_path+'/images/'+lpad(String(position), 5, 0)+".jpg",
//                                 //    "border_color": "5px solid #fff",
//                                 //    "display": "inline-block"
//                                 // });
//                                 $('.item_modify_div').css('display', 'none');
//                                 // $scope.editor_locker_not_drawing = Array.from(new Set($scope.editor_locker_not_drawing.map(JSON.stringify))).map(JSON.parse);
//                                 // $scope.editor_locker_not_drawing.sort(function(a, b) {
//                                 //     return a["image_frame"] - b["image_frame"];
//                                 // });
//                                 // const indexNot = $scope.editor_locker_not_drawing.findIndex(notDraw => notDraw.image_frame === position);
//                                 // const indexLock = $scope.editor_locker_all.findIndex(lock => lock.image_frame === position);
//                                 // const indexDraw = $scope.editor_locker_drawing.findIndex(draw => draw.image_frame === position);
//                                 // const index = $scope.editor_locker.findIndex(idx => idx.image_frame === position);
//                                 // if($scope.draw_stat != 2)
//                                 //     $scope.editor_locker.splice(index, 1);
//                                 // $scope.editor_locker_drawing.splice(indexDraw, 1);
//                                 // $scope.editor_locker_all[indexLock].border_color = "5px solid #fff";
//                                 // $scope.editor_locker_all[indexLock].display = "inline-block";
//                             }
//                         }
//                     });
//                 }
//             }else{
//                 alert("취소하였습니다.");
//             }
//         }
//
// //        $scope.youtube_duration = function(item){
// //             youtubeFactory.getVideoById({
// //                 videoId: item.video_url.substr(32, 11),
// //                 key: _apiKey,
// //             }).then(function (data) {
// //                 for (var itemKey in data.data.items) {
// //                     var items = data.data.items[itemKey];
// //                     $scope.dur = items.contentDetails.duration;
// //                     var time = msToTime(moment.duration($scope.dur).asMilliseconds())
// //                     $("#current-time").text('00:00:00')
// //                     $('#duration').text(time);
// //                 }
// //             });
// //        }
//
//         //밀리초 시간 계산
//         function msToTime(duration) {
//             var seconds = Math.floor((duration / 1000) % 60),
//             minutes = Math.floor((duration / (1000 * 60)) % 60),
//             hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
//
//             hours = (hours < 10) ? "0" + hours : hours;
//             minutes = (minutes < 10) ? "0" + minutes : minutes;
//             seconds = (seconds < 10) ? "0" + seconds : seconds;
//
//             return hours + ":" + minutes + ":" + seconds;
//         }
//
//
//         $scope.item_idx_click = function(item){
//             if(item.request_status){
//                 $scope.make_item_title = "선택 없음";
//                 Modal.open(
//                     'views/alert_modal.html',
//                     'AlertCtrl',
//                     'choiC',
//                     {
//                         alertTitle: function () {
//                             return '요청 안됨';
//                         },
//                         alertMsg: function () {
//                             return '해당 아이템의 요청이 완료되지 않았습니다.';
//                         }
//                     }
//                 );
//             }else {
//                 $scope.make_item_title = item.item_title;
//                 $scope.make_item_idx = item.idx;
//                 $scope.make_item = item;
//                 $scope.rect_display = "flex";
//                 $scope.itemAdd($rootScope.selectedItem, item, item.idx, $scope.main_model.value)
//             }
//                 // if($scope.item_add_able){
//                 // }else{
//                 //     Modal.open(
//                 //         'views/alert_modal.html',
//                 //         'AlertCtrl',
//                 //         'choiC',
//                 //         {
//                 //             alertTitle: function () {
//                 //                 return '추가';
//                 //             },
//                 //             alertMsg: function () {
//                 //                 return '상품 아이템의 영역을 아직 찾지 못했습니다.';
//                 //             }
//                 //         }
//                 //     );
//                 // }
//             // }
//         }
         //A.I. 선택하기
//         $scope.main_model_click = function(item, main){
//             var maein_model_click_confirm = confirm('이 동영상으로 하시겠습니까?');
//             // $rootScope.prev_model_item = "현재 A.I.모델";
//             if (maein_model_click_confirm){
//                 $scope.item_add_able = false;
//                 var api_params = {};
//
//                 $scope.show_item_lib = true;
//                 $scope.showlib = false;
//                 $scope.modellib = false;
//             }
//         //
//         //
//         //     //A.I. 검출(1)
//         //     api_params['fk_user_idx'] = $scope.user_idx;
//         //     api_params['main_model'] = main.value;
//         //     api_shape.save(api_params, function(data){
//         //         if(data.status == 200){
//         //             //A.I. 모델이 정상적으로 존재할 때 실행
//         //             if(data.objects[0].model_status){
//         //                 $scope.main_model = main;
//         //                 $scope.make_model_title = main.item;
//         //                 $scope.user_model = String(data.objects[0].user_model);
//         //                 $scope.current_time = 0;
//         //                 $rootScope.current_time_youtube = 0;
//         //                 //내가 가진 비디오가 있을 때
//         //                 if($scope.show_itemList !== '') {
//         //                     $scope.youtube_width = $("youtube iframe")[0].clientWidth;
//         //                     $scope.youtube_height = $("youtube iframe")[0].clientHeight;
//         //                     $scope.youtube_canvas = $("#video_canvas")[0].clientWidth;
//         //                     $scope.youtube_if = $("#youtube_if")[0].clientWidth;
//         //                     $scope.calc_value = Math.floor(($scope.youtube_if - $scope.youtube_canvas) / 2);
//         //                     $rootScope.meta_data_insert = true;
//         //                     $rootScope.loading_alert = true;
//         //                     // $('#video_canvas').css('display', 'flex');
//         //                     $('#video_canvas').css('display', 'none');
//         //                     $('#video_canvas').css('background-color', 'unset');
//         //                     $("#AIList").css('display', 'none');
//         //
//         //                     //상품 리스트 보여주기
//         //                     $scope.show_item_lib = true;
//         //                     $scope.showlib = false;
//         //                     $scope.modellib = false;
//         //
//         //                     $rootScope.item_detect_status = 200;
//         //                     $rootScope.make_titan_status = 404;
//         //                     $rootScope.loading_title = "로딩 중";
//         //                     var make_params = {};
//         //                     // main_model이 있을 때
//         //                     if ($scope.main_model != ''){
//         //                         make_params['model_title'] = main.value;
//         //                     }
//         //                     else
//         //                         make_params['model_title'] = $scope.user_model;
//         //                     make_params['fk_user_idx'] = AuthService.getIdx();
//         //                     make_params['video_url'] = "https://www.youtube.com/watch?v=" + item.video_url.substr(32, 11);
//         //                     api_make_titan_video.get(make_params, function (data) {
//         //                         if(data.status == 200) {
//         //                             $rootScope.item_detect_status = 200;
//         //                             $rootScope.make_titan_status = 404;
//         //                             $rootScope.item_rect = data.objects.boxes;
//         //                             if($rootScope.item_rect != '' && $rootScope.item_rect != undefined) {
//         //                                 $rootScope.item_rect_detection = data.objects.boxes;
//         //                                 $rootScope.item_rect_all = data.objects.boxes;
//         //                                 angular.element('#video_canvas').css('display', 'flex');
//         //                                 $rootScope.loading_alert = false;
//         //                                 $scope.item_add_able = true;
//         //                                 $rootScope.local_player.playVideo();
//         //                                 $rootScope.make_titan_status = 200;
//         //                                 $rootScope.item_detect_status = 404;
//         //                                 $scope.current_time = data.objects.current_time;
//         //                                 $rootScope.current_time_youtube = $scope.current_time;
//         //                             }else{
//         //                                 $rootScope.loading_alert = false;
//         //                                 $scope.item_add_able = false;
//         //                                 $('#video_canvas').css('display', 'flex');
//         //                                 $('#video_canvas').css('background-color', 'unset');
//         //                                 $rootScope.item_detect_status = 404;
//         //                                 $rootScope.make_titan_status = 200;
//         //                                 $rootScope.item_rect_detection = '';
//         //                             }
//         //                         }else if(data.status == 403){
//         //                             $rootScope.loading_title = "시간 초과";
//         //                             $scope.item_add_able = false;
//         //                             $('#video_canvas').css('display', 'flex');
//         //                             $('#video_canvas').css('background-color', 'unset');
//         //                             $rootScope.item_detect_status = 404;
//         //                             $rootScope.make_titan_status = 200;
//         //                             $rootScope.item_rect_detection = '';
//         //                         }else{
//         //                             $rootScope.loading_title = "모델 없음";
//         //                             $scope.item_add_able = false;
//         //                             $('#video_canvas').css('display', 'flex');
//         //                             $('#video_canvas').css('background-color', 'unset');
//         //                             $rootScope.item_detect_status = 404;
//         //                             $rootScope.make_titan_status = 200;
//         //                             $rootScope.item_rect_detection = '';
//         //                         }
//         //                     });
//         //                 }else{
//         //                     var insert_item = confirm('상품 아이템이 없습니다. 상품 관리로 이동하시겠습니까?');
//         //                     if(insert_item){
//         //                         $modalInstance.dismiss('cancel');
//         //                         $location.path('manage/item_check', true);
//         //                     }else{
//         //                         $modalInstance.dismiss('ok');
//         //                     }
//         //                 }
//         //             }else{
//         //                 $scope.main_model = '';
//         //                 $scope.make_model_title = '모델 없음';
//         //                 $scope.current_time = 0;
//         //                 $rootScope.current_time_youtube = 0;
//         //             }
//         //         }
//         //     });
//         //
//         }
//
         $scope.initial_editor = function(){
             angular.element('#meta_data_detector').css('display', 'none');
             $('#editor_list').css('display', 'none');
             angular.element('#item_detection').css('display', 'none');
             $scope.editor_title = '동영상 편집';
             $rootScope.item_rect_detection = '';
             $rootScope.make_titan_status = 200;
             $rootScope.item_detect_status = 404;
             $scope.img_editor_locker = [];
             $scope.img_editor_locker_drawing = [];
             $scope.img_editor_locker_not_drawing = [];
             $scope.editor_locker = [];
             $scope.editor_locker_not_drawing = [];
             $scope.editor_locker_all = [];
             $scope.editor_locker_drawing = [];
             $scope.EditorObjects = [];
             $scope.modify_rect = [];
             $rootScope.image_capture = [];
             $scope.make_item = undefined;
             $rootScope.selectedItem = '';
             $scope.make_item_title = '선택 없음';
             $scope.ai_status = 0;
             $scope.modellib = false;
             $scope.showlib = true;
             $scope.show_item_lib = false;
             $scope.item_add_able = false;
             $rootScope.meta_data_insert = false;
             if($scope.shared_status)
                 $('#insert_video_item').css('display', 'none')
             else
                 $('#insert_video_item').css('display', 'inline-block');
             $scope.img_url_current = "";
             angular.element('#current_editor_img').css('display', 'none');
             angular.element('#editors_none').css('display', 'block');
             angular.element('#default_img').css('display', 'block');
             angular.element('#editors_title').css('display', 'none');
             $(".position_btn").css('cursor', 'not-allowed');
             $('#cancel_position').css('display', 'none');
             $('.add_ai').css('display', 'flex');
             $(".progress").css("display", "none");
             $("#current-time").text('00:00:00');
             $('#duration').text('00:00:00');
         }

         $scope.first_work = function(){
             var first_work_confirm = confirm("처음 화면으로 돌아가시겠습니까?");
             if(first_work_confirm){
                 $scope.initial_editor();
             }
         }

         $scope.metaDataCancel = function(make_titan_status){
             var add_cancel = confirm('처음 화면으로 돌아갑니다. 정말 취소 하시겠습니까?');
             var api_params = {};
             if(add_cancel){
                 if(make_titan_status == 403){
                     clearInterval($scope.progressTimer);
                     api_params['d_progress_item_idx'] = $scope.make_item_idx;
                     api_progress_process.delete(api_params, function(data){
                         if(data.status == 200){
                             $scope.initial_editor();
                         }
                     });
                 }
             }
         }

         $scope.initial_video = function(close_status){
             $rootScope.selectedItem = '';
             $rootScope.item_rect_detection = '';
             $scope.make_item = undefined;
             $scope.item_add_able = false;
             $rootScope.meta_data_insert = false;
             if($scope.shared_status)
                 $('#insert_video_item').css('display', 'none')
             else
                 $('#insert_video_item').css('display', 'inline-block');
             $(".position_btn").css('cursor', 'not-allowed');
             $('#Editors_content').focusout(function() {
                 $(document).unbind();
             });

             if(close_status == 0){
                 $route.reload();
             }else{
                 $window.location.reload();
             }
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
//
         $scope.back_editor = function(){
             if($rootScope.make_titan_status === 200 || $rootScope.item_detect_status === 404){
 //                let backWork = confirm('이전 작업으로 이동하시겠습니까?');
                 if($scope.showlib){
                     $rootScope.loading_alert = false;
//                     Modal.open(
//                         'views/alert_modal.html',
//                         'AlertCtrl',
//                         'choiC',
//                         {
//                             alertTitle: function () {
//                                 return '이전 실패';
//                             },
//                             alertMsg: function () {
//                                 return '처음 단계입니다.';
//                             }
//                         }
//                     );
                 }else if($scope.show_item_lib) {
                     $scope.editor_title = '동영상 편집';
                     $rootScope.loading_alert = false;
                     $scope.showlib = true;
                     $scope.modellib = $scope.show_item_lib = false;
                     if($scope.shared_status)
                         $('#insert_video_item').css('display', 'none')
                     else
                         $('#insert_video_item').css('display', 'inline-block');
                     $scope.make_item = undefined;
                     $scope.make_item_title = '선택 없음';
                     $rootScope.selectedItem = '';
                     $("#current-time").text('00:00:00');
                     $('#duration').text('00:00:00');
                     $scope.make_item = undefined;
                     $scope.make_item_title = '선택 없음';
                     $rootScope.item_rect_detection = '';
                     // angular.element('#video_canvas').css('display', 'flex');
                     $rootScope.meta_data_insert = true;
                     $rootScope.local_player.stopVideo();
                 }
             }
//             else{
//                 Modal.open(
//                     'views/alert_modal.html',
//                     'AlertCtrl',
//                     'choiC',
//                     {
//                         alertTitle: function () {
//                             return '취소';
//                         },
//                         alertMsg: function () {
//                             return '취소 버튼을 클릭 후 종료해주세요';
//                         }
//                     }
//                 );
//             }
         }

         $(window).resize(function () {
             $timeout(function(){
                 $('#context1').css('display', 'none');
                 var editor_id = document.getElementById('current_modify_editor_img');
                 if(editor_id){
                     if($scope.rectPosition != '' || $scope.EditorObjects != '' || $rootScope.item_rect_detection != '' || $scope.modify_rect != ''){
                         $scope.w = $('#current_modify_editor_img')[0].clientWidth;
                         $scope.h = $('#current_modify_editor_img')[0].clientHeight;
                         $scope.youtube_if = $("#current_modify_editor_img")[0].clientWidth;
                         $scope.calc_value = Math.floor(($scope.youtube_if-$scope.youtube_canvas)/2);
                         for(var i in $scope.rectPosition){
                             $scope.rectLeft = Math.floor($scope.rectPosition[i].rectLeft / (1920 / $scope.w));
                             $scope.rectTop = Math.floor($scope.rectPosition[i].rectTop / (1080 / $scope.h));
                             $scope.rectWidth = Math.floor($scope.rectPosition[i].rectWidth / (1920 / $scope.w)) - $scope.rectLeft;
                             $scope.rectHeight = Math.floor($scope.rectPosition[i].rectHeight / (1080 / $scope.h)) - $scope.rectTop;
                         }
                     }
                 }
             }, 1);
         });

         $scope.close_func = function(close_stat){
             var editor_close;
             if($scope.ai_status != 100){
                 editor_close = confirm('해당 편집기를 종료하시겠습니까?');
             }else{
                 editor_close = confirm("지금까지 하신 작업을 끝내시고 정말로 종료하시겠습니까?");
             }
             if(editor_close){
                 $scope.item_detection = false;
                 if($rootScope.make_titan_status == 200 && $scope.ai_status !== 100){
                     $scope.initial_video(close_stat);
                     $modalInstance.dismiss('cancel');
                     $(document).off("keydown");
                 }else if($rootScope.make_titan_status == 200 && $scope.ai_status === 100){
                     $scope.initial_video(close_stat);
                     $modalInstance.dismiss('cancel');
                     $(document).off("keydown");
                 }else{
                     Modal.open(
                         'views/alert_modal.html',
                         'AlertCtrl',
                         'choiC',
                         {
                             alertTitle: function () {
                                 return '종료';
                             },
                             alertMsg: function () {
                                 return '실행 중인 작업이 있습니다.';
                             }
                         }
                     );
                 }
             }
         }

         $scope.close = function(make_titan_status){
             $scope.close_func(1);
         };


         $scope.item_drop = function(){
             $scope.make_item_title = "선택 없음";
             $scope.make_item = undefined;
         }

         var image_area;
         $scope.canvas;
         var mouse = {
             x: 0,
             y: 0,
             startX: 0,
             startY: 0
         };
         $scope.drawing = false;
         $scope.element = null;
         $scope.editor_i = 0;

         function setMousePosition(e) {
             var ev = e || window.event; //Moz || IE
             mouse.x = e.clientX - image_area.getBoundingClientRect().x;
             mouse.y = e.clientY - image_area.getBoundingClientRect().y;
         };

         $scope.multiDraw = function(editor_i){
             $scope.initDraw(editor_i);
         }

         $scope.CancelDraw = function(){
             $("#cancel_position").css('display', 'none');
             $scope.editor_i = 0;
             $scope.drawing = false;
             $scope.element = null;
             $scope.canvas.style.cursor = "default";
             $scope.canvas_jq.children().remove();
         }

         $scope.initDraw = function(editor_i) {
             $rootScope.local_player.pauseVideo();
             $scope.editor_i = editor_i;
             $scope.canvas = document.getElementById('canvas_editor');
             $scope.canvas_jq = $('#canvas_editor');
             $scope.canvas.style.cursor = "crosshair";
             $("#adding_position").css('display', 'flex');
             $scope.drawing = true;
             $scope.editor_i+=1;
             $scope.element = null;

             $scope.canvas.onmousemove = function (e) {
                 if(!$scope.drawing) return;
                 image_area = document.getElementsByClassName('current_editor_img')[0];
                 $scope.canvas = document.getElementById('canvas_editor');
                 setMousePosition(e);
                 if ($scope.element !== null) {
                     $scope.element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
                     $scope.element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
                     $scope.element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
                     $scope.element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
                     $scope.element.style.border = '1px solid red';
                 }
             }

             $scope.canvas.onmousedown = function (e) {
               if(!$scope.drawing) return;
               mouse.startX = mouse.x;
               mouse.startY = mouse.y;
               $scope.element = document.createElement('div');
               $scope.element.className = 'editor_rectangle';
               $scope.element.id = 'rect_'+$scope.editor_i;
               $scope.element.style.left = mouse.x + 'px';
               $scope.element.style.top = mouse.y + 'px';
               $scope.canvas.appendChild($scope.element)
             }

             $scope.canvas.onmouseup = function(e){
               if ($scope.element !== null) {
                 $scope.w = $('#current_editor_img')[0].clientWidth;
                 $scope.h = $('#current_editor_img')[0].clientHeight;
                 var x = parseInt($scope.element.style.left)*(1920/$scope.w);
                 var y = parseInt($scope.element.style.top)*(1080/$scope.h);
                 var w = parseInt($scope.element.style.width)*(1920/$scope.w)+x;
                 var h = parseInt($scope.element.style.height)*(1080/$scope.h)+y;
                 $scope.element = null;
                 $scope.drawing = false;
                     var api_insert_params = {};
                     api_insert_params['fk_item_idx'] = $scope.item_idx;
                     api_insert_params['fk_video_idx'] = $rootScope.selectedItem.idx;
                     // console.log($rootScope.selectedItem)
                     api_insert_params['item_position'] = $scope.image_frame;
                     api_insert_params['p_order'] = $scope.editor_i;
                     api_insert_params['p_time'] = $scope.p_time;
                     api_insert_params['rect_x'] = x;
                     api_insert_params['rect_y'] = y;
                     api_insert_params['rect_w'] = w;
                     api_insert_params['rect_h'] = h;
                     api_item_detail.save(api_insert_params, function(data){
                         if(data.status == 200){
                             var rect_position = data.objects[0].rect_position;
                             var image_path = ENV.webs + '/make_image/' + $scope.item_idx;
                             $scope.modify_rect = data.objects[0].rect_position;
                             $scope.rectPosition = [];
                             for(let i = 0; i < data.objects[0].rect_position.length; i++){
                                  $scope.rect_position_func(data.objects[0].rect_position, i)
                             }
                             for(let i in rect_position){
                                 if(rect_position[i].detail_exists){
                                     var editors_id = 0;
                                 }else{
                                     $scope.editor_locker_drawing.push({
                                         "image_frame": parseInt(rect_position[i].draw_img_name),
                                         "draw_name": rect_position[i].draw_img_name,
                                         "position_time": rect_position[i].position_time,
                                         "current_time": parseInt(rect_position[i].position_time),
                                         "fk_item_idx": rect_position[i].fk_item_idx,
                                         "draw_image": image_path+'/images/'+rect_position[i].draw_img_name+".jpg",
                                         "border_color": "5px solid #87ceeb",
                                         "display": "inline-block"
                                     });
                                 }
                             }
                             $scope.canvas_jq.children().remove();
                         }
                     });
               }
             }
         }

         $scope.position_selected = function(draw_stat){
             if(draw_stat == 0){
                 $scope.draw_stat = 0;
                 $scope.editor_locker = $scope.editor_locker_not_drawing;
             }else if(draw_stat == 1){
                 $scope.draw_stat = 1;
                 $scope.editor_locker = $scope.editor_locker_drawing;
             }else{
                 $scope.draw_stat = 2;
                 $scope.editor_locker = $scope.editor_locker_all;
             }
         }

         $scope.addDetail = function(video) {
             Modal.open(
                 'views/video_add_detail.html',
                 'VideoAddDetailCtrl',
                 'sisung',
                 {
                   video: function() {
                      return video;
                   },
                 },
             );
         }

     }).directive('modifyEditposition', ['myConfig', 'myValue', function (myConfig, myValue) {
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
//    });