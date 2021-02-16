'use strict';

angular.module('titanApp')
.controller('ItemListCtrl', function ($scope, $timeout, api_item, api_video) {
    var video_detail;
    var video_id;
    $scope.item_title = '';
    $scope.item_description = '';
    $scope.item_redirect_url = '';
    // var parameters;

    api_item.get(null, function(data){
        $scope.item_list = data.objects;

        var api_params = {};
        api_params['limit'] = 100;
        api_params['offset'] = 0;
        api_video.get(api_params, function (data) {
            $scope.video_list = data.objects;
            for(var i = 0; i < $scope.item_list.length; i++) {
                video_detail = $scope.video_list.filter(function(d) { return d.idx == $scope.item_list[i].fk_video_idx; })[0];
                video_id = video_detail.video_url.substr(32, 11);
                $scope.item_list[i].video_id = video_id;
            }
        });
        //  api_shape.get(null, function (data) {
        $scope.inform_on = function(item_idx){
            api_get_item.get(item_idx, function(data){
                $scope.item_list = data.objects;
                $scope.item_title = $scope.item_list.item_title;
                $scope.item_description = $scope.item_list.item_description;
                $scope.item_redirect_url = $scope.item_list.item_redirect_url;
            });
            angular.element('#item_inform_area').css('display', 'block');
        }
        //  api_shape_list.get(null, function (data) {
        //     var api_params = {};
        //     if (data.status == 200) {
        //         $scope.list_count = data.objects[0].video_total;
        //         $scope.item_all_count = data.objects[0].item_count;
        //         $scope.all_shape_item = data.objects[0].all_shape_item;
        //         parameters = {
        //             page: 1,
        //             count: $scope.list_count,
        //             sorting: {}
        //         };
        //         $timeout(function () {
        //             $scope.shape_lists = data.objects;
        //         }, 500);
        //         $scope.video_status = 0;
        //         api_params['limit'] = parameters.count;
        //         api_params['offset'] = (parameters.page - 1) * api_params['limit'];
        //         // api_params['user_idx'] = $scope.user_idx;
        //     }
        // });
    });
});