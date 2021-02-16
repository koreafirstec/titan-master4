'use strict';

angular.module('titanApp')
.controller('PopupItemPositionUpdateCtrl', function ($scope,$rootScope,AuthService,$modalInstance, api_video_capture, video_idx, item_idx, video, total_position, image_num_array, api_item_position_detail, ENV, api_item_detail, Modal/*,$timeout, $location, $filter, $route, Modal, $upload, $q, api_one_item, api_item_list, item, api_video_make /*api_user_name, itemListParams,item, $sce,CanvasDirective ,api_video_item_detail_list*/) {
    $scope.image_frame = parseInt(video.image_frame);
    $scope.item_idx = item_idx;
    $scope.divide_num = video.divide_num;
    $scope.positionExist = video.Isposition;
    $scope.last_num = video.last_num;
    $scope.image_count = video.image_count;
    $scope.title = String($scope.image_count)+"/"+String(image_num_array.length);
    $scope.imageExists = false;
    $scope.rectLeft = 0;
    $scope.rectTop = 0;
    $scope.rectWidth = 0;
    $scope.rectHeight = 0;
    $scope.next_img = 0;
    $scope.pre_img = 0;
    $scope.manage_button = false;
    $scope.detail_update = false;

    var api_params = {};

    $scope.image_array = [];
    for(let objectKey in image_num_array){
        $scope.image_array.push({
            'image_frame': image_num_array[objectKey].image_frame,
            'image_count': image_num_array[objectKey].image_count - 1,
            'next_time': image_num_array[objectKey].second
        });
    }
    $scope.current_image_num = $scope.image_array[$scope.image_count-1];
    $scope.position_image = ENV.webs + '/make_image/' + video_idx + '/images/'+ String($scope.current_image_num.image_frame).padStart(5, '0') +'.jpg';

    // $(document).on('mouseleave', "#item_position_list", function (e) {
    //     $(document).off("keydown");
    //     $modalInstance.dismiss('cancel');
    // });

    $(document).on('mousedown', function(e){
       var container2 = $("#item_position_list");
       if (!container2.is(e.target) && container2.has(e.target).length === 0){
           $(document).off("keydown");
           $modalInstance.dismiss('cancel');
       }
    });

   $(document).on('keydown', function(e){
        switch (e.key) {
            case 'ArrowLeft':
                if($scope.image_count != 0)
                    $scope.previous_Image();
                break;
            case 'ArrowRight':
                if($scope.image_count != 0)
                    $scope.next_Image();
                break;
            case 'Escape':
                $(document).off("keydown", '#position_draw_rect');
                break;
        }
    });

	api_params['image_frame'] = $scope.image_frame;
	api_params['item_idx'] = $scope.item_idx;

	api_item_position_detail.get(api_params, function (data) {
	    $scope.dataStatus = 203;
		if(data.status == 200){
			if(data.objects != undefined && data.objects != ''){
				$scope.image_w = document.getElementById('position_img').width;
				$scope.image_h = document.getElementById('position_img').height;

				let x = parseInt(data.objects[0].x/(1920/$scope.image_w));
				let y = parseInt(data.objects[0].y/(1080/$scope.image_h));
				let width = parseInt(data.objects[0].width/(1920/$scope.image_w)) - x;
				let height = parseInt(data.objects[0].height/(1080/$scope.image_h)) - y;
				$scope.rectLeft = x;
                $scope.rectTop = y;
                $scope.rectWidth = width;
                $scope.rectHeight = height;

                $scope.manage_button = true;
				angular.element('#item_position_'+$scope.item_idx).css('display', 'inline-block');
                angular.element('#item_position_'+$scope.item_idx).css('left', x);
                angular.element('#item_position_'+$scope.item_idx).css('top', y);
                angular.element('#item_position_'+$scope.item_idx).css('width', width);
                angular.element('#item_position_'+$scope.item_idx).css('height', height);
                angular.element('#item_position_'+$scope.item_idx).css('position', 'absolute');
                $scope.dataStatus = 200;
			}else{
			    $scope.rectLeft = 0;
                $scope.rectTop = 0;
                $scope.rectWidth = 0;
                $scope.rectHeight = 0;
                angular.element('#item_position_'+$scope.item_idx).css('display', 'none');
			    $scope.manage_button = false;
			    $scope.dataStatus = 200;
            }
		}
	});

	$scope.next_Image = function(){
	    if($scope.image_array.length > $scope.image_count){
	        $scope.dataStatus = 203;
	        $scope.image_count += 1;
	        $scope.current_image_num = $scope.image_array[$scope.image_count-1];
	        $scope.next_time = $scope.current_image_num.next_time;
	        $scope.image_frame = $scope.current_image_num.image_frame;
	        $scope.title = String($scope.current_image_num.image_count+1)+"/5";
	        $scope.position_image = ENV.webs + '/make_image/' + video_idx + '/images/'+ String($scope.current_image_num.image_frame).padStart(5, '0') +'.jpg';
	        api_params['image_frame'] = $scope.current_image_num.image_frame;
	        api_params['item_idx'] = $scope.item_idx;
	        api_params['video_idx'] = video_idx;
	        api_item_position_detail.get(api_params, function (data) {
                if(data.status == 200){
                    if(data.objects != undefined && data.objects != ''){
                        $scope.image_w = document.getElementById('position_img').width;
                        $scope.image_h = document.getElementById('position_img').height;

                        let x = parseInt(data.objects[0].x/(1920/$scope.image_w));
                        let y = parseInt(data.objects[0].y/(1080/$scope.image_h));
                        let width = parseInt(data.objects[0].width/(1920/$scope.image_w)) - x;
                        let height = parseInt(data.objects[0].height/(1080/$scope.image_h)) - y;
                        $scope.rectLeft = x;
                        $scope.rectTop = y;
                        $scope.rectWidth = width;
                        $scope.rectHeight = height;
                        $scope.manage_button = true;

                        angular.element('#item_position_'+$scope.item_idx).css('display', 'inline-block');
                        angular.element('#item_position_'+$scope.item_idx).css('left', x);
                        angular.element('#item_position_'+$scope.item_idx).css('top', y);
                        angular.element('#item_position_'+$scope.item_idx).css('width', width);
                        angular.element('#item_position_'+$scope.item_idx).css('height', height);
                        angular.element('#item_position_'+$scope.item_idx).css('position', 'absolute');
                        $scope.dataStatus = 200;
                    }else{
                        $scope.rectLeft = 0;
                        $scope.rectTop = 0;
                        $scope.rectWidth = 0;
                        $scope.rectHeight = 0;
                        $scope.manage_button = false;
                        $scope.dataStatus = 200;
                        angular.element('#item_position_'+$scope.item_idx).css('display', 'none');
                    }
                }
            });
        }else{
	        var nextConfirm = confirm('다음 5장을 보시겠습니까?\n(이전 5장의 영역은 수정할 수 없습니다.)');
	        if(nextConfirm){
                $scope.image_count = 0;
                $scope.image_array.length = 0;
                $scope.dataStatus = 203;
                $scope.image_frame = $scope.current_image_num.image_frame;
                $scope.first_num = $scope.current_image_num.image_frame;
                api_params['video_idx'] = video_idx;
                api_params['show_item_idx'] = $scope.item_idx;
                api_params['current_position'] = $scope.image_frame;
                api_video_capture.save(api_params, function(data){
                    if(data.status == 200){
                        var position_count = data.objects;
                        $scope.current_position = data.objects[position_count.length-1].current_position;
                        $scope.first_time = data.objects[0].second;
                        $scope.previousTime = data.objects[0].second;
                        $scope.total_frame = data.objects[0].total_frame;
                        $scope.last_num = data.objects[position_count.length-1].current_position;
                        for (let objectKey in data.objects) {
                            let object = data.objects[objectKey];
                            $scope.image_array.push({
                                'image_frame': String(data.objects[objectKey].current_position).padStart(5, '0'),
                                'image_count': data.objects[objectKey].image_count - 1,
                                'next_time': data.objects[objectKey].second
                            });
                        }
                        $scope.image_array_len = parseInt($scope.image_array.length);
                        $scope.current_image_num = $scope.image_array[$scope.image_array_len-1];
                        $scope.dataStatus = 200;
                        // $scope.position_image = ENV.webs + '/make_image/' + video_idx + '/images/'+ String(data.objects[0].current_position).padStart(5, '0') +'.jpg';
                        $scope.next_Image();
                        // if($scope.image_array_len%5 == 0){
                        //     $scope.position_image = ENV.webs + '/make_image/' + video_idx + '/images/'+ String($scope.current_image_num.image_frame).padStart(5, '0') +'.jpg';
                        // }
                    }
                });
	        }else{
	        }
        }
    }

    $scope.previous_Image = function(){
	    if($scope.image_count > 1){
	        $scope.dataStatus = 203;
	        $scope.image_count -= 1;
	        $scope.current_image_num = $scope.image_array[$scope.image_count-1];
	        $scope.image_frame = $scope.current_image_num.image_frame;
	        $scope.title = String($scope.current_image_num.image_count+1)+"/5";
	        $scope.position_image = ENV.webs + '/make_image/' + video_idx + '/images/'+ String($scope.current_image_num.image_frame).padStart(5, '0') +'.jpg';
	        api_params['image_frame'] = $scope.current_image_num.image_frame;
	        api_params['item_idx'] = $scope.item_idx;

            api_item_position_detail.get(api_params, function (data) {
                if(data.status == 200){
                    if(data.objects != undefined && data.objects != ''){
                        $scope.image_w = document.getElementById('position_img').width;
                        $scope.image_h = document.getElementById('position_img').height;

                        let x = parseInt(data.objects[0].x/(1920/$scope.image_w));
                        let y = parseInt(data.objects[0].y/(1080/$scope.image_h));
                        let width = parseInt(data.objects[0].width/(1920/$scope.image_w)) - x;
                        let height = parseInt(data.objects[0].height/(1080/$scope.image_h)) - y;
                        $scope.rectLeft = x;
                        $scope.rectTop = y;
                        $scope.rectWidth = width;
                        $scope.rectHeight = height;
                        $scope.manage_button = true;

                        angular.element('#item_position_'+$scope.item_idx).css('display', 'inline-block');
                        angular.element('#item_position_'+$scope.item_idx).css('left', x);
                        angular.element('#item_position_'+$scope.item_idx).css('top', y);
                        angular.element('#item_position_'+$scope.item_idx).css('width', width);
                        angular.element('#item_position_'+$scope.item_idx).css('height', height);
                        angular.element('#item_position_'+$scope.item_idx).css('position', 'absolute');
                        $scope.dataStatus = 200;
                    }else{
                        $scope.rectLeft = 0;
                        $scope.rectTop = 0;
                        $scope.rectWidth = 0;
                        $scope.rectHeight = 0;
                        $scope.manage_button = false;
                        $scope.dataStatus = 200;
                        angular.element('#item_position_'+$scope.item_idx).css('display', 'none');
                    }
                }
            });
	    }else {
        }
    }

	$scope.check_left_top = function(y, x){
	    $scope.rectLeft = x;
        $scope.rectTop = y;
    }

    $scope.check_wid_hei = function(w, h){
	    $scope.rectWidth = w;
        $scope.rectHeight = h;
    }

	$scope.offset = function() {
        var rec = document.getElementById('position_img').getBoundingClientRect(),
            bodyElt = document.body;
        return {
            top: rec.top + bodyElt.scrollTop,
            left: rec.left + bodyElt.scrollLeft
        }
    };

    $scope.rectUpdate = function(x, y, w, h, position, iw, ih, idx, left, top, width, height){
        $scope.dataStatus = 203;
        $scope.detail_update = true;
        var api_params = {};
        api_params['rect_item_idx'] = idx;
        api_params['rect_position'] = position;
        api_params['rect_x'] = x * (1920/iw);
        api_params['rect_y'] = y * (1080/ih);
        api_params['rect_w'] = w * (1920/iw)+api_params['rect_x'];
        api_params['rect_h'] = h * (1080/ih)+api_params['rect_y'];
        // // api_params['left'] = left;
        // // api_params['top'] = top;
        // // api_params['width'] = width;
        // // api_params['height'] = height;
        //
        api_item_detail.update(api_params, function(data){
            if(data.status == 200){
                $scope.detail_update = false;
                $scope.dataStatus = data.status;
            }
        });
    }

    $scope.rectDelete = function(x, y, w, h, position, iw, ih, idx, left, top, width, height){
        var api_params = {};
        api_params['rect_item_idx'] = idx;
        api_params['rect_position'] = position;
        // api_params['left'] = left;
        // api_params['top'] = top;
        // api_params['width'] = width;
        // api_params['height'] = height;

        api_item_detail.delete(api_params, function(data){
            if(data.status == 200){
                $scope.rectLeft = 0;
                $scope.rectTop = 0;
                $scope.rectWidth = 0;
                $scope.rectHeight = 0;
                angular.element('#item_position_'+$scope.item_idx).css('display', 'none');
            }
        });
    }

    $scope.close = function () {
        $(document).off("keydown");
        $modalInstance.dismiss('cancel');
    };
}).directive('resizeposition', ['myConfig', 'myValue', function (myConfig, myValue) {
    return {
        restrict: 'A',
        link: function postLink(scope, elem, attrs) {
            elem.resizable({ handles: " n, e, s, w, ne, se, sw, nw"});
            elem.on('resizestop', function (event, ui) {
                var posOff = scope.offset(),
                newPosW = ui.size.width,
                newPosH = ui.size.height
                scope.check_wid_hei(newPosW, newPosH);
            });
            elem.on('resize', function(event, ui){
                var newPosW = ui.size.width,
                newPosH = ui.size.height
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
            elem.draggable({containment: "#position_img"});
        }
    }
}]);
