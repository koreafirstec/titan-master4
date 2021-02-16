// 'use strict';
//
// angular.module('titanApp')
//     .controller('TempVideoMakeCtrl', function ($scope, AuthService, $timeout, api_video, api_titan_model, Modal, api_item, api_shape, ENV) {
//         $scope.user_idx = AuthService.getIdx();
//
//         var video_params = {};
//         video_params['user_idx'] = $scope.user_idx;
//         api_video.get(video_params, function (data) {
//             $timeout(function () {
//                 $scope.video_list = data.objects;
//                 console.log('video_list:', $scope.video_list);
//             }, 500);
//         });
//
//         $scope.changeVideo = function (video_id) {
//             $scope.video_id = video_id;
//         };
//
//         api_titan_model.get(null, function (data) {
//             $timeout(function () {
//                 $scope.model_list = data.objects;
//                 console.log('model_list:', $scope.model_list);
//             }, 500);
//         });
//     });

'use strict';

angular.module('titanApp')
    .controller('TempVideoMakeCtrl', function ($scope, $route, api_video, $timeout, Modal, api_item, api_shape, api_titan_model, AuthService, ENV) {
        $scope.user_idx = AuthService.getIdx();
        $scope.selectedItem = null;
        $scope.video_idx = null;
        $scope.video_total_count = 0;
        $scope.item_shape_value = null;
        $scope.shape_position = "";
        $scope.click_status = false;
        $scope.shape_none_message = "";
        $scope.progress_num = 0;
        $scope.past_video_idx = 0;
        $scope.classesNum = 1;

        $scope.model_list = [];

        $scope.selectCheckRadio = function(model_idx, position, model){
            angular.forEach(model, function(item, index){
                if(position != index)
                    item.model_checked = false;
            })
            if($('#model_'+String(model_idx)).is(":checked")){
                $scope.model_list = [];
                $scope.model_list.push(parseInt(model_idx));
                console.log("checked", $scope.model_list);
            }else{
                var model_list = $scope.model_list.indexOf(parseInt(model_idx));
                $scope.model_list.splice(model_list, 1);
                console.log("unchecked", $scope.model_list);
            }
        }

        var parameters = {
            page: 1,
            count: 10,
            sorting: {}
        };

        $scope.models = {
            selected: null,
            video_lists: {"videos": []},
            model_lists: {"models": []},
            shape_lists: {"shapes": []},
            backdrop: 'static',
            keyboard: false
        };

        $scope.shape_check = [];
        $scope.shapeChecks = [];

        var api_model_params = {}

        api_model_params['limit'] = parameters.count;
        api_model_params['offset'] = (parameters.page - 1) * api_model_params['limit'];
        api_titan_model.get(api_model_params, function(data){
            $timeout(function () {
                for (let objectKey in data.objects) {
                    let object = data.objects[objectKey];
                    $scope.models.model_lists.models.push({
                        type: "model",
                        idx: object.idx,
                        model_user_id: object.user_id,
                        model_access: object.model_access,
                        model_title: object.model_title,
                        model_status: object.model_status,
                        model_checked: false
                    });
                }
            }, 500);
        })

        api_shape.get(null, function (data) {
            if(data.status == 200){
                $scope.video_total_count = data.objects[0].video_total;
                var pageNum = 1;
                var api_params = {};
                api_params['user_idx'] = AuthService.getIdx();
                api_params['fk_group_idx'] = AuthService.getFkGroupIdx();
                api_params['limit'] = $scope.video_total_count;
                api_params['offset'] = (pageNum - 1) * api_params['limit'];
                api_video.get(api_params, function (data) {
                    $timeout(function () {
                        // for (let objectKey in data.objects) {
                        for (let objectKey = data.objects.length - 1; objectKey >= 0; objectKey--) {
                            let object = data.objects[objectKey];
                            $scope.models.video_lists.videos.push({type: "video", src: object.video_url.substr(32, 11), title: object.video_title, idx: object.idx, video_url: object.video_url})
                        }
                    }, 500);
                });
                $timeout(function () {
                    for (let objectKey in data.objects) {
                        let object = data.objects[objectKey];
                        $scope.models.shape_lists.shapes.push({
                            type: "shape",
                            itemType: object.shape_type,
                            title: object.shape_title,
                            src: object.shape_img,
                            index: object.idx
                        });
                    }
                }, 500);
            }
        });

        $scope.videobox = {
            item: {"data": []}
        };
        $scope.shapebox = {
            item: {"data": []}
        };

        $scope.offset = function() {
            var rec = document.getElementById('mainDrag').getBoundingClientRect(),
                bodyElt = document.body;

            return {
                top: rec.top + bodyElt.scrollTop,
                left: rec.left + bodyElt.scrollLeft
            }
        };

        // api_shape.get(null, function (data) {
        //     for (let objectKey in data.objects) {
        //         let objects = data.objects[objectKey];
        //         $scope.shape_check.push({
        //             index: objects.idx, shape_title: objects.shape_title
        //         });
        //     }
        // });
        // $scope.shapeChecks = $scope.shape_check[0];

        // setInterval(function(){
        $scope.item_detection = false;
        $scope.ItemDetection = function() {
            $scope.item_detection = !$scope.item_detection;
        };

    // $scope.RectCheck = function(video_idx){
    //     $scope.shape_check = [];
    //     $scope.shapeChecks = [];
    //     var dataObjects;
    //
    //     var api_params = {};
    //     api_params['video_idx'] = video_idx.idx;
    //     api_params['video_url'] = video_idx.video_url;
    //
    //     api_rect_check.save({}, api_params, function (data) {
    //         if (data.status == 200) {
    //             $timeout(function(){
    //                 $scope.rectData = data.objects;
    //                 dataObjects = data.objects;
    //             }, 500)
    //             if(data.objects != undefined && data.objects != "") {
    //                 $scope.shape_position = ENV.webs + '/make_image/' + video_idx.idx + '/images/' + data.objects[0].position + '.jpg';
    //                 angular.element('#shape_position_img').css('display', 'inline-block');
    //                 angular.element('#shape_combo_box').css('display', 'inline-block');
    //             }else{
    //                 $scope.shape_none_message = "없어요 없다고요!";
    //             }
    //         }
    //     });
    // };
        // }, 500);

        $scope.itemAdd = function() {
            // var class_type = document.getElementById('item_detection').className;

            var api_params = {};
            api_params['fk_video_idx'] = 90;
            api_params['fk_user_idx'] = $scope.user_idx;
            api_params['item_price'] = '50000';
            api_params['item_title'] = '의류';
            api_params['item_description'] = '의류 테스트입니다.';
            api_params['item_redirect_url'] = 'http://hsmoa.co.kr/i?id=8540042&from=timeline';
            api_params['item_img_path'] = '/images/uploads/';
            api_params['fk_item_main_type'] = 2;
            // api_params['fk_item_sub_type'] = parseInt(class_type);
            api_params['fk_item_sub_type'] = 0;
            api_params['item_shape_type'] = 0;
            api_params['update_check'] = 0;
            api_params['using'] = 1;
            api_params['item_description_toggle'] = 0;
            api_params['classesNum'] = $scope.classesNum;

            api_item.save({}, api_params, function(data){
                if(data.status == 200){
                    Modal.open(
                        'views/progress_popup.html',
                        'ProgressPopupCtrl',
                        'sisung',
                        {
                            item: function(){
                                return data.objects[0];
                            },
                            keyboard: false,
                            backdrop: 'static'
                        },
                    );
                }
            });
        };

        $scope.onItemAdd = function (item, shape_value, classesNum) {
            console.log(shape_value);

            var api_params = {};
            api_params['fk_video_idx'] = item.idx;
            api_params['fk_user_idx'] = $scope.user_idx;
            api_params['item_price'] = '50000';
            api_params['item_title'] = '의류';
            api_params['item_description'] = '의류 테스트입니다.';
            api_params['item_redirect_url'] = 'http://hsmoa.co.kr/i?id=8540042&from=timeline';
            api_params['item_img_path'] = '/images/uploads/';
            api_params['fk_item_main_type'] = 2;
            api_params['fk_item_sub_type'] = shape_value;
            api_params['item_shape_type'] = 0;
            api_params['update_check'] = 0;
            api_params['using'] = 1;
            api_params['item_description_toggle'] = 0;
            api_params['classesNum'] = $scope.classesNum;
            console.log($scope.classesNum);

            api_item.save({}, api_params, function(data){
                if(data.status == 200){
                    Modal.open(
                        'views/progress_popup.html',
                        'ProgressPopupCtrl',
                        'sisung',
                        {
                            item: function(){
                                return data.objects[0];
                            },
                            keyboard: false,
                            backdrop: 'static'
                        },
                    );
                }
            });
        };

        $scope.initial_video = function(){
            $route.reload();
        }

        $scope.VideoAdd = function() {
            Modal.open(
                'views/popup_video_add.html',
                'PopupVideoAddCtrl',
                'sisung',
                {
                },
            );
        }

        // Model to JSON for demo purpose
        $scope.$watch('models', function(model) {
            $scope.modelAsJson = angular.toJson(model, true);
        }, true);

        var beforeShapeItem = {};
        var beforeVideoItem = {};
        $scope.$watch('videobox', function (videoModel) {
            var item = videoModel.item.data;

            if (item[0] !== undefined) {
                var itemElement = item[0];
                $scope.shapebox.item.data = [];
                if (itemElement.type === "shape") {
                    //shape 일시 할 동작.
                    if (beforeShapeItem !== undefined) {
                        if (beforeShapeItem.type !== undefined)
                            $scope.models.shape_lists.shapes.push(beforeShapeItem);
                    }
                    beforeShapeItem = itemElement;
                    $scope.item_shape_value = beforeShapeItem;
                    $scope.shapebox.item.data.push(itemElement);
                } else {
                    $scope.selectedItem = itemElement;

                    if (beforeVideoItem !== undefined) {
                        if (beforeVideoItem.type !== undefined)
                            $scope.models.video_lists.videos.push(beforeVideoItem);
                        if (beforeShapeItem.type !== undefined)
                            $scope.models.shape_lists.shapes.push(beforeShapeItem);
                    }

                    beforeVideoItem = itemElement;
                    $scope.video_idx = beforeVideoItem;
                    $scope.shape_position = "";
                    // for (var i = 0; i < $scope.rectData.length; i++){
                    //     angular.element('#item'+dataObject[i].shape_item_type).css('display', 'none');
                    // }
                    $scope.rectData = null;
                    angular.element('#shape_position_img').css('display', 'none');
                    angular.element('#shape_combo_box').css('display', 'none');
                    $scope.shape_none_message = "";
                    $scope.shape_check = [];
                    $scope.shapeChecks = [];
                }
                $scope.videobox.item.data = [];
            }
        }, true);
    })
    .value('myConfig', {
        name:'Kadir'
    })
    .value('myValue', {
        name:'kadir name'
    })
    .directive('resizable', ['myConfig', 'myValue', function (myConfig, myValue) {
        return {
            restrict: 'A',

            link: function postLink(scope, elem, attrs) {
                // 핸들 가능한 방향 n: north 이런방식. ne 는 northEast -> 좌측상단.
                elem.resizable({ handles: " n, e, s, w, ne, se, sw, nw"});
                elem.on('mouseover',function() {
                    elem.addClass('enter');
                });
                elem.on('mouseleave',function() {
                    elem.removeClass('enter');
                });
                elem.on('dragstop',function(event,ui) {
                    var posOff = scope.offset(),
                    newPosX = ui.offset.left - posOff.left,
                    newPosY = ui.offset.top - posOff.top;

                    console.log(newPosY);
                    console.log(newPosX);
                });
                elem.draggable({containment: "#mainDrag"});
            }
        }
    }]);