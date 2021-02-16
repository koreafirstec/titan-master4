'use strict';

angular.module('titanApp')
    .controller('PopupNewPassword', function ($scope, $rootScope,  $modalInstance, api_temporary_password) {
        $scope.data = {};

        $scope.temporaryPassword = function (){
        var api_params = {};
            api_params['user_name'] = $scope.data.user_name;
            api_params['user_id'] = $scope.data.user_id;
            console.log(api_params);
            api_temporary_password.save(api_params, function(data) {
                if(data.status == 200){
                    alert("이메일 주소로 임시 비밀번호를 보내드렸습니다. 다시 로그인 해 주시기 바랍니다.");
                    $modalInstance.dismiss('cancel');
                }else{
                    alert("존재하지 않는 이메일입니다.");
                }
            });
        };

        $scope.close = function(){
            $modalInstance.dismiss('cancel');
        }
    });