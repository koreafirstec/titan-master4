/**
 * Created by ksm on 2014-12-11.
 */
'use strict';

angular.module('titanApp')
.controller('PopupReviewCtrl', function ($scope,$rootScope, $modalInstance,$timeout, $location,$filter,$route,Modal,ENV,api_item, item_main, item_sub, item_price, item_title, item_description, item_redirect_url, item_img_path/*itemListParams,item, $sce,CanvasDirective ,api_item_detail*/) {
        $scope.title = "미리보기";
        $scope.item_main = item_main;
        $scope.item_sub = item_sub;
        $scope.item_price = item_price;
        $scope.item_title = item_title;
        $scope.item_description = item_description;
        $scope.item_redirect_url = item_redirect_url;
        $scope.item_img_path = ENV.webs + "/" + item_img_path;
//        $scope.item_main = 0;
//        $scope.video_id =  item.video_url.substr(32, 11);
//        $scope.itemListParams = itemListParams;
//            var api_params = {};
//            api_params['video_idx'] = 9;
//            $scope.item;
//            $scope.title1;
//            $scope.title2;
//            api_item.get(api_params, function(data){
//                $scope.item = data.objects[0];
//                $scope.title1 = $scope.item.item_title;
//                $scope.title2 = $scope.item.item_description;
//        });

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.close2 = function () {
            $modalInstance.dismiss('cancel');
        };
//    ENV.webs + "/" +
        $scope.ShowPicture = function(image_path){
            return image_path;
        }

//        function CanvasDirective(api_item_detail) {
//        return {
//    restrict: "A",
//    link: function(scope, element){
//      var c = document.getElementById("canvas");
//      var ctx = element[0].getContext('2d');
//      var api_params = {};
//      api_params['item_idx'] = 1;
//      var x, y, width, height;
//
//      api_item_detail.get(api_params, function (data) {
//             x = Math.floor((data.objects[0].x*300.0)/1920);
//             y = Math.floor((data.objects[0].y*150.0)/1080);
//             width = Math.floor((data.objects[0].width*300.0)/1920)-x;
//             height = Math.floor((data.objects[0].height*150.0)/1080)-y;
//             ctx.beginPath();
//             ctx.strokeRect(20,30,100,100);
////             ctx.strokeRect(x,y,width,height);
//             ctx.stroke();
//      });
//      }
//      };
//      }
//            return {
//            restrict: "A",
//            link: function(scope, element) {
//              // get canvas context
//              var ctx = element[0].getContext('2d');
//              // capture drawing modus
//              var isDrawing = false;
//              // last mouse coordinates
//              var lastMouse = {x:0, y:0}
//
//                    // mouse down handler
//              element.bind('mousedown', function(event) {
//                // save last mouse position
//                lastMouse.x = event.offsetX;
//                lastMouse.y = event.offsetY;
//                // begins new line
//                ctx.beginPath();
//                        // set is drawing
//                isDrawing = true;
//              });
//
//              // mouse move handler
//              element.bind('mousemove', function(event) {
//                if (isDrawing) {
//                  // draw
//                  ctx.moveTo(lastMouse.x, lastMouse.y);
//                  ctx.lineTo(event.offsetX, event.offsetY);
//                  ctx.strokeStyle = "red";
//                  ctx.stroke();
//                  // save last mouse
//                            lastMouse.x = event.offsetX;
//                    lastMouse.y = event.offsetY;
//                }
//
//              });
//
//              // mouse up handler
//              element.bind('mouseup', function(event) {
//                isDrawing = false;
//              });
//
//            }
//            };
//            }


//        $scope.onAction = function(){
//            if($scope.popup_type == 'ELECTION_DELETE'){
//                var api_params = {};
//                api_election.delete({'key': $scope.election.id},api_params, function (data) {
//                    if (data.status == 200){
//                        $scope.electionListParams.reload();
//                        Modal.open(
//                            'views/alert_modal.html',
//                            'AlertCtrl',
//                            'sisung',
//                            {
//                                alertTitle: function(){
//                                    return "선거 삭제";
//                                },
//                                alertMsg: function(){
//                                    return "정상적으로 삭제되었습니다.";
//                                }
//                            }
//                        );
//                        $modalInstance.dismiss('ok');
//                    }
//                });
//            }else if($scope.popup_type == 'USER_DELETE'){
//                var api_params = {};
//                api_user.delete({'key': $scope.election.id},api_params, function (data) {
//                    if (data.status == 200){
//                        $scope.electionListParams.reload();
//                        Modal.open(
//                            'views/alert_modal.html',
//                            'AlertCtrl',
//                            'sisung',
//                            {
//                                alertTitle: function(){
//                                    return "사용자 삭제";
//                                },
//                                alertMsg: function(){
//                                    return "정상적으로 삭제되었습니다.";
//                                }
//                            }
//                        );
//                        $modalInstance.dismiss('ok');
//                    }
//                });
//            }else if($scope.popup_type == 'JOBGROUP_DELETE'){
//                var api_params = {};
//                api_jobgroup.delete({'key': $scope.election.pid},api_params, function (data) {
//                    if (data.status == 200){
//                        $scope.electionListParams.reload();
//                        Modal.open(
//                            'views/alert_modal.html',
//                            'AlertCtrl',
//                            'sisung',
//                            {
//                                alertTitle: function(){
//                                    return "투표소 삭제";
//                                },
//                                alertMsg: function(){
//                                    return "정상적으로 삭제되었습니다.";
//                                }
//                            }
//                        );
//                        $modalInstance.dismiss('ok');
//                    }
//                });
//            }else if($scope.popup_type == 'RIGHT_DELETE'){
//                var api_params = {};
//                api_right_group.delete({'key': $scope.election.id},api_params, function (data) {
//                    if (data.status == 200) {
//                        $scope.electionListParams.reload();
//                        Modal.open(
//                            'views/alert_modal.html',
//                            'AlertCtrl',
//                            'sisung',
//                            {
//                                alertTitle: function () {
//                                    return "권한그룹 삭제";
//                                },
//                                alertMsg: function () {
//                                    return "정상적으로 삭제 되었습니다.";
//                                }
//                            }
//                        );
//                    }
//                    $modalInstance.dismiss('cancel');
//                });
//            }else if($scope.popup_type == 'AREA_DELETE'){
//                var api_params = {};
//                api_area.delete({'key': $scope.election.id},api_params, function (data) {
//                    if (data.status == 200) {
//                        $scope.electionListParams.reload();
//                        Modal.open(
//                            'views/alert_modal.html',
//                            'AlertCtrl',
//                            'sisung',
//                            {
//                                alertTitle: function () {
//                                    return "지역 삭제";
//                                },
//                                alertMsg: function () {
//                                    return "정상적으로 삭제 되었습니다.";
//                                }
//                            }
//                        );
//                    }
//                    $modalInstance.dismiss('cancel');
//                });
//            }
    });
