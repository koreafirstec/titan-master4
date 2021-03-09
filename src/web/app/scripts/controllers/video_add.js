'use strict';

angular.module('titanApp')
.controller('VideoAddCtrl', function ($scope, $rootScope, $route, Modal, api_search_youtube, AuthService, api_video, $location) {
    $scope.item = '';
    $scope.video_id = '';
    $scope.image_url = "../images/common/no_video.png";
    $scope.user_idx = AuthService.getIdx();
    $scope.video_title = '';
    $scope.youtube_video_url = '';
    $scope.video_explanation = '';
    $scope.video_duration = '';
    $scope.video_source = '';
    $scope.video_category = '';
    $scope.video_shared = '';

    $scope.videoAdd = function(title, duration, source) {
        var api_params = {};
        api_params['fk_user_idx'] = $scope.user_idx;
        api_params['video_url'] = $("#video_url").val();
        api_params['video_title'] = $("#video_title").val();
        api_params['video_explanation'] = $scope.video_explanation;
        api_params['video_duration'] = $("#video_duration").val();
        api_params['video_source'] = $("#video_source").val();
        api_params['video_category'] = $scope.video_category;
        var chk = $("sh_en").is(":checked");
        if(document.getElementById('sh_en').checked) {
            console.log("en", $("#sh_en").val())
            api_params['video_shared'] = $("#sh_en").val();
        }else{
            console.log("dis")
            api_params['video_shared'] = $("#sh_dis").val();
        }
        api_video.save(api_params, function (data) {
            if (data.status == 200) {
                $rootScope.show_videoList = data.objects;
                $rootScope.selected_video_status_title = "나의 상품 동영상 수";
                $location.url('/video_list', true);
            }
        });
    }

    $scope.search_youtube = function () {
        Modal.open(
             'views/popup_video_add.html',
             VideoAddExampleCtrl,
             'sisung',
       )
    }
});

var VideoAddExampleCtrl = function ($scope, $rootScope, $route, $modalInstance, api_search_youtube, AuthService, api_video, $location) {
        var _apiKey = "AIzaSyAfUtyjlvezoWXOKnrJKS-zyLJ3_j-vtVM";
        $scope.search_status = false;
        $scope.search_value_status = false;
//       if(searchTitle) {
//           youtubeFactory.getVideosFromSearchByParams({
//               q: searchTitle,
//               maxResults: 100,
//               key: _apiKey,
//           }).then(function (data) {
//               for (var itemKey in data.data.items) {
//                   var items = data.data.items[itemKey];-
//                   $scope.video_list.push({
//                       "videoId": items.id.videoId,
//                       "title": items.snippet.title,
//                       "channelTitle": items.snippet.channelTitle,
//                       "description": items.snippet.description
//                   });
//               }
//           });
//       }
        $scope.search = function(searchTitle) {
            $scope.video_list = [];
            var api_params = {};
            if (searchTitle) {
                $scope.search_status = true;
                $scope.search_value_status = false;
                api_params['search_title'] = searchTitle;
                api_search_youtube.get(api_params, function (data) {
                    if (data.status == 200) {
                        console.log(data.objects)
                        $scope.search_status = false;
                        $scope.search_value_status = false;
                        if (data.objects != '' && data.objects != undefined) {
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
        }

        $scope.addDetail = function(video) {
            $scope.youtube_video_url = "https://www.youtube.com/watch?v="+video.id;
            $("#video_url").val($scope.youtube_video_url);
            $("#video_title").val(video.title);
            $scope.video_duration = video.duration;
            var beforeStr = String($scope.video_duration)
            var afterStr = beforeStr.split(":")
            switch(afterStr.length){
                case 1:
                    $scope.video_duration = "00:"+String(afterStr[0]).padStart(2, '0')
                    break;
                case 2:
                    $scope.video_duration = String(afterStr[0]).padStart(2, '0')+":"+String(afterStr[1]).padStart(2, '0')
                    break;
                case 3:
                    $scope.video_duration = String(afterStr[0]).padStart(2, '0')+":"+String(afterStr[1]).padStart(2, '0')+":"+String(afterStr[2]).padStart(2, '0')
                    break;
            }
            $("#video_duration").val($scope.video_duration);
            $("#video_source").val("youtube");
            $scope.video_id = video.id;
            $scope.image_url = "https://img.youtube.com/vi/"+video.id+"/hqdefault.jpg";
            $(".image_video_add").attr("ng-src", $scope.image_url)
            $(".image_video_add").attr("src", $scope.image_url)
        };


        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    };