'use strict';

angular.module('titanApp')
    .controller('ManageUserCtrl', function ($scope, $window, $rootScope, $timeout, $location, $filter, $route, AuthService,ENV, api_user, api_role, api_user_role, Modal, ngTableParams) {
        $scope.title = "관리자 페이지";

        $scope.user_idx = AuthService.getIdx();
        $scope.fk_group_idx = AuthService.getFkGroupIdx();
        $scope.limit_value = 10;

        $scope.popupVisibility = false;

        $scope.checkedItems = [];

        var api_params = {};
        api_params['user_idx'] = $scope.user_idx;

        api_user.get(api_params, function (data) {
            $scope.userList = data.objects;
        });

        $scope.limitValue = function(limit){
            $scope.limit_value = parseInt(limit);
        };

        $scope.check_user = function() {
            $scope.popupVisibility = true;
        };

        function changeRoleAsList(checkedList, roles) {
            console.log($scope.userRoleList);
            checkedList.forEach(((isValid, user_index) => {
                // console.log("isvalid : ", isValid, " , user_idx : ", user_index);
                roles.forEach((role, role_index) => {
                // console.log("role : ", role, " , role_idx : ", role_index);
                    if (isValid)
                        setRole(user_index, (role_index + 1), role)
                })
            }))
        }

        $scope.user_table_headers = [
            {name: 'No.', class_name: 'no', sortable: false},
            {name: '아이디', class_name: 'id', sortable: true, field: 'user_id'},
            {name: '이름', class_name: 'name', sortable: true, field: 'user_name'},
            {name: '선택', class_name: 'choose'}
        ];

        $scope.roleItemList = [
            false,
            false,
            false,
            false
        ];

        $scope.roleSelected = function() {
            $scope.popupVisibility = false;
            changeRoleAsList($scope.checkedItems, $scope.roleItemList)
        };

        $scope.changeRoleListItem = function (role) {
          if ($scope.$$phase == '$apply' || $scope.$$phase == '$digest' ) {
              $scope.roleItemList[role] = !$scope.roleItemList[role];
          } else {
            $scope.$apply(function() {
                $scope.roleItemList [role] = !$scope.roleItemList[role];
            });
          }
        };

        var parameters = {
            page: 1,
            count: 10,
            sorting: {}
        };

        if ($scope.userListParams == undefined) {
            $scope.userListParams = new ngTableParams(parameters, {
                counts: [],
                total: 0,
                getData: function ($defer, parameters) {
                    var api_params = {};
                    api_params['user_idx'] = $scope.user_idx;
                    api_params['limit'] = parameters.count();
                    api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
                    api_user.get(api_params, function (data) {
                        $timeout(function () {
                            parameters.total(data.meta.total_count);
                            $defer.resolve(data.objects);
                        }, 500);
                    });
                }
            });
        } else {
            $scope.userListParams.reload();
        }

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
        $scope.onUserDelete = function(user_idx) {
            var api_params_d = {};
            api_params_d['user_idx'] = user_idx;
            console.log(idx);
            var drop_user = confirm('정말로 삭제하시겠습니까?');
            if (drop_user == true) {
                api_user.delete(api_params_d, function (data) {
                    if (data.status == 200)
                        $route.reload();
                });
            } else {
                alert('취소하셨습니다.');
            }
        };

        $scope.user_add = function(){
            Modal.open(
                'views/popup_user_add.html',
                'PopupUserAddCtrl',
                'sisung',
                {
            });
        };

        $scope.editRole = function(){
            Modal.open(
                'views/popup_user_role.html',
                'PopupUserRoleCtrl',
                'sisung',
                {
                    // alertTitle: function(){
                    //     return "권한 없음";
                    // },
                    // alertMsg: function(){
                    //     return "권한이 존재하지 않습니다..";
                    // }
                }
            );
        };

    //    Role
        var role_params = {};
        role_params['user_idx'] = $scope.user_idx;

        api_user.get(role_params, function (data) {
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

        function hasRole(user_id, role_id) {
            console.log("roleList : " , $scope.userRoleList.find((roleList) => roleList.fk_user_idx === user_id && roleList.fk_role_idx === role_id) !== undefined);
            if ($scope.userRoleList.find((roleList) => roleList.fk_user_idx === user_id && roleList.fk_role_idx === role_id) !== undefined)
                return true;
            return false;
        }

        function setRole(user_idx, role_idx, role_value) {
            if (role_value === true && !hasRole(user_idx, role_idx)) {
                role_params = {};
                role_params['user_idx'] = user_idx;
                role_params['role_idx'] = role_idx;

                api_user_role.save(role_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            } else if (role_value === false) {
                role_params = {};
                role_params['user_idx'] = user_idx;
                role_params['role_idx'] = role_idx;

                api_user_role.delete(role_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            }
        }

        $scope.roleChange = function(user_idx, role_idx) {
            var permission = userRoleCheck(user_idx, role_idx);
            if(permission === 1) {
                role_params = {};
                role_params['user_idx'] = user_idx;
                role_params['role_idx'] = role_idx;

                api_user_role.delete(role_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            } else {
                role_params = {};
                role_params['user_idx'] = user_idx;
                role_params['role_idx'] = role_idx;

                api_user_role.save(role_params, function (data) {
                    $scope.userRoleList = data.objects;
                });
            }
        };

    });