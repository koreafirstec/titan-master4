'use strict';

angular.module('titanApp')
.controller('VideoAddDetailCtrl', function ($scope, $rootScope, $window, $route, $modalInstance, video, api_video, AuthService, Modal) {
    $scope.video = video;
    $scope.user_idx = AuthService.getIdx();
    $scope.fk_group_idx = AuthService.getFkGroupIdx();

    $scope.videoAdd = function(video_title) {
        var api_params = {};
        api_params['fk_user_idx'] = $scope.user_idx;
        api_params['fk_group_idx'] = $scope.fk_group_idx;
        api_params['video_source'] = 'youtube';
        api_params['video_url'] = 'https://www.youtube.com/watch?v='+video.id;
        api_params['video_title'] = video_title;

        api_video.save(api_params, function (data) {
            if(data.status == 200){
                $rootScope.show_videoList = data.objects;
                $rootScope.selected_video_status_title = "나의 상품 동영상 수";
                $route.reload();
                $modalInstance.dismiss('ok');
            } else {
                Modal.open(
                    'views/alert_modal.html',
                    'AlertCtrl',
                    'sisung',
                    {
                        alertTitle: function(){
                            return "영상 추가";
                        },
                        alertMsg: function(){
                            return "해당 영상이 이미 존재합니다.";
                        }
                    }
                );
            }
        });
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});