'use strict';

angular.module('titanApp')
    .controller('AdminVideoCtrl', function ($scope, $rootScope, $window, $http,$filter, $location, $route, AuthService, youtubeFactory, ngTableParams, $timeout, api_admin_video_list, Modal, api_video, api_search_video, api_shape, api_item /*api_user_list, api_shape_list,api_shape_video_list,Modal,api_item_detail_list*/) {
        $scope.user_idx = AuthService.getIdx();
        $scope.search_title = '';
        $scope.but_title = '전체보기';
        $scope.all_count = 0;
        $scope.video_total = 0;
        $scope.not_list_message = '';
        $scope.listData = '';
        $scope.currentSearch = '';
        $scope.change_stat = 1;
        $scope.showVideo = 0;

        var _apiKey = "AIzaSyAfUtyjlvezoWXOKnrJKS-zyLJ3_j-vtVM";

        $scope.item = {
           star: false,
           favorite: false,
           bookmark: false
        };

        $scope.video_shared_change = [
            {index: 0, title:"공유함", value: 0},
            {index: 1, title:"공유하지 않음", value: 1}
        ]
        $scope.video_shared = $scope.video_shared_change[0];

        $scope.admin_video_list_table_headers = [
            {name: 'No', class_name: 'no', sortable: true, field: 'idx'},
            // {name: '동영상 썸네일', class_name: 'video_img', sortable: false, field: 'video_img'},
            {name: '동영상명', class_name: 'video_title', sortable: true, field: 'video_title'},
            {name: '영상 사용 설정', class_name: 'video_view', sortable: false, field: 'video_view'},
            {name: '추천 영상 설정', class_name: 'video_shared', sortable: false, field: 'video_shared'},
            {name: '수정/삭제', class_name: 'video_del', sortable: false, field: 'video_del'}
        ];

        $scope.status_change = function(){
            if($scope.change_stat == 1){
                $scope.change_stat = 2;
            }else{
                $scope.change_stat = 1;
            }
        }

        $scope.fk_group_idx = AuthService.getFkGroupIdx();
        if($scope.fk_group_idx == 1){
            $scope.user_name = AuthService.getUserName();
            $scope.auth_name = "관리자";
        }else{
            $scope.user_name = AuthService.getUserName();
            $scope.auth_name = "사용자님의 동영상";
        }

        $scope.select_jobgroup = null;
        $scope.election = null;
        $scope.video_list = null;
        $scope.item_count = 0;
        $scope.enable_idx = [];
        $scope.disable_idx = [];
        $scope.video_auto_pre = [];
        $scope.video_search_idx = [];
        $scope.video_drop_idx =[];
        $scope.enable_status_value = [];
        $scope.disable_status_value = [];
        $scope.video_search_status_value = [];
        $scope.youtube_viewCount = [];
        $scope.video_list_table_headers = [];
        $scope.video_click_table_headers = [];
        $scope.video_item_detail_list = null;
        $scope.video_status_change = 0;

        $scope.video_list_count = 18;
        // var params = $location.search();
        // $scope.order = params['order'] || '-';
        // $scope.order_by = params['order_by'] || 'uname'; //default order by

        $scope.filteredTodos = [];
        // $scope.currentPage = 1;
        // $scope.numPerPage = 10;
        // $scope.maxSize = 5;

        var parameters = {
            page: 1,
            count: 5,
            sorting: {
                name: 'asc'
            },
            filter: {
                name: ''
            }
        };
        $scope.dataObj = [];
        var api_params = {};
            api_params['user_idx'] = $scope.user_idx;
            api_params['fk_group_idx'] = $scope.fk_group_idx;
            api_params['enable'] = 0;
            api_admin_video_list.get(api_params, function (data) {
                if(data.status == 200) {
                    $timeout(function () {
                        $scope.video_check = data.objects;
                    }, 500);
                }
            });
        // if ($scope.videoListParams == undefined) {
        //
        //
        // $(function(){
        //     $('#back-to-top').on('click',function(e){
        //         e.preventDefault();
        //         $('html,body').animate({scrollTop:0},600);
        //     });
        //
        //     $(window).scroll(function() {
        //         if ($(document).scrollTop() > 100) {
        //           $('#back-to-top').addClass('show');
        //         } else {
        //           $('#back-to-top').removeClass('show');
        //         }
        //     });
        // });

        $scope.dataTypeConverter = function(date) {
            return date.toString()
        };

        $scope.closePopup = function() {
            $('.detail').css('display', 'none');
            $('#contents').attr('class', 'container module-default');
        };
        $scope.openPopup = function() {
            $('.detail').css('display', 'unset');
            $('#contents').attr('class', 'container module-detail');
        };

        $scope.selectedVideoItem = {};
        $scope.showVideoDetails = function(video) {
            $scope.selectedVideoItem = video;
            $scope.openPopup();
        };

        $scope.videoAutoPreview = function(item){
            var api_params = {};
            api_params['video_idx'] = item.idx;
            api_params['video_auto_preview'] = item.video_auto_preview;

            api_video.update(api_params, function(data){
                if(data.status==200){
                    $route.reload();
                }
            });
        };

        $scope.videoDetails = function (item, video_status) {
            Modal.open(
                'views/popup_common.html',
                'PopupYoutubeCtrl',
                'sisung',
                {
                    item: function () {
                        return item;
                    },
                    video_status: function () {
                        return video_status;
                    },
                    classification: function () {
                        return 't';
                    }
                }
            );
        };

        var api_params = {};
        $scope.all_video_list = function (video_list_count, limit_count) {
            if (video_list_count <= $scope.list_count)
                $scope.video_list_count += 16;
        };

        $scope.enable_video = function(item, video_status_change){
            if(video_status_change){
                api_params['video_status_change'] = 1;
                api_params['video_status_value'] = item.video_status_value;
                api_params['video_idx'] = item.idx;

                api_shape.update(api_params, function (data) {
                    if(data.status == 200){
                        Modal.open(
                            "views/alert_modal.html",
                            "AlertCtrl",
                            "sisung",
                            {
                                alertTitle: function(){
                                    return item.video_title;
                                },
                                alertMsg: function(){
                                    return "비활성화를 하셨습니다.";
                                }
                            }
                        );
                    }
                });
            }else{
                api_params['video_status_change'] = 0;
                api_params['video_status_value'] = item.video_status_value;
                api_params['video_idx'] = item.idx;

                api_shape.update(api_params, function (data) {
                    if(data.status == 200){
                        Modal.open(
                            "views/alert_modal.html",
                            "AlertCtrl",
                            "sisung",
                            {
                                alertTitle: function(){
                                    return item.video_title;
                                },
                                alertMsg: function(){
                                    return "활성화를 하셨습니다.";
                                }
                            }
                        );
                    }
                });
            }
        };

        var api_params = {};

        // $scope.searchEnter = function(currentSearch, e){
        //     if(e.keyCode === 13){
        //         // angular.element('#searchStatus').css('display', 'none');
        //         $scope.past_title = '이전 검색어';
        //         console.log($scope.past_title);
        //         if ($scope.videoEnterParams == undefined) {
        //             $scope.videoEnterParams = new ngTableParams(parameters, {
        //                 counts: [],
        //                 total: 0,// length of data
        //                 getData: function ($defer, parameters) {
        //                     var api_params = {};
        //                     api_params['video_idx'] = $scope.user_idx;
        //                     api_params['fk_group_idx'] = $scope.fk_group_idx;
        //                     api_params['search_title'] = $scope.currentSearch;
        //                     var sorting = parameters.sorting();
        //                     api_search_video.get(api_params, function (data) {
        //                         $timeout(function () {
        //                             parameters.total(data.meta.total_count);
        //                             $scope.adminVideoData = data.objects;
        //                             $defer.resolve(data.objects);
        //                             $scope.all_select = false;
        //                             $scope.video_idx = [];
        //                             $scope.video_status_value = [];
        //                         }, 500);
        //                     });
        //                 }
        //             });
        //         }else{
        //             $scope.videoEnterParams.reload();
        //         }
        //     }
        // }

        // $scope.searchClick = function(currentSearch){
        //     if ($scope.videoClickParams == undefined) {
        //         $scope.videoClickParams = new ngTableParams(parameters, {
        //             counts: [],
        //             total: 0,// length of data
        //             getData: function ($defer, parameters) {
        //                 var api_params = {};
        //                 api_params['limit'] = parameters.count();
        //                 api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
        //                 api_params['video_idx'] = $scope.user_idx;
        //                 api_params['fk_group_idx'] = $scope.fk_group_idx;
        //                 api_params['search_title'] = currentSearch;
        //                 var sorting = parameters.sorting();
        //                 api_search_video.get(api_params, function (data) {
        //                     $timeout(function () {
        //                         parameters.total(data.meta.total_count);
        //                         $scope.adminVideoData = data.objects;
        //                         console.log($scope.adminVideoData);
        //                         $defer.resolve(data.objects);
        //                         $scope.all_select = false;
        //                         $scope.video_idx = [];
        //                         $scope.video_status_value = [];
        //                     }, 500);
        //                 });
        //             }
        //         });
        //     }else{
        //         $scope.videoClickParams.reload();
        //     }
        // }

//        $scope.modify_meta_item = function (video_idx) {
//            Modal.open(
//                'views/video_editor.html',
//                'VideoEditorCtrl',
//                'sisung',
//                {
//                    video_idx: function(){
//                        return video_idx;
//                    }
//                }
//            );
//        }

        $scope.video_drop = function(){
            api_params['video_drop_idx'] = $scope.selectedVideoItem.idx;
            var drop_video = confirm('클릭하신 동영상을 정말로 삭제하시겠습니까?');
            if(drop_video){
                api_admin_video_list.delete(api_params, function(data){
                    if(data.status == 200){
                        $route.reload();
                    }
                });
            }else{
                alert('취소하셨습니다.');
            }
        }

        $scope.video_update = function(){
            api_params['idx'] = $scope.selectedVideoItem.idx;
            api_params['video_title'] = $scope.selectedVideoItem.video_title;
            api_params['video_status_value'] = $scope.selectedVideoItem.video_status_value;
            api_params['video_shared'] = $scope.selectedVideoItem.video_shared;
            api_params['video_status_change'] = $scope.selectedVideoItem.video_status_change;

            var update_video = confirm('클릭하신 동영상을 정말로 수정하시겠습니까?');
            if (update_video) {
                api_admin_video_list.update(api_params, function(data){
                    if(data.status == 200){
                        alert("성공적으로 변경 되었습니다.");
                        $route.reload();
                    } else if (data.status == 500) {
                        alert("변경이 이루어지지 않았습니다.");
                    }
                });
            } else {
                alert("취소하였습니다.")
            }
        };

        $scope.modify_meta_item = function(item) {
            var api_item_params = {};

            api_item_params['user_idx'] = AuthService.getIdx();
            api_item_params['fk_group_idx'] = AuthService.getFkGroupIdx();
            api_item_params['video_idx'] = item.idx;
            api_params['detail_exists'] = 'exists';
            api_item.get(api_item_params, function(data){
                if(data.status == 200){
                        if(data.objects.length > 0){
                            if(AuthService.getFkGroupIdx() != 1 && data.objects[0].fk_user_idx == AuthService.getIdx()){
                                Modal.open(
                                    'views/video_editor_modify.html',
                                    'VideoEditorModifyCtrl',
                                    'sisung',
                                    {
                                        video_idx: function(){
                                            return item;
                                        },
                                        selectedVideoItem: function(){
                                            return data.objects;
                                        }
                                    }
                                );
                            }else{
                                Modal.open(
                                    'views/alert_modal.html',
                                    'AlertCtrl',
                                    'sisung',
                                    {
                                        alertTitle: function () {
                                            return "권한";
                                        },
                                        alertMsg: function () {
                                            return "해당 상품 동영상 관리자에게 문의 후 수정/삭제 하실 수 있습니다.";
                                        }
                                    }
                                );
                            }
                        }else{
                            Modal.open(
                                'views/alert_modal.html',
                                'AlertCtrl',
                                'sisung',
                                {
                                    alertTitle: function () {
                                        return "없음";
                                    },
                                    alertMsg: function () {
                                        return "상품 아이템이 추가되지 않은 동영상입니다.";
                                    }
                                }
                            );
                        }
                }
            });
        }

        $scope.convertMilliSec = function(millisec) {
            var sec = millisec / 1000;
            var min = Math.floor(sec / 60);
            sec = sec % 60;

            return (min + ":" + sec).toString();
        };

        $scope.splitTime = function(time) {
            return time.split('T')[0]
        };

        $scope.refresh_list = function(){
            $route.reload();
        };

        $scope.videoAddPopup = function () {
            Modal.open(
                'views/popup_video_add.html',
                'PopupVideoAddCtrl',
                'sisung',
                {}
            )
        }
        //변수 선언
        var width;
        var height;
        var margin;
        // 페이지 로드시 자동실행
        $(window).ready(function () {
            $scope.change_video_list_height();
        });


        // 화면 리사이즈시 실행
        $(window).resize(function () {
            $scope.change_video_list_height();
        });

        $scope.change_video_list_height = function() {
            width = document.getElementById("contents").offsetWidth;
            margin = document.getElementById("contents").offsetLeft;
            if (margin == 260){
                height = document.getElementById("contents").offsetHeight - 195 +'px';
                document.getElementById("library-video-wrap").style.maxHeight = height;
            }
            else if (width <= 768) {
                height = document.getElementById("contents").offsetHeight - 135 +'px';
                document.getElementById("library-video-wrap").style.maxHeight = height;
            }
        }
});