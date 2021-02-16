'use strict';

angular.module('titanApp')
.controller('VideoAddCtrl', function ($scope, $rootScope, $route, Modal, api_search_youtube, AuthService, api_video) {
    $scope.item = '';
    $scope.video_id = '';
    $scope.user_idx = AuthService.getIdx();
    $scope.video_title = '';
    $scope.video_explanation = '';
    $scope.video_duration = '';
    $scope.video_source = '';
    $scope.video_category = '';
    $scope.video_url = '';
    $scope.video_shared = '';

    $scope.videoAdd = function() {
        var api_params = {};
        api_params['fk_user_idx'] = $scope.user_idx;
        // api_params['video_url'] = 'https://www.youtube.com/watch?v=' + video.id;
        api_params['video_url'] = $scope.video_url;
        api_params['video_title'] = $scope.video_title;
        api_params['video_explanation'] = $scope.video_explanation;
        api_params['video_duration'] = $scope.video_duration;
        api_params['video_source'] = $scope.video_source;
        api_params['video_category'] = $scope.video_category;
        api_params['video_shared'] = $scope.video_shared;

        api_video.save(api_params, function (data) {
            if (data.status == 200) {
                $rootScope.show_videoList = data.objects;
                $rootScope.selected_video_status_title = "나의 상품 동영상 수";
                $route.reload();
                // $modalInstance.dismiss('ok');
            } else {
            }
        });
    }

    $scope.search_youtube = function () {
        console.log($scope.video_id);
        Modal.open(
        'views/popup_video_add.html',
        'VideoAddCtrl',
        '',
        {
            // user_idx: function () {
            //     return user_idx;
            // }
        });
    }
    var _apiKey = "AIzaSyAfUtyjlvezoWXOKnrJKS-zyLJ3_j-vtVM";
    $scope.search_status = false;
    $scope.search_value_status = false;

    $scope.search = function(searchTitle) {
        $scope.video_list = [];
        var api_params = {};
        if (searchTitle) {
            $scope.search_status = true;
            $scope.search_value_status = false;
            api_params['search_title'] = searchTitle;
            api_search_youtube.get(api_params, function (data) {
                if (data.status == 200) {
                    $scope.search_status = false;
                    $scope.search_value_status = false;
                    if (data.objects != '' && data.objects != undefined) {
                        console.log(data.objects);
                        $scope.video_list = data.objects;
                    } else {
                        $scope.video_list = [];
                        $scope.searchTitle = '';
                        $scope.search_status = false;
                        $scope.search_value_status = true;
                    }
                } else {
                    console.log('서버 에러 해당 사이트 관리자에게 문의해주세요.');
                    if (data.objects != '' && data.objects != undefined) {
                        $scope.video_list = data.objects;
                        $scope.search_status = false;
                        $scope.search_value_status = false;
                    } else {
                        $scope.video_list = [];
                        $scope.searchTitle = '';
                        $scope.search_status = false;
                        $scope.search_value_status = true;
                    }
                }
            })
        }
       if(searchTitle) {
           youtubeFactory.getVideosFromSearchByParams({
               q: searchTitle,
               maxResults: 100,
               key: _apiKey,
           }).then(function (data) {
               for (var itemKey in data.data.items) {
                   var items = data.data.items[itemKey];-
                   $scope.video_list.push({
                       "videoId": items.id.videoId,
                       "title": items.snippet.title,
                       "channelTitle": items.snippet.channelTitle,
                       "description": items.snippet.description
                   });
               }
           });
       }
    };
    $scope.addDetail = function(video_id) {
        $scope.video_id = video_id;
        console.log(video_id);
        console.log($scope.video_id);
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});