'use strict';

angular.module('titanApp')
    .factory('AuthService', function ($http, $window, $rootScope, $location, ENV, Session, Modal, api_user_role) {
        var loginUrl = ENV.host + '/api/login';
        var logoutUrl = ENV.host + '/api/logout';
        var joinUrl = ENV.host + '/api/join';
        var userAddUrl = ENV.host + '/api/user';
           function b64EncodeUnicode(str) {
               return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                   function toSolidBytes(match, p1) {
                       return String.fromCharCode('0x' + p1);
               }));
           }
           function b64DecodeUnicode(str) {
               return decodeURIComponent(window.atob(str).split('').map(function(c) {
                   return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
               }).join(''));
           }

        // Public API here
        $rootScope.isAdmin = false;
        return {
            login: function (credentials) {
                return $http({
                    method: 'post',
                    url: loginUrl,
                    headers: {'Content-Type': 'application/json'},
                    data: credentials
                })
                .success(function (data) {
                    var auth = data.objects[0];
                    $rootScope.auth = auth;
                    // alert(auth.election_name);
                    if(auth.user_right == 1){
                        $rootScope.isAdmin = true;
                    }else{
                        $rootScope.isAdmin = false;
                    }
                    Session.set('user_right', auth.user_right);
                    $window.sessionStorage.user_name = b64EncodeUnicode(String(auth.user_name));
                    $window.sessionStorage.user_id = b64EncodeUnicode(auth.user_id);
                    $window.sessionStorage.idx = b64EncodeUnicode(auth.idx);
                    $window.sessionStorage.fk_group_idx = b64EncodeUnicode(auth.fk_group_idx);
//                    $window.sessionStorage.user_right = auth.user_right;

                    if(auth.login){
                        Session.set('accessToken', b64EncodeUnicode(auth.token));
                        $http.defaults.headers.get = {token: auth.token};
                        $http.defaults.headers.get['If-Modified-Since'] = new Date().getTime();
                        $http.defaults.headers.get['Cache-Control'] = 'no-cache';
                        $http.defaults.headers.get['Pragma'] = 'no-cache';
                        $http.defaults.headers.put["token"] = auth.token;
                        $http.defaults.headers.post["token"] = auth.token;
                        $http.defaults.headers.common["token"] = auth.token;

                        if(auth.userOTP){
                            Session.set('passOTP', false);
                            $location.path('/login-otp');
                        }else{
                            Session.clear('passOTP');

                            var argument = {};
                            argument['type'] = true;    //login

                            var userAgent = window.navigator.userAgent;
                            var browser_ver = null;
                            var os_ver = null;
                            var time = new Date();
                            var access_time = time.getFullYear() + "/" + (time.getMonth()+1) + "/" + time.getDate() + "/" +
                                time.getHours() + "/" + time.getMinutes() + "/" + time.getSeconds();

                            if(userAgent.indexOf("Firefox") != -1)
                                browser_ver = "Firefox";
                            if(userAgent.indexOf("Opera") != -1)
                                browser_ver = "Opera";
                            if(userAgent.indexOf("Chrome") != -1)
                                browser_ver = "Chrome";
                            if(userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1)
                                browser_ver = "Safari";
                            if(userAgent.indexOf("MSIE 6") != -1)
                                browser_ver = "Internet Explorer 6";
                            if(userAgent.indexOf("MSIE 7") != -1)
                                browser_ver = "Internet Explorer 7";
                            if(userAgent.indexOf("MSIE 8") != -1)
                                browser_ver = "Internet Explorer 8";
                            if(userAgent.indexOf("MSIE 9") != -1)
                                browser_ver = "Internet Explorer 9";
                            if(userAgent.indexOf("MSIE 10") != -1)
                                browser_ver = "Internet Explorer 10";
                            if(userAgent.indexOf("rv") != -1)
                                browser_ver = "Internet Explorer 11";

                            Session.set('')
                            argument['browser_ver'] = browser_ver || "unknown"; // browser version

                            var appVersion = window.navigator.appVersion;
                            var appplatform = window.navigator.appName + window.navigator.platform;
                            var os_versions = {Windows: "Win", MacOS: "Mac", UNIX: "X11", Linux: "Linux"};

                            for(var key in os_versions) {
                              if (appVersion.indexOf(os_versions[key]) != -1) {
                                os_ver = key;
                              }
                            }
                            argument['os_ver'] = os_ver || "unknown";   //os version


                            var change_uri = "/";

                            $location.path(change_uri);
                        }
                    }else if(!auth.login && auth.err_code==100){
                        Modal.open(
                            'views/alert_modal.html',
                            'AlertCtrl',
                            'sisung',
                            {
                                alertTitle: function () {
                                    return "로그인";
                                },
                                alertMsg: function () {
                                    return "ID/PW가 일치하지 않습니다.";
                                }
                            }
                        );
                    }else if(!auth.login && data.status==401){
                        Modal.open(
                            'views/alert_modal.html',
                            'AlertCtrl',
                            'sisung',
                            {
                                alertTitle: function () {
                                    return "로그인";
                                },
                                alertMsg: function () {
                                    return "인증되지 않은 계정입니다.";
                                }
                            }
                        );
                    }else{
                      alert("서버 Error.");
                    }
                });
            },
            logout: function (credentials) {
                return $http({
                    method: 'post',
                    url: logoutUrl,
                    headers: {'Content-Type': 'application/json'},
                    data: credentials
                })
                .success(function (data) {
                    var auth = data.objects[0];
                    $rootScope.auth = auth;
                    $window.sessionStorage.clear();
                    $window.localStorage.clear();
                    var argument = {};
                    argument['type'] = false;    //logout
                    $location.path("/login", true);
                    $window.location.reload(true);
                });
            },
            join: function (credentials) {
                return $http({
                    method: 'post',
                    url: joinUrl,
                    headers: {'Content-Type': 'application/json'},
                    data: credentials
                })
                .success(function (data) {
                    var auth = data.objects[0];
                    if(auth.join) {
                        // Modal.open(
                        //     'views/alert_modal.html',
                        //     'AlertCtrl',
                        //     'sisung',
                        //     {
                        //         alertTitle: function(){
                        //             return "사용자 추가";
                        //         },
                        //         alertMsg: function(){
                        //             return "회원가입이 완료되었습니다.";
                        //         }
                        //     }
                        // );
                        // alert("회원가입이 완료되었습니다. 이메일을 인증해주세요");
                        $location.path('/join_success', true);
                    }else if (data.status == 402){
                        Modal.open(
                            'views/alert_modal.html',
                            'AlertCtrl',
                            'sisung',
                            {
                                alertTitle: function(){
                                    return "사용자 추가";
                                },
                                alertMsg: function(){
                                    return "같은 아이디의 사용자가 이미 있습니다.";
                                }
                            }
                        );
                    } else {
                        alert("서버 Error.");
                    }
                });
            },
            userAdd: function (credentials) {
                return $http({
                    method: 'post',
                    url: userAddUrl,
                    headers: {'Content-Type': 'application/json'},
                    data: credentials
                })
                .success(function (data) {
                    var auth = data.objects[0];
                    if(auth.user_add) {
                        // Modal.open(
                        //     'views/alert_modal.html',
                        //     'AlertCtrl',
                        //     'sisung',
                        //     {
                        //         alertTitle: function(){
                        //             return "사용자 추가";
                        //         },
                        //         alertMsg: function(){
                        //             return "사용자 추가가 완료되었습니다.";
                        //         }
                        //     }
                        // );
                    }else if (data.status == 402){
                        Modal.open(
                            'views/alert_modal.html',
                            'AlertCtrl',
                            'sisung',
                            {
                                alertTitle: function(){
                                    return "사용자 추가";
                                },
                                alertMsg: function(){
                                    return "같은 아이디의 사용자가 이미 있습니다.";
                                }
                            }
                        );
                    } else {
                        alert("서버 Error.");
                    }
                });
            },
            isAuthenticated: function () {
                var accessToken = null
                if(Session.get('accessToken') != undefined){
                    accessToken = b64DecodeUnicode(Session.get('accessToken'));
                }
                var passOTP = Session.get('passOTP');
                var isAuth = false;

                // [ Case by ] Login Success
                if(!!accessToken){
                    // [ Case by ] do not use OTP
                    if(passOTP == undefined){
                        isAuth = true;
                    // [ Case by ] use OTP
                    }else{
                        isAuth = passOTP;
                    }
                // [ Case by ] Login Fail
                }else{
                    isAuth = false;
                }

                return isAuth;
            },

            isAdminCheck:function () {
                var user_right = Session.get('user_right');
                if (user_right == 0)
                    $rootScope.isAdmin = true;
                else
                    $rootScope.isAdmin = false;
                return $rootScope.isAdmin;
            },
            getUserName:function(){
                if($window.sessionStorage.user_name != undefined){
                    return b64DecodeUnicode($window.sessionStorage.user_name);
                }else{
                    return 'user_name';
                }
            },
            getUserId:function(){
                if($window.sessionStorage.user_id != undefined){
                    return b64DecodeUnicode($window.sessionStorage.user_id);
                }else{
                    return 'user_id';
                }
            },
            getIdx:function(){
                if($window.sessionStorage.idx != undefined){
                    return b64DecodeUnicode($window.sessionStorage.idx);
                }else{
                    return 'idx';
                }
            },
            getFkGroupIdx:function(){
                if($window.sessionStorage.fk_group_idx != undefined){
                    return b64DecodeUnicode($window.sessionStorage.fk_group_idx);
                }else{
                    return 'fk_group_idx';
                }
            },

            // isRoleCheck:function (role_idx) {
            //     var api_params = {};
            //
            //     api_params['user_idx'] = Session.get('idx');
            //     api_params['role_idx'] = role_idx;
            //     api_user_role.get(api_params, function(data){
            //         return data.status === 200;
            //     })
            // }
        };
    });
