'use strict';

angular.module('titanApp')
    .controller('LoginCtrl', function ($scope, AuthService, $location, Session, $route, Modal, api_temporary_password, api_auth) {
        $scope.temporaryPassword = '';
        // $scope.self_url = window.location.href;
        // $scope.email_auth_id = $scope.self_url.substr(28);
        // if ($scope.email_auth_id != ''){
        //     var api_params = {};
        //     api_params['id'] = $scope.email_auth_id;
        //     console.log(api_params['id']);
        //     api_auth.get(api_params, function (data) {
        //         if (data.status == 200) {
        //             alert("이메일 인증에 성공하셨습니다!");
        //         }else{
        //             alert("이메일 인증을 다시 한 번 시도해주세요.")
        //         }
        //     });
        // };
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

        // Session.set('');
        // argument['access_browser'] = access_browser || "unknown"; // browser version

        var access_platform = window.navigator.appName + " " + window.navigator.platform;
        var access_type = "login";
        $scope.credentials = {
                "access_time": access_time,
                "access_type": access_type,
                "access_browser": access_browser,
                "access_platform": access_platform
            };
        // console.log(access_ip);
        // $scope.credentials = {
        //     "access_time": access_time,
        //     "access_type": access_type,
        //     // "access_browser": access_browser,
        //     // "access_platform": access_platform,
        //     "access_ip": access_ip
        // };

        /* auto focus */
        angular.element('.inp_id').trigger('focus');

        $scope.login = function (credentials) {
            AuthService.login(credentials);
        };

        var accessToken = Session.get('accessToken');

        if(accessToken) {
            $location.path('dashboard', true);
        }


        $scope.user_id = '';
        $scope.get_user_id = function(){
            var api_params = {};
            $scope.user_id = prompt("임시 비밀번호를 발급 받을 계정의 아이디를 입력해주세요");
            if ($scope.user_id != null&&$scope.user_id != ''){
                api_params['user_id'] = $scope.user_id;
                api_temporary_password.get(api_params, function(data) {
                     if(data.status == 200) {
                         $scope.temporaryPassword = data.objects.temporaryPassword;
                         alert("임시 비밀번호는 " + $scope.temporaryPassword + " 입니다. 접속 후, 비밀번호를 변경해주세요");
                     }
                     else if(data.status == 500){
                         alert("존재하지 않는 계정입니다.");
                     }
                });
            }
        };
        $scope.openNewPw = function(){
            Modal.open(
                'views/popup_new_password.html',
                'PopupNewPassword'
                );
        };
        $scope.go_login = function(){
            $location.path('/login', true);
        };
        $scope.go_join = function(){
            $location.path('/join', true);
        };
        $scope.go_find_id = function(){
            $location.path('find_id');
        };
        $scope.go_find_pw = function(){
            $location.path('find_pw');
        };
        $scope.go_find_pw_email = function() {
            $location.path('find_pw_email')
        }

        $scope.find_id_email_auth = function() {
            alert('등록된 이메일이 없습니다. 입력된 이메일 확인 후 다시 시도해주세요.');
        }


    });