'use strict';

angular.module('titanApp')
    .controller('ApplicationCtrl', function ($scope, $window, $rootScope, $http, $location, $route, Session, AuthService, Modal, api_logout, api_user_role, api_video) {
        // COMMON ------------------------------------------------------------------------------------------------------
        $rootScope.timeout = false;
        $scope.isAuthenticated = AuthService.isAuthenticated();
        $scope.user_name = AuthService.getUserName();
        $scope.user_id = AuthService.getUserId();
        $scope.idx = AuthService.getIdx();
        $scope.fk_group_idx = AuthService.getFkGroupIdx();
        $rootScope.access_ip = null;

        $scope.playAlert = setInterval(function () {
            if($scope.isAuthenticated == true && $window.sessionStorage.user_right == 8 && $rootScope.timeout == false){
                var change_uri ="/logout";
                $location.path(change_uri, true);
                $route.reload();
            }
            $rootScope.timeout = false;
        },30*60*1000);

        function roleCheck() {
            var api_params = {};

            api_params['user_idx'] = AuthService.getIdx();
            api_user_role.get(api_params, function(data){
                $scope.isRole = data.status;
            })
        }

        $scope.$watch(AuthService.isAuthenticated, function(newVal){//watch - isAuthenticated at services/api/access.js
            $scope.isAuthenticated = newVal;
            $scope.isAdmin = AuthService.isAdminCheck();
            roleCheck();
            $scope.user_name = AuthService.getUserName();
            $scope.user_id = AuthService.getUserId();
            $scope.idx = AuthService.getIdx();

            if($scope.isAuthenticated){
                $scope.accessToken = Session.get('accessToken');
                $http.defaults.headers.get = {token: $scope.accessToken};
                $http.defaults.headers.get['If-Modified-Since'] = new Date().getTime();
                $http.defaults.headers.get['Cache-Control'] = 'no-cache';
                $http.defaults.headers.get['Pragma'] = 'no-cache';
                $http.defaults.headers.put["token"] = $scope.accessToken;
                $http.defaults.headers.post["token"] = $scope.accessToken;
                $http.defaults.headers.common["token"] = $scope.accessToken;

            }else{
                var change_uri = "/logout";
                if ($location.absUrl().indexOf('join') !== -1 || $location.absUrl().indexOf('video_play') !== -1) {
//                    console.log($location.absUrl().split('#')[1]);
                    change_uri = $location.path($location.absUrl().split('#')[1]);
                }
                $route.reload();
            }
        });

        $scope.dragOptions = {
            start: function(e) {
              console.log("STARTING");
            },
            drag: function(e) {
              console.log("DRAGGING");
            },
            stop: function(e) {
              console.log("STOPPING");
            },
            container: 'container-id'
        };

        $scope.onActiveMenu = function(current_uri, link_tag){
            if(current_uri == link_tag){
                return true;
            }else{
                return false;
            }
        };


        $scope.currentURI = function () {
            var fullUrl = $location.absUrl();
            if(fullUrl.indexOf("video_list") != -1)
                return "video_list";
            else if (fullUrl.indexOf("item_list.html") != -1)
                return "item_list.html";
            else if (fullUrl.indexOf("video_make") != -1)
                return "video_make";
            else if (fullUrl.indexOf("temp_video_make") != -1)
                return "temp_video_make.html";
            else if (fullUrl.indexOf("video_editor") != -1)
                return "video_editor.html";
            else if (fullUrl.indexOf("manage/user.html") != -1)
                return "manage_user.html";
            else
                return "login";

        };

        $scope.movePage = function(page){
            window.scrollTo(0,0);
            $rootScope.selectedItem = '';
            $rootScope.hour = 0;
            $rootScope.minutes = 0;
            $rootScope.seconds = 0;
            //etc param remove
//            alert(page);
            var change_uri = '';
            if(page == 'logout'){
                change_uri = '/logout';
            } else if(page == 'video_list'){
                change_uri = '/video_list';
            } else if(page == 'item_list'){
                change_uri = '/item_list';
            } else if(page == 'video_make') {
                change_uri = '/video_make';
            }else if(page == 'manage_user') {
                change_uri = '/manage/user';
            } else if(page == 'temp_video_make') {
                change_uri = '/temp_video_make';
            } else if(page == 'video_editor') {
                change_uri = '/video_editor';
            } else if(page == 'my_item') {
                change_uri = '/my_item';
            } else if(page == 'join') {
                change_uri = '/join';
            } else {
                change_uri = '/login';
            }

            var full_uri = $location.absUrl();
            var uri_split = full_uri.split('#');
            var current_uri = uri_split[1];
            // $window.location.reload();
            if(current_uri != change_uri){
                $location.url(change_uri, true);
            } else {
                $window.location.reload();
            }
        };
        
        $scope.onUserModify = function (user_idx) {
            // console.log(user_idx);
            Modal.open(
                'views/popup_user_update.html',
                'PopupUserUpdateCtrl',
                'sisung',
                {
                    user_idx: function () {
//                   console.log(item);
                        return user_idx;
                    }
                });
        };


        $scope.refreshPage = function () {
            $route.reload();
        };

        // $scope.VideoInsert = function() {
        //     Modal.open(
        //         'views/popup_video_add.html',
        //         'PopupVideoAddCtrl',
        //         'sisung',
        //         {
        //         },
        //     );
        // }
        //
        // $scope.insert_meta_item = function(){
        //     Modal.open(
        //         'views/video_editor.html',
        //         'VideoEditorCtrl',
        //         'sisung',
        //         {
        //
        //         }
        //     )
        // }

        $scope.onLogout = function () {
            var agree = confirm('정말 로그아웃하시겠습니까?');
            if (agree){
                var user_id = AuthService.getUserId();
                // var user_id = $window.sessionStorage.getItem('user_id');
                var userAgent = window.navigator.userAgent;
                var access_browser = null;
                var time = new Date();
                var access_time = time.getFullYear() + "/" + (time.getMonth()+1) + "/" + time.getDate() + "/" +
                    time.getHours() + "/" + time.getMinutes() + "/" + time.getSeconds();

                if(userAgent.indexOf("Firefox") != -1)
                    access_browser = "Firefox";
                if(userAgent.indexOf("Opera") != -1)
                    access_browser = "Opera";
                if(userAgent.indexOf("Chrome") != -1)
                    access_browser = "Chrome";
                if(userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1)
                    access_browser = "Safari";
                if(userAgent.indexOf("MSIE 6") != -1)
                    access_browser = "Internet Explorer 6";
                if(userAgent.indexOf("MSIE 7") != -1)
                    access_browser = "Internet Explorer 7";
                if(userAgent.indexOf("MSIE 8") != -1)
                    access_browser = "Internet Explorer 8";
                if(userAgent.indexOf("MSIE 9") != -1)
                    access_browser = "Internet Explorer 9";
                if(userAgent.indexOf("MSIE 10") != -1)
                    access_browser = "Internet Explorer 10";
                if(userAgent.indexOf("rv") != -1)
                    access_browser = "Internet Explorer 11";

                var access_platform = window.navigator.appName + " " + window.navigator.platform;
                var access_type = "logout";
                var ip_check = $.getJSON('https://json.geoiplookup.io/api?callback=?', function(data) {
                  console.log(data.ip);
                  $rootScope.access_ip = data.ip;
                });
                // var access_ip = ip_check;
                $scope.credentials = {
                    "user_id": user_id,
                    "access_time": access_time,
                    "access_type": access_type,
                    "access_browser": access_browser,
                    "access_platform": access_platform,
                    "access_ip": $rootScope.access_ip
                };

                AuthService.logout($scope.credentials);
                 var api_params = {};
                // api_params['user_id'] = $rootScope.auth.user_id;
                api_params['user_id'] = AuthService.getUserId();
                // api_params['f_election_id'] = $rootScope.auth.f_election_id;
                api_logout.save({},api_params, function (data) {
                    if (data.status == 200){
                    }
                });

                angular.element('.inp_id').trigger('focus');
                // $scope.logout = function (credentials) {

                // };

                // var api_params = {};
                // api_params['user_id'] = $rootScope.auth.user_id;
                // api_params['f_election_id'] = $rootScope.auth.f_election_id;
                // api_logout.save({},api_params, function (data) {
                //         if (data.status == 200){
                //         }
                // });
            }else{
                alert('취소하셨습니다.');
            }

            };

            $scope.is_user_menu = false;

            $scope.userMenu = function () {
                $scope.is_user_menu = !$scope.is_user_menu;
            }
    });