'use strict';

angular
    .module('titanApp', [
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'ngTable',
        'xeditable',
        'ui.select2',
        'angularFileUpload',
        'angular-loading-bar',
        'highcharts-ng',
        'dndLists',
        'jtt_youtube',
        'angularUtils.directives.dirPagination'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/video_play/:video_id', {
                templateUrl: 'views/video_play.html',
                controller: 'VideoPlayCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/find_id', {
                templateUrl: 'views/find_id.html',
                controller: 'LoginCtrl'
            })
            .when('/find_pw', {
                templateUrl: 'views/find_pw.html',
                controller: 'LoginCtrl'
            })
            .when('/find_pw_email', {
                templateUrl: 'views/find_pw_email.html',
                controller: 'LoginCtrl'
            })
            .when('/join', {
                templateUrl: 'views/join.html',
                controller: 'JoinCtrl'
            })
            .when('/join_success', {
                templateUrl: 'views/join_success.html',
                controller: 'JoinCtrl'
            })
            .when('/logout', {
                templateUrl: 'views/logout.html',
                controller: 'LogoutCtrl'
            })
            .when('/manage/user', {
                activePage: 'manage_user',
                templateUrl: 'views/manage_user.html',
                controller: 'ManageUserCtrl'
            })
            .when('/manage/video_check', {
                activePage: 'manage_video_check',
                templateUrl: 'views/manage_video_check.html',
                controller: 'AdminVideoCtrl'
            })
            .when('/manage/video_management', {
                activePage: 'video_management',
                templateUrl: 'views/video_management.html',
                controller: 'ManageItemCtrl'
            })
            .when('/manage/item_history', {
                activePage: 'manage_item_history',
                templateUrl: 'views/manage_item_history.html',
                controller: 'ManageItemHistoryCtrl'
            })
            .when('/manage/model', {
                activePage: 'manage_model',
                templateUrl: 'views/manage_model.html',
                controller: 'ManageModelCtrl'
            })
            .when('/manage/model_request', {
                activePage: 'manage_model_request',
                templateUrl: 'views/manage_model_request.html',
                controller: 'ManageModelRequestCtrl'
            })
            .when('/manage/user_access_history', {
                activePage: 'manage_user_access_history',
                templateUrl: 'views/manage_user_access_history.html',
                controller: 'ManageUserAccessHistoryCtrl'
            })
            .when('/manage/chart_by_item', {
                activePage: 'chart_by_item',
                templateUrl: 'views/chart_by_item.html',
                controller: 'ChartByItemCtrl'
            })
            .when('/manage/chart_by_user', {
                activePage: 'chart_by_user',
                templateUrl: 'views/chart_by_user.html',
                controller: 'ChartByUserCtrl'
            })
            .when('/temp_video_make', {
                activePage: 'temp_video_make',
                templateUrl: 'views/temp_video_make.html',
                controller: 'TempVideoMakeCtrl'
            })
            .when('/my_item', {
                templateUrl: 'views/my_item.html',
                controller: 'MyItemCtrl'
            })
            //210203 이후 추가
            .when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                controller: 'MyItemCtrl'
            })
            .when('/category', {
                templateUrl: 'views/category.html',
                controller: 'MyItemCtrl'
            })
            .when('/video_add', {
                templateUrl: 'views/video_add.html',
                controller: 'VideoAddCtrl'
            })
            .when('/item_add', {
                templateUrl: 'views/item_add.html',
                controller: 'ItemAddCtrl'
            })
            .when('/video_editor', {
                activePage: 'video_editor',
                templateUrl: 'views/video_editor.html',
                controller: 'VideoEditorCtrl'
            })
            .when('/video_list', {
                activePage: 'video_list',
                templateUrl: 'views/video_list.html',
                controller: 'VideoListCtrl'
            })
            .when('/item_list', {
                activePage: 'item_list',
                templateUrl: 'views/item_list.html',
                controller: 'ItemListCtrl'
            })
            .when('/advertising', {
                activePage: 'item_list',
                templateUrl: 'views/advertising.html',
                controller: 'VideoEditorCtrl'
            })
            .otherwise({
                redirectTo: '/login'
            });
    })
    .run(function ($route, Session, $rootScope, $location, AUTH_EVENTS, AuthService, editableOptions, Modal, api_user_role) {
        var original = $location.path;
        $rootScope.$route = $route;

        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }

            return original.apply($location, [path]);
        };

        function noRoleMessage() {
            Modal.open(
                'views/alert_modal.html',
                'AlertCtrl',
                'sisung',
                {
                    alertTitle: function(){
                        return "권한 없음";
                    },
                    alertMsg: function(){
                        return "권한이 존재하지 않습니다.";
                    }
                }
            );
        }

        function roleCheck(role_idx, prev) {
            var api_params = {};

            api_params['user_idx'] = AuthService.getIdx('idx');
            api_params['role_idx'] = role_idx;
            api_user_role.get(api_params, function(data){
                if (data.status !== 200) {
                    noRoleMessage();
                    $location.path(prev.split('#')[1]);
                }
            })
            // AuthService.isRoleCheck(role_idx), function (is_role) {
            //     if(!is_role) {
            //         noRoleMessage();
            //         $location.path(prev.split('#')[1]);
            //     }
            // };
        }

        $rootScope.$on('$locationChangeStart', function (event, next, prev) {
            var accessToken = Session.get('accessToken');
            var passOTP = Session.get('passOTP');
            var current_url = $location.absUrl();

            //----------------------------------------------------------------------------------------------------------
            // valide token
            //----------------------------------------------------------------------------------------------------------
            // if (!accessToken) {
            //     if (current_url.indexOf('join') !== -1 || current_url.indexOf('video_play') !== -1 || current_url.index('')) {
            //         $location.path(current_url.split('#')[1]);
            //     } else {
            //         $location.path('/login');
            //     }
            //     $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            // }

            // manage user permission check
            if(current_url.indexOf('user') !== -1) {
                roleCheck(4, prev);
            }

            // manage video, item permission check
            // if(current_url.indexOf('check') !== -1) {
            //     roleCheck(3, prev);
            // }

            // manage ai model permission check
            if(current_url.match('(/model)$')) {
                roleCheck(1, prev);
            }

            // manage chart permission check
            else if(current_url.indexOf('chart') !== -1 || current_url.indexOf('item_history') !== -1) {
                roleCheck(2, prev);
            }

            //----------------------------------------------------------------------------------------------------------
            // valide otp
            //----------------------------------------------------------------------------------------------------------
            // if (accessToken && (passOTP == 'false')) {
            //     if (next.templateUrl != 'views/login_otp.html') {
            //         $location.path('/login-otp');
            //     }
            //     $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            // }
            //----------------------------------------------------------------------------------------------------------
            // mobile location change
            //----------------------------------------------------------------------------------------------------------
            //if (current_url.indexOf("/m") == -1){
            //    if (next.templateUrl != 'views/m.live_status.html' || next.templateUrl != 'views/m.report.html'){
            //        $location.path('/m.dash');
            //    }
            //}
        });

        editableOptions.theme = 'bs3';
    });