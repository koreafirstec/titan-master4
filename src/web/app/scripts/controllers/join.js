'use strict';

angular.module('titanApp')
    .controller('JoinCtrl', function ($scope, $window, AuthService, $location, Session, api_join) {
        $scope.credentials = {};

        /* auto focus */
        angular.element('.inp_id').trigger('focus');

        $scope.join = function (credentials) {
            // no data
            console.log(credentials)
            if(!credentials.user_id || !credentials.user_pw || !credentials.user_re_pw || !credentials.user_name) {
                // show err-message
                $scope.credentials.user_id = $scope.credentials.user_id ? $scope.credentials.user_id : " ";
                $scope.credentials.user_pw = $scope.credentials.user_pw ? $scope.credentials.user_pw : " ";
                $scope.credentials.user_name = $scope.credentials.user_name ? $scope.credentials.user_name : " ";
                return;
                alert("입력되지 않은 항목이 있습니다.");
            }
            // password != re_password
            if(credentials.user_pw !== credentials.user_re_pw) {
                ('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                return;
            }

            if ($window.sessionStorage.auth == 0) {
                alert('이메일이 인증되지 않았습니다.');
                return;
            }
            // out of pattern
            // if(document.getElementsByClassName('err-message ng-hide').length !== 4) return;

            // default permission
            credentials['fk_group_idx'] = 2;

            AuthService.join(credentials);
        };

        var accessToken = Session.get('accessToken');

        if(accessToken) {
            $location.path('video_list', true);
        }

        $scope.go_login = function(){
            $location.path('/login', true);
        };

        $scope.auth_id = function(user_id){
            var api_params = {};
            api_params['user_id'] = user_id;
                console.log(api_params['user_id']);
            api_join.get(api_params, function(data){
                if(data.status == 200) {
                    $window.sessionStorage.auth_id = String(data.objects.auth_number);
                    alert('이메일로 발송된 인증코드를 입력해주세요');
                    $('#auth_id').css('display', 'unset');
                    $('#auth_id_check_btn').css('display', 'unset');
                }
            });
        }

        $scope.auth_id_check_number = '';
        $scope.auth_id_check = function (num) {
            if (num == $window.sessionStorage.auth_id){
                $window.sessionStorage.auth = 1;
                alert('이메일 인증이 완료되었습니다');
            }else{
                alert('이메일 인증에 실패하였습니다');
            }
        };
        $scope.join_success = function(){
            $location.path('/join_success', true);
        }
});
