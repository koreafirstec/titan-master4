'use strict';

angular.module('titanApp')
.controller('MyItemCtrl', function ($scope, AuthService, api_video, api_item, Modal, $route) {
    $scope.user_idx = AuthService.getIdx();
    // $scope.fk_group_idx = AuthService.getFkGroupIdx();
    $scope.show = 1;
    var api_params = {};
    api_params['user_idx'] = $scope.user_idx;
    // api_params['fk_group_idx'] = $scope.fk_group_idx;

    // api_video.get(api_params, function (data) {
    //     $scope.video_list = data.objects;
    // });
    //
    // api_item.get(api_params, function(data){
    //     $scope.item_list = data.objects;
    // });

    // $scope.item_update = function(item){
    //     Modal.open(
    //         'views/popup_make.html',
    //         'PopupMakeCtrl',
    //         'sisung',
    //         {
    //             item: function(){
    //                 return item;
    //             },
    //             item_info: function () {
    //                 return item;
    //             },
    //             item_video: function(){
    //                 return 1;
    //             }
    //         }
    //     );
    // };

    // $scope.item_delete = function(item){
    //     var delete_params = {};
    //     delete_params['d_item_idx'] = item.idx;
    //     api_item.delete(delete_params, function (data) {
    //         if(data.status == 200){
    //             $route.reload();
    //         }else{
    //             console.log('fail');
    //         }
    //     });
    // };
});