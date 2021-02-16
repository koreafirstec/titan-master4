'use strict';

angular.module('titanApp')
    .controller('TrainThumListCtrl', function ($scope, $rootScope,$http, $location, $route,AuthService,ngTableParams,$timeout,api_train_thum_List) {
        // COMMON ------------------------------------------------------------------------------------------------------
    $scope.thum_list = null;
    $scope.item_index = 10;
    $scope.thum_list_table_headers = [
    ];

    var params = $location.search();
    $scope.order = params['order'] || '-';
    $scope.order_by = params['order_by'] || 'uname'; //default order by
    var parameters = {
        page: 1,
        count: 2,
        sorting: {}
    };

    var order_by = $scope.order_by;
    var str_order = '';
    if($scope.order == '-'){
        str_order = 'desc';
    }else {
        str_order = 'asc';
    }

    if($scope.thumListParams == undefined){
        $scope.thumListParams = new ngTableParams(parameters, {
            counts: [],
            total: 0,// length of data
            getData: function ($defer, params) {
                var api_params = {};
                api_params['limit'] = params.count();
                api_params['offset'] = (params.page() - 1) * api_params['limit'];
                api_params['item_index'] = $scope.item_index;
                var sorting = params.sorting();

                api_train_thum_List.get(api_params, function (data) {
                    $timeout(function () {
                        //console.log(data);
                        params.total(data.meta.total_count);
                        $defer.resolve(data.objects);
                    }, 500);
                });
            }
        });
    }else{
        $scope.thumListParams.reload();
    }

    $scope.show_thum_image = function (item) {
        var img_path = '/train/images/' + item.fk_item_idx.toString() + '_' + item.position.toString() + '.jpg';
        return img_path;
    };

    $scope.doDraw = function (item,index) {
        console.log("position : " + item.position);
        var left = Math.floor((item.x * 300.0) / 1920);
        var top = Math.floor((item.y * 150.0) / 1080);
        var width = Math.floor((item.width * 300.0) / 1920) - left;
        var height = Math.floor((item.height * 150.0) / 1080) - top;
        // var left =0;
        // var top = 0;
        // var width = 300;
        // var height = 150;
        // console.log(left);
        // console.log(top);
        // console.log(width);
        // console.log(height);
        console.log("index : " + index);
        var canvas_id = 'canvas_1';
        if (index == 1)
            canvas_id = 'canvas_2';

        var canvas = document.getElementById(canvas_id);
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = "red";
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.fillRect(left,top,width,height);
            ctx.clearRect(left +1,top + 1,width-2,height-2);
            // ctx.clearRect(45, 45, 200, 200);
            // ctx.strokeRect(50, 50, 200, 200);
        }
    }

    $scope.get_canvas_id = function (item) {
        return 'mycanvas_' + item.pos;
    }
});
