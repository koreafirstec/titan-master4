'use strict';

angular.module('titanApp')
    .controller('VideoListCtrl', function ($scope, $rootScope, $window, $filter, $http, $location, $route, AuthService, ngTableParams, $timeout, api_video, Modal, youtubeFactory, api_admin_video_list, api_item, api_user, api_shape, api_shape_video_list/*,Modal,,api_item_detail_list*/) {
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.numberOfItem = 0;
        $scope.dataItemStatus = 200;
        $scope.item_check_main_type = [];
        $scope.modify_video_idx = [];
        $scope.modify_enabled = [];
        $scope.modify_disabled = [];
        $scope.video_lib = {};

        $scope.limitValue = function (limit) {
            $scope.modify_video_idx = [];
            angular.element('#library-check-all').attr("checked", false);
            $scope.limit_video = parseInt(limit);
        };

        $scope.user_idx = AuthService.getIdx();
        $scope.fk_group_idx = AuthService.getFkGroupIdx();

        $scope.search_title = '';
        $scope.itemOfVideo = {};
        $scope.noItem = true;

        $scope.search_video_title = '';

        $scope.FilterItems = [
            {
                itemValue: 0,
                text: "MY",
            },
            {
                itemValue: 1,
                text: "SHARED"
            },
            {
                itemValue: 2,
                text: "검색"
            }
        ];
        $scope.selectedFilter = $scope.FilterItems[0]; // 0 : 내 동영상 보기[default], 1: 공유된 영상 보기
        
        $scope.item_check_headers = [
            {name: 'No', class_name: 'no', sortable: true, field: 'no'},
            {name: '사용자 이름', class_name: 'user_name', sortable: true, field: 'user_name'},
            {name: '상품명', class_name: 'item_t itle', sortable: true, field: 'item_title'},
            {name: '판매가', class_name: 'item_price', sortable: true, field: 'item_price'},
            {name: '등록일', class_name: 'create_date', sortable: true, field: 'create_date'},
            {name: '상품 사용 설정', class_name: 'item_using', sortable: true, field: 'item_using'},
            {name: '상품 영역 상태', class_name: 'item_shape', sortable: true, field: 'item_shape'},
            {
                name: '구매/설명 url 설정',
                class_name: 'item_description_toggle',
                sortable: true,
                field: 'item_description_toggle'
            },
        ];

        var parameters = {
            page: 1,
            count: 10,
            sorting: {
                name: 'asc'
            }
        };

        $scope.add_item = function () {
            Modal.open(
                'views/popup_item_insert.html',
                'PopupItemInsertCtrl',
                'sisung',
                {}
            )
        };

        $scope.manage_item_change = function (item) {
            $scope.currentPage = 1;
            Modal.open(
                'views/popup_make.html',
                'PopupMakeCtrl',
                'sisung',
                {
                    item: function () {
                        return item.item_obj;
                    },
                    item_info: function () {
                        return item.item_obj;
                    },
                    item_video: function () {
                        return 1;
                    }
                }
            )
        };

        $scope.video_check_one = function (item) {
            if ($('#checkbox-20200519-pbg5cyca-' + String(item.idx)).is(":checked")) {
                $scope.modify_video_idx.push(parseInt(item.idx));
                $scope.modify_enabled.push(0);
                $scope.modify_disabled.push(1);
            } else {
                var video_list = $scope.modify_video_idx.indexOf(parseInt(item.idx));
                var video_en = $scope.modify_enabled.indexOf(0);
                var video_dis = $scope.modify_disabled.indexOf(1);
                $scope.modify_video_idx.splice(video_list, 1);
                $scope.modify_enabled.splice(video_en, 1);
                $scope.modify_disabled.splice(video_dis, 1);
            }
        };

        $scope.enable_video = function(item) {
            api_params['video_status_value'] = item.video_status_value;
            api_params['video_idx'] = item.idx;

            if(!item.video_status_value){
                $('#video_share_'+String(item.idx)).attr('disabled', true);
                api_params['video_status_change'] = 1;

            }else{
                $('#video_share_'+String(item.idx)).attr('disabled', false);
                api_params['video_status_change'] = 0;
            }

            api_admin_video_list.update(api_params, function (data) {});
        };

        $scope.video_check_all = function(video_list) {
//            var list = $filter('limitTo')(video_list, limit);
            let obj = '';
            $scope.modify_video_idx = [];
            $scope.modify_enabled = [];
            $scope.modify_disabled = [];
            if ($('#library-check-all').is(":checked")) {
                for (let i in video_list) {
                    obj = video_list[i];
                    $scope.modify_video_idx.push(parseInt(obj.idx));
                    $scope.modify_enabled.push(0);
                    $scope.modify_disabled.push(1);
                }
            } else {
                for (let i in video_list) {
                    obj = video_list[i];
                    var video_idx = $scope.modify_video_idx.indexOf(parseInt(obj.idx));
                    var video_en = $scope.modify_enabled.indexOf(0);
                    var video_dis = $scope.modify_disabled.indexOf(1);
                    $scope.modify_video_idx.splice(video_idx, 1);
                    $scope.modify_enabled.splice(video_en, 1);
                    $scope.modify_disabled.splice(video_dis, 1);
                }
            }
        }

        $scope.refresh_list = function () {
            $route.reload();
        };

        $scope.video_enable = function (video_idx, enabled) {
            if (video_idx != '' && enabled != '') {
                var change_item = confirm('정말로 변경하시겠습니까?');
                if(change_item) {
                    var api_params = {};

                    api_params['idx'] = video_idx;
                    api_params['video_abled'] = enabled;
                    api_video.update(api_params, function (data) {
                        if (data.status == 200) {
                            alert('성공적으로 변경되었습니다.');
                            $route.reload();
                        }
                    });
                }else {
                    alert('취소하셨습니다.');
                }
            }
        };

        $scope.video_disable = function (video_idx, disabled) {
            if (video_idx != '' && disabled != '') {
                var change_item = confirm('정말로 변경하시겠습니까?');
                if(change_item) {
                    var api_params = {};

                    api_params['idx'] = video_idx;
                    api_params['video_abled'] = disabled;
                    api_video.update(api_params, function (data) {
                        if (data.status == 200) {
                            alert('성공적으로 변경되었습니다.');
                            $route.reload();
                        }
                    });
                }else {
                    alert('취소하셨습니다.');
                }
            }
        };

        $scope.drop_video = function (video_idx) {
            if (video_idx != '') {
                var change_item = confirm('정말로 삭제하시겠습니까?');
                if(change_item) {
                    var api_drop_params = {};
                    api_drop_params['drop_idx'] = video_idx;
                    api_video.delete(api_drop_params, function (data) {
                        if (data.status == 200) {
                            alert('성공적으로 삭제되었습니다.');
                            $rootScope.show_videoList = '';
                            $route.reload();
                        }
                    });
                }else {
                    alert('취소하셨습니다.');
                }
            }
        };

        $scope.video_library_list = function (item, e) {
            $scope.detail_selected('general');
            getVideoItem(item.idx);
            var lib_td = $('#library__td__checkbox__' + item.idx);
            if (!lib_td.is(e.target) && lib_td.has(e.target).length === 0) {
                $scope.video_lib = item;
                $scope.video_id = item.video_url.substr(32, 11);
//                 youtubeFactory.getVideoById({
//                     videoId: $scope.video_id,
//                     key: 'AIzaSyAmEqE9mZWPIY0qSIkQfHok7ugaR0t871s',
//                 }).then(function (data) {
//                     for (var itemKey in data.data.items) {
//                         var items = data.data.items[itemKey];
//                         $scope.dur = items.contentDetails.duration;
//
//                         var time = msToTime(moment.duration($scope.dur).asMilliseconds())
//                         console.log(time)
//                     }
//                 });
                $('.detail').css('display', 'unset');
                $('#contents').attr('class', 'container module-detail');
            }
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
                    }
                }
            );
        };

        $scope.VideoInsert = function () {
            Modal.open(
                'views/popup_video_add.html',
                'PopupVideoAddCtrl',
                'sisung',
                {},
            );
        };

        $scope.insert_meta_item = function () {
            Modal.open(
                'views/video_editor.html',
                'VideoEditorCtrl',
                'sisung',
                {}
            )
        };

        function searchSwitch(){
            // check selectedFilter
            var selectedFilterValue;

            switch ($scope.selectedFilter.itemValue) {
                case 0:
                    selectedFilterValue = 0;
                    break;
                case 1:
                    selectedFilterValue = 1;
                    break;
            }

            var result = selectedFilterValue;

            return result;
        }

        $scope.search_video_list = function () {
            let value = searchSwitch();

            $scope.videoListParams = [];

            switch (value) {
                case 0: // base
                    var api_params = {};
                    api_params['user_idx'] = AuthService.getIdx();
                    api_params['fk_group_idx'] = AuthService.getFkGroupIdx();
                    // api_params['limit'] = parameters.count();
                    // api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
                    api_video.get(api_params, function (data) {
                        $timeout(function () {
                            // parameters.total(data.meta.total_count);
                            $scope.video_list = data.objects;
                            }, 500);
//                         console.log(data.objects);
                    });
                    break;
                case 1:
                    parameters.count = 9;
                    var api_params = {};
                    api_params['filter'] = "shared";

                    api_video.get(api_params, function (data) {
                        $timeout(function () {
                            $scope.video_list = data.objects;
                        }, 500);
                    });
                    break;

            }
        };

        $scope.detail_page = "general";
        $scope.detail_selected = function(type) {
            $scope.detail_page = type
        };

        $scope.detail_video = function () {
            $('.detail').css('display', 'none');
            $('#contents').attr('class', 'container module-default');
            // $('#contents').css('display', 'none');
        }

        $scope.insert_meta_item = function () {
            Modal.open(
                'views/video_editor.html',
                'VideoEditorCtrl',
                'sisung',
                {}
            )
        };

        function getVideoItem(videoIdx){
            var api_params = {};
            api_params['video_idx'] = videoIdx;
            api_item.get(api_params, function (data) {
                if (data.status == 200) {
                    $timeout(function () {
                        if(data.objects.length > 0) {
                            $scope.itemOfVideo = data.objects;
                            $scope.noItem = false;
                        } else {
                            $scope.noItem = true;
                        }}, 500);
                }
            });
        };

        $scope.setFilterItem = function(filterItem) {
            if($scope.selectedFilter == filterItem) return;
            $scope.selectedFilter = filterItem;

            $scope.search_video_list();
        };

        $scope.video_option_update = function (update_inform) {
            var change_item = confirm('정말로 변경하시겠습니까?');
            if(change_item) {
                api_admin_video_list.update(update_inform, function (data) {
                    if (data.status == 200) {
                        alert("성공적으로 변경 되었습니다.");
                        $route.reload();
                    } else if (data.status == 500) {
                        alert("변경이 이루어지지 않았습니다.");
                    }
                });
            }else {
                alert('취소하셨습니다.');
            }
        };


        if ($scope.videoListParamas === undefined) {
            $scope.search_video_list();
        } else{
            $scope.videoListParams.reload();
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
            var change_video_list = document.getElementById("contents");
            if(change_video_list){
                width = change_video_list.offsetWidth;
                margin = change_video_list.offsetLeft;
                if (margin == 260){
                    height = change_video_list.offsetHeight - 195 +'px';
                    document.getElementById("library-table-wrap").style.maxHeight = height;
                }
                else if (width <= 768) {
                    height = change_video_list.offsetHeight - 135 +'px';
                    document.getElementById("library-table-wrap").style.maxHeight = height;
                }
            }
        }
    });