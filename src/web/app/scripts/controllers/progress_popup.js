'use strict';

angular.module("titanApp")
.controller("ProgressPopupCtrl", function($scope, $rootScope, $http, $window, AuthService, $modalInstance, $interval, $timeout, $location, $filter, $route, Modal, item, api_make_titan_video, api_item, api_progress_process, ENV) {
    $scope.ai_status = 0;
    $scope.img_url_past = "../images/common/noimg.png";
    $scope.img_url_current = "../images/common/noimg.png";
    $scope.img_url_future = "../images/common/noimg.png";
    $scope.noimg_image = "../images/common/noimg.png";
    $scope.item_idx = item.idx;
    $scope.user_id = AuthService.getUserId();
    $scope.user_idx = AuthService.getIdx();
    $scope.video_idx = item.video_idx;
    $scope.item = item;
    $scope.using = item.using;
    $scope.d_item_idx = 0;
    $scope.message = '';

    var api_params = {};
    api_params['video_url'] = $scope.item.video_url;
    var video_url = $scope.item.video_url;
    $scope.video_id = video_url.substr(32, 11);
    api_params['fk_item_idx'] = $scope.item_idx;
    api_params['fk_item_main_type'] = $scope.item.fk_item_main_type;
    api_params['fk_item_sub_type'] = $scope.item.fk_item_sub_type;

    api_make_titan_video.save({}, api_params, function(data){
       if(data.status == 200){
            $scope.d_item_idx = data.objects[0].item_idx;
	   }else{
            $scope.d_item_idx = data.objects[0].item_idx;
       }
    });
    var api_params2 = {};
    var img_url_past = '';
    var img_url_current = '';
    var img_url_future = '';
    var image_path = ENV.webs + '/make_image/' + $scope.item_idx;
    var video_thumbnail = "http://img.youtube.com/vi/"+ $scope.video_id +"/hqdefault.jpg";

    api_params2['item_idx'] = item.idx;

    $scope.progressTimer = setInterval(function (){
       api_progress_process.get(api_params2, function (data) {
          if(data.status == 200 && data.objects[0].ai_status == 1){
             var Objects = data.objects;
             if(Objects[0].draw_img_name != "" && Objects[0].draw_img_name != undefined){
                img_url_past = image_path + '/images/' + Objects[0].draw_img_name + '.jpg';
                img_url_current = image_path + '/images/' + Objects[0].draw_img_name + '.jpg';
                if(data.objects[0].check == true)
                    img_url_future = image_path + '/draw_images/' + Objects[0].draw_img_name + '.jpg';
                else{
                    img_url_future = image_path + '/images/' + Objects[0].draw_img_name + '.jpg';
                }
                var w = document.getElementById('current_img').width;
                var h = document.getElementById('current_img').height;

                for(let i = 0; i < Objects.length; i++){
                    var left = Math.floor(Objects[i].x / (1920 / w));
                    var top = Math.floor(Objects[i].y / (1080 / h));
                    var width = Math.floor(Objects[i].width / (1920 / w)) - left;
                    var height = Math.floor(Objects[i].height / (1080 / h)) - top;

                    // angular.element('#item_'+Objects[i].draw_item_type).css('position', 'absolute');
                    // angular.element('#item_'+Objects[i].draw_item_type).css('left', left);
                    // angular.element('#item_'+Objects[i].draw_item_type).css('top', top);
                    // angular.element('#item_'+Objects[i].draw_item_type).css('width', width);
                    // angular.element('#item_'+Objects[i].draw_item_type).css('height', height);
                    // angular.element('#item_'+Objects[i].draw_item_type).css('display', 'flex');

                    angular.element('#item_div').css('position', 'absolute');
                    angular.element('#item_div').css('left', left);
                    angular.element('#item_div').css('top', top);
                    angular.element('#item_div').css('width', width);
                    angular.element('#item_div').css('height', height);
                    angular.element('#item_div').css('display', 'flex');
                }
             }else{
                angular.element('#item_div'.position).css('display', 'none');
                img_url_past = video_thumbnail;
                img_url_current = video_thumbnail;
                img_url_future = video_thumbnail;
             }
             $scope.img_url_past = img_url_past;
             $scope.img_url_current = img_url_current;
             $scope.img_url_future = img_url_future;
             $scope.ai_status = data.objects[0].progress;

             if($scope.ai_status == 100){
                $scope.img_url_past = video_thumbnail;
                $scope.img_url_current = video_thumbnail;
                $scope.img_url_future = video_thumbnail;
                clearInterval($scope.progressTimer);
             }
          }
       });
    },500);
//========================================================================================================================
//     $scope.title = item.video_title;
//
//     $scope.item_list;
//     $scope.item_click = false;
//     $scope.idx = 0;
//     var api_params = {};
//
//     api_params['video_idx'] = $scope.video_idx;
//     api_params['item_idx'] = $scope.item_idx;
//     // api_params['item_detail_idx'] = $scope.item_idx;
//
//     api_item.get(api_params, function (data) {
//         $scope.item_list = data.objects;
//     });
//
//     $scope.openItem = function(item_idx) {
//         $scope.openTime = true;
//         if($scope.item_click == 1 && $scope.idx == item_idx) {
//             $scope.item_click = 0;
//             return;
//         }
//         $scope.idx = item_idx;
//
//         $scope.item_title = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_title;
//         $scope.item_description = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description;
//         $scope.item_price = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_price.toLocaleString();
//         $scope.item_redirect_url = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_redirect_url;
//         $scope.item_description_url = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description_url;
//         $scope.item_description_toggle = $scope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description_toggle;
//         $scope.item_click = 1;
//         $scope.idx = item_idx;
//
//         $timeout(function () {
// 	        $scope.openTime = false;
//         }, 5000, true );
//     }
//
//     $scope.open = true;
//
//     // $window.addEventListener('keydown', function (e) {
//     //     var key = e.which || e.keyCode;
//     //
//     //     if (key === 27) {
//     //         let progress_close = confirm("정말 종료하시겠습니까?");
//     //         if(progress_close){
//     //             $scope.DelItem($scope.item_idx);
//     //             clearInterval($scope.progressTimer);
//     //             $modalInstance.dismiss('cancel');
//     //         }else{
//     //         }
//     //     }
//     // });
//     $scope.popup_update = function(item, item_info) {
//        $modalInstance.dismiss('ok');
//        Modal.open(
//              'views/popup_make.html',
//              'PopupMakeCtrl',
//              'sisung',
//              {
//                 item: function(){
//                 return item;
//                 },
//                 item_info: function(){
//                 return item_info;
//                 }
//              }
//        );
//     };
//
//     $scope.DelItem = function(d_item_idx){
//         var api_params_d = {};
//         api_params_d['d_item_idx'] = d_item_idx;
//         api_item.delete(api_params_d, function(data){
//             if(data.status == 200){
//                 console.log('흐으ㅡㅇ으으으으으으으음');
//                 $route.reload();
//                 $modalInstance.dismiss('ok');
//             }else{
//                 $route.reload();
//             }
//         });
//     };
//
//     $scope.close = function () {
//         $scope.open = false;
//         $modalInstance.dismiss('cancel');
//     };
}).directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
      attrs.$observe('ngSrc', function(value) {
        if (!value && attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});
