'use strict';

angular.module('titanApp')
    .controller('PopupUserUpdateCtrl', function ($scope, user_idx, $window, $rootScope, $timeout, $location, $filter, $route, AuthService,ENV, api_user,$modalInstance, Modal/*,Modal,ENV,api_item, item_main, item_sub, item_price, item_title, item_description, item_redirect_url, item_img_path, itemListParams,item, $sce,CanvasDirective ,item_detail*/) {
        $scope.user_idx = user_idx;
        $scope.user_title = "정보 수정";

        var api_params = {};
        api_params['user_idx'] = user_idx;

        api_user.get(api_params, function(data){
            if(data.status == 200){
                $scope.user_id = data.objects[0].user_id;
                $scope.user_name = data.objects[0].user_name;
                $scope.user_pw = '';
            }
        });

        $scope.close = function () {
            // $scope.delete_item(item_info.fk_item_idx);
            $modalInstance.dismiss('cancel');
        };

        $scope.user_update = function() {
            var agree = confirm('정말 수정하시겠습니까?');
            if(agree){
                api_params['user_idx'] = user_idx;
                api_params['user_id'] = $scope.user_id;
                api_params['user_name'] = $scope.user_name;
                if ($scope.user_pw != ''){
                    api_params['user_pw'] = $scope.user_pw;
                };
                api_user.update(api_params, function(data){
                    if(data.status==200){
                        // console.log(data.objects);
                        $modalInstance.dismiss('cancel');
                        alert('수정이 성공적으로 이루어졌습니다.');
                        $route.reload();
                    }
                });
            }else {
                alert('취소하셨습니다.');
            }
        }
    });