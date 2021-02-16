/**
 * Created by ksm on 2014-12-11.
 */
'use strict';

angular.module('titanApp')
.controller('PopupItemListCtrl', function ($scope,$rootScope,AuthService,$modalInstance,$timeout, $location, $filter, $route, Modal, $upload, ENV, $q, api_item, item /*api_user_name, itemListParams,item, $sce,CanvasDirective ,api_video_item_detail_list*/) {
    $scope.title = "영상별 상품 목록";
    $scope.user_idx = AuthService.getIdx();
    $scope.fk_group_idx = AuthService.getFkGroupIdx();
    $scope.imgVersion = 0;
    $scope.item_list = null;
    $scope.user_name = null;
    $scope.video_idx = item.idx;
    $scope.item_video = item;
    $scope.item_idx = item.item_idx;
    var api_params = {};
    if(item.item_idx != undefined && item.item_idx!=''){
        api_params['video_idx'] = $scope.video_idx;
        api_params['item_idx'] = $scope.item_idx;

        api_item.get(api_params, function(data){
            $scope.item_list = data.objects;
        });
    }else{
        api_params['video_idx'] = $scope.video_idx;

        api_item.get(api_params, function(data){
            $scope.item_list = data.objects;
        });
    }

    $scope.popup_update = function(item, item_info, item_video) {
       Modal.open(
             'views/popup_make.html',
             'PopupMakeCtrl',
             'sisung',
             {
                item: function(){
                return item;
                },
                item_info: function(){
                return item_info;
                },
                item_video: function(){
                return item_video;
                }
             }
       )
       $modalInstance.dismiss('ok');
    };

    var api_params_d = {}

    $scope.item_delete = function(item){
        var del_idx = item.idx;
        console.log(item.idx);
        api_params_d['d_item_idx'] = del_idx
        api_item.delete(api_params_d, function(data){
            if(data.status == 200){
                console.log('성공');
                $modalInstance.dismiss('ok');
                $route.reload();
            }else{
                console.log('실패');
            }
        });
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});
