'use strict';

angular.module('titanApp')
.controller('PopupVideoCaptureCtrl', function ($scope, folder_name, init, $modalInstance, api_video_capture) {
    $scope.video_url = '';
    $scope.no_video_msg = false;

    $scope.search = function() {
        if ($scope.video_url) {
            let api_params = {};
            api_params['video_url'] = $scope.video_url;
            api_params['folder_name'] = folder_name;
            api_params['init'] = init;

            api_video_capture.get(api_params, function(data){
                if(data.status === 200){
                    $modalInstance.close(data.objects);
                } else {
                    $scope.no_video_msg = true;
                    console.log('존재하지 않는 영상입니다.');
                }
            });
        }
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});