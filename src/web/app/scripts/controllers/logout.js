'use strict';

angular.module('titanApp')
    .controller('LogoutCtrl', function ($scope, AuthService, $rootScope,$location, Session) {
        // var user_id = $window.sessionStorage.user_id;
        // var userAgent = window.navigator.userAgent;
        // var access_browser = null;
        // var time = new Date();
        // var access_time = time.getFullYear() + "/" + (time.getMonth()+1) + "/" + time.getDate() + "/" +
        //     time.getHours() + "/" + time.getMinutes() + "/" + time.getSeconds();
        //
        // if(userAgent.indexOf("Firefox") != -1)
        //     access_browser = "Firefox";
        // if(userAgent.indexOf("Opera") != -1)
        //     access_browser = "Opera";
        // if(userAgent.indexOf("Chrome") != -1)
        //     access_browser = "Chrome";
        // if(userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1)
        //     access_browser = "Safari";
        // if(userAgent.indexOf("MSIE 6") != -1)
        //     access_browser = "Internet Explorer 6";
        // if(userAgent.indexOf("MSIE 7") != -1)
        //     access_browser = "Internet Explorer 7";
        // if(userAgent.indexOf("MSIE 8") != -1)
        //     access_browser = "Internet Explorer 8";
        // if(userAgent.indexOf("MSIE 9") != -1)
        //     access_browser = "Internet Explorer 9";
        // if(userAgent.indexOf("MSIE 10") != -1)
        //     access_browser = "Internet Explorer 10";
        // if(userAgent.indexOf("rv") != -1)
        //     access_browser = "Internet Explorer 11";
        //
        // var access_platform = window.navigator.appName + " " + window.navigator.platform;
        // var access_type = "logout";
        // var access_ip = $.getJSON("https://api.ipify.org?format=json",
        //     function(data) {
        //         access_ip = (data.ip);
        //         console.log(data.ip);
        //
        //         $scope.credentials = {
        //             "user_id": user_id,
        //             "access_time": access_time,
        //             "access_type": access_type,
        //             "access_browser": access_browser,
        //             "access_platform": access_platform,
        //             "access_ip": data.ip
        //         };
        // });
        //
        // angular.element('.inp_id').trigger('focus');
        //
        // $scope.logout = function (credentials) {
        //     AuthService.logout(credentials);
        // };
        //
        // var api_params = {};
        // api_params['user_id'] = $rootScope.auth.user_id;
        // api_params['f_election_id'] = $rootScope.auth.f_election_id;
        // api_logout.save({},api_params, function (data) {
        //         if (data.status == 200){
        //         }
        // });
        //
        // $location.path("/login", true);
        // $window.location.reload(true);
    });
