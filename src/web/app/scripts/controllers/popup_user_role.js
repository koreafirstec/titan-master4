   'use strict';

angular.module('titanApp')
    .controller('PopupUserRoleCtrl', function ($scope, $modalInstance, AuthService, api_user, api_role, api_user_role, $timeout) {
        $scope.title = '사용자 권한 관리';

        $scope.user_idx = AuthService.getIdx();

        var api_params = {};
        api_params['user_idx'] = $scope.user_idx;

        api_user.get(api_params, function (data) {
            $scope.userList = data.objects;
        });

        api_role.get(null, function (data) {
            $timeout(function () {
                $scope.roleList = data.objects;
            }, 500);
        });

        api_user_role.get(null, function (data) {
            $scope.userRoleList = data.objects;
        });

        function userRoleCheck(user_idx, role_idx) {
            return $scope.userRoleList.filter(function(d) {
               return d.fk_user_idx === user_idx && d.fk_role_idx === role_idx;
            }).length;
        }

        $scope.getRoleInfo = function(user_idx, role_idx) {
            var permission = userRoleCheck(user_idx, role_idx);
            if(permission === 1) {
                return 'permit_role';
            }
        };

        $scope.roleChange = function(user_idx, role_idx) {
            var permission = userRoleCheck(user_idx, role_idx);
            if(permission === 1) {
                api_params = {};
                api_params['user_idx'] = user_idx;
                api_params['role_idx'] = role_idx;

                api_user_role.delete(api_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            } else {
                api_params = {};
                api_params['user_idx'] = user_idx;
                api_params['role_idx'] = role_idx;

                api_user_role.save(api_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            }
        };

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    });