'use strict';

angular.module('titanApp')
    .directive('mainHeader', function ($location, $window, $rootScope, $route, AuthService, api_user_role) {
        return {
            restrict: 'A',
            template:'<div class="header">' +
                        '<div class="WIXI-">' +
                            'WIXI 통합 관리' +
                        '</div>' +
                    // '</div>' +
                        // '<header class="header">' +
                        //     '<div class="brand">' +
                        //         '<a href="" ng-href="#/video_list">TITANS</a></div>' +
                        //             '<nav class="header__nav__main">' +
                        //                 '<a href="" ng-repeat="menu in main_settings" ng-click="move_header_page(menu.page)" ng-class="menu.class">' +
                        //                     '<span ng-show="CheckGroups(menu.groups)" ng-class="{active: $route.current.activePage == video_list}">{{menu.title}}</span>' +
                        //                 '</a>' +
                        //             '</nav>' +
                        //             '<nav class="header__nav__sub">' +
                        //             '<ul>' +
                        //                 '<li class="dropdown">' +
                        //                     '<a href="" class="nav-item dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"' +
                        //                        'aria-expanded="false"><i class="fa fa-user"></i><span class="label__account">{{user_name}}</span></a>' +
                        //                     '<div class="dropdown-menu js-content-provider-menu" aria-labelledby="dropdown">' +
                        //                         '<h6 class="dropdown-header">서비스 계정</h6>' +
                        //                             '<a href="" class="dropdown-item js-content-provider-item" data-dropdown-value="8813" ng-click="onUserModify(idx)">' +
                        //                                 '<i class="fa fa-user"></i>{{user_name}}' +
                        //                             '</a>' +
                        //                     '</div>' +
                        //                 '</li>' +
                        //                 // '<li>' +
                        //                 //     '<a href="" class="nav-item"><i class="fa fa-cog"></i></a>' +
                        //                 // '</li>' +
                        //                 '<li class="dropdown">' +
                        //                     '<a class="nav-item dropdown-toggle" data-toggle="dropdown" href="" role="button"' +
                        //                        'aria-haspopup="true" aria-expanded="false"><i class="fa fa-power-off mr-xs"></i></a>' +
                        //                     '<div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdown">' +
                        //                         '<a href="" class="dropdown-item" ng-click="onLogout()"><i class="fa fa-sign-out-alt mr-xs"></i>로그아웃</a>' +
                        //                     '</div>' +
                        //                 '</li>' +
                        //             '</ul>' +
                        //         '</nav>' +
                        //         '<nav class="header__nav__mobile">' +
                        //             '<button type="button" ng-click="open_navigation()"><i class="fa fa-bars"></i></button>' +
                        //         '</nav>' +
                        //     '</header>' +
                        '</div>',
            link: function (scope) {
                scope.main_settings = [
                    {idx: 1, title: '상품 목록', page: 'video_list', class: 'nav-item', groups: 0},
                    {idx: 2, title: '크롬 확장기능 다운로드', page: 'chrome_extension', class: 'nav-item', groups: 0},
                    // {idx: 3, title: '모델관리', page: 'manage_model', class: 'nav-item', groups: 1},
                ];
                var open_nav = false;
                scope.CheckGroups = function(needs) {
                    var value = false;
                    if (needs === 0) {
                        value = true;
                    } else if (needs === 1) {
                        if (needs == getGroups()) {
                            value = true;
                        }
                    }
                    return value;
                };

                function getGroups() {
                    var group = AuthService.getFkGroupIdx();

                    return group
                };

                scope.move_header_page = function(page){
                    var change_uri = '';
                    if(page == 'logout'){
                        change_uri = '/logout';
                    }else if(page == 'video_list'){
                        change_uri = '/video_list';
                    }else if(page == 'manage_model') {
                        change_uri = '/manage/model';
                    }else if(page == 'chrome_extension') {
                        window.open('https://chrome.google.com/webstore/detail/titan-for-youtube/mhopopnmofdbhldkncpednpakmaafjmf?hl=ko&authuser=0');
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
                }

                scope.open_navigation = function(){
                    if (open_nav == true){
                        $('#settings_LNB_wrap').removeClass('open_nav');
                        open_nav = false;
                    }
                    else if (open_nav == false){
                        $('#settings_LNB_wrap').addClass('open_nav');
                        open_nav = true;
                    }
                }
            }
        };
    });