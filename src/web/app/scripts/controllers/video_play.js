'use strict';

angular.module('titanApp')
    .controller('VideoPlayCtrl', function ($scope, $rootScope, $http, $location, $route, AuthService, api_video) {
        $scope.video_id = $route.current.params.video_id;
        $scope.video_detail = null;

        var api_params = {};
        api_params['video_id'] = $scope.video_id;
        api_video.get(api_params, function (data) {
            $scope.video_detail = data.objects[0];
            $scope.video_idx = $scope.video_detail.video_idx;
        });
});
