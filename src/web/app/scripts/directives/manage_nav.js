'use strict';

angular.module('titanApp')
    .directive('manageNav', function ($location, $route, AuthService, api_user_role, api_item_type, Modal, api_shape, api_item) {
        return {
            restrict: 'A',
            template: '<div class="sidebar">' +
                            // '<div class="sidebar-module">' +
                            //     '<button type="button" id="btn-do-upload" class="btn btn-primary btn-block" ng-click="insert_meta_item()">' +
                            //         '<i class="fa fa-cloud-upload-alt mr-xs"></i>상품 등록' +
                            //     '</button>' +
                            // '</div>' +
                            // '<ul id="library-filters" class="sidebar__filter">' +
                            //     '<li class="sidebar__filter default-filter filter-transcoding">' +
                            //         '<div class="sidebar__filter__wrapper">' +
                            //             '<div class="form-checkbox">' +
                            //                 '<label>전체 상품 수</label>' +
                            //                 '<span class="count">{{video_count}}</span>' +
                            //             '</div>' +
                            //         '</div>' +
                            //     '</li>' +
                            //     '<li class="sidebar__filter default-filter filter-transcoding">' +
                            //         '<div class="sidebar__filter__wrapper">' +
                            //             '<div class="form-checkbox">' +
                            //                 '<label>전체 상품 조회 수</label>' +
                            //                 '<span class="count">0</span>' +
                            //             '</div>' +
                            //         '</div>' +
                            //     '</li>' +
                            //     '<li class="sidebar__filter default-filter filter-transcoding">' +
                            //         '<div class="sidebar__filter__wrapper">' +
                            //             '<div class="form-checkbox">' +
                            //                 '<label>전체 상품 구매 수</label>' +
                            //                 '<span class="count">0</span>' +
                            //             '</div>' +
                            //         '</div>' +
                            //     '</li>' +
                            // '</ul>' +
                            // '<div id="content-categories" class="sidebar__category">' +
                                // '<hr class="sidebar__separator">' +
                            //     '<h4 class="sidebar__title" ng-click="categoryMenuDown()">카테고리' +
                            //         '<a href="" id="btn-create-new-category" class="btn__icon btn__icon-xs pull-right tooltip-message"' +
                            //            'data-original-title="새로운 카테고리 생성">' +
                            //             '<i class="fa fa-chevron-down"></i>' +
                            //         '</a>' +
                            //     '</h4>' +
                            //     '<ul id="sidebar__dropdown__menu">' +
                            //         '<li class="sidebar__title" ng-click="move_item_check()">' +
                            //             '<a href="/#/manage/item_check" id="sidebar__link--all">' +
                            //                 '전체<span class="count">{{video_count}}</span>' +
                            //             '</a>' +
                            //         '</li>' +
                            //         '<li class="sidebar__title" ng-repeat="item in type_list" ng-click="move_category_page(item.item_main_type, item.item_sub_type)">' +
                            //             '<a href="/#/manage/item_check?itemType={{item.item_main_type}}&itemSubType={{item.item_sub_type}}">' +
                            //                 '{{item.item_sub_type_name}}<span class="count">{{item.item_count}}</span>' +
                            //             '</a>' +
                            //         '</li>' +
                            //         // '<li class="sidebar__title">' +
                            //         //     '<a href="" data-media-content-group-id="133367">' +
                            //         //         '바지<span class="count">{{shapeCount(2)}}</span>' +
                            //         //     '</a>' +
                            //         // '</li>' +
                            //         // '<li class="sidebar__title">' +
                            //         //     '<a href="" data-media-content-group-id="133367">' +
                            //         //         '모자<span class="count">{{shapeCount(3)}}</span>' +
                            //         //     '</a>' +
                            //         // '</li>' +
                            //     '</ul>' +
                            // '</div>' +
                            // '<div id="settings_LNB" class="settings_LNB">' +
                            // '<ul>' +
                            //     '<li ng-repeat="menu in settings" ng-show="CheckGroups(menu.groups)" class="" ng-class="menu.class" ng-click="move_page(menu.page)">' +
                            //         '<i class="menu.icon"></i>' +
                            //         '<a ng-click="move_page(menu.page)" href="">{{menu.title}}</a>' +
                            //     '</li>' +
                            // '</ul>' +
                            '<ul>' +
                                '<li ng-repeat="menu in settings" ng-show="CheckGroups(menu.groups)" class="" ng-class="menu.class" ng-click="move_page(menu.page)">' +
                                    '<img src="{{menu.icon}}">' +
                                    '<a ng-click="move_page(menu.page)" href="">{{menu.title}}</a>' +
                                '</li>' +
                            '</ul>' +
                            '<ul class="option">' +
                                '<li ng-repeat="menu in options" ng-show="CheckGroups(menu.groups)" class="" ng-class="menu.class" ng-click="move_page(menu.page)">' +
                                    '<img src="{{menu.icon}}">' +
                                    '<a ng-click="move_page(menu.page)" href="">{{menu.title}}</a>' +
                                '</li>' +
                            '</ul>'+
                            // '</div>' +
                        '</div>',
            link: function (scope) {
                scope.settings = [
                    {idx: 1, title: '대시보드', page: 'dashboard', class: 'selected', groups: 0, icon: '../images/common/icons/ic-dashboard.png'},
                    {idx: 2, title: '카테고리 관리', page: 'category', class: '', groups: 0, icon: '../images/common/icons/ic-category.png'},
                    {idx: 3, title: '동영상', page: 'video_add', class: '', groups: 0, icon: '../images/common/icons/ic-video.png'},
                    {idx: 4, title: '상품', page: 'item_add', class: '', groups: 0, icon: '../images/common/icons/ic-goods.png'},
                    {idx: 5, title: 'AI 만들기', page: 'video_editor', class: '', groups: 0, icon: '../images/common/icons/ic-ai-make.png'}
                ];
                scope.options = [
                    {idx: 1, title: '사이트맵', page: 'sitemap', class: '', groups: 0, icon: '../images/common/icons/ic-sitemap.png'},
                    {idx: 2, title: '설정', page: 'option', class: '', groups: 0, icon: '../images/common/icons/ic-option.png'},
                    {idx: 3, title: '고객지원', page: 'user_support', class: '', groups: 0, icon: '../images/common/icons/ic-support.png'}
                ]

                scope.setting = [];
                scope.video_count = 0;

                var api_params = {};
                api_params['user_idx'] = AuthService.getIdx();
                api_user_role.get(api_params, function(data){
                    if (data.status === 200) {
                        data.objects.filter(function (d) {
                             for(let i=0; i<scope.settings.length; i++) {
                                if(d.fk_role_idx === scope.settings[i].role || scope.settings[i].role === 0) {
                                    if (!scope.setting.includes(scope.settings[i])) {
                                        scope.setting.push(scope.settings[i]);
                                    }
                                }
                            }
                        });

                        scope.setting.sort(function (a, b) {
                          if (a.idx > b.idx) {
                            return 1;
                          }
                          if (a.idx < b.idx) {
                            return -1;
                          }
                          return 0;
                        });
                    } else if (data.status === 404) {
                        for(let i=0; i<scope.settings.length; i++) {
                            if (scope.settings[i].role === 0) {
                                scope.setting.push(scope.settings[i])
                            }
                        }

                        scope.setting.sort(function (a, b) {
                          if (a.idx > b.idx) {
                            return 1;
                          }
                          if (a.idx < b.idx) {
                            return -1;
                          }
                          return 0;
                        });
                    }
                });

                api_shape.get(null, function(data){
                    if (data.status === 200) {
                        scope.shape_list = data.objects;
                        scope.video_count = scope.shape_list.reduce((result, item) => item.all_shape_item + result, 0);
                    }
                });

                api_item.get(null, function(data){
                    if (data.status === 200) {
                        scope.item_list =  data.objects;
                    }
                });

                api_item_type.get(null, function (data) {
                    if (data.status === 200) {
                        scope.type_list = data.objects;
                        // console.log(scope.type_list);
                    }
                });

                scope.shapeCount = function(shape_idx) {
                    let count = 0;
                    if(scope.item_list !== undefined) {
                        scope.item_list.filter(function(d) {
                            if(d.fk_item_sub_type === shape_idx)
                                count++;
                        });
                    }

                    return count;
                };

                scope.move_page = function(page){

                    if (page === '') {
                        return ;
                    }

                    var fullUrl = $location.absUrl();
                    if(fullUrl.match('(/' + page + ')$'))
                        return $route.reload();
                    // if(fullUrl.indexOf(page) !== -1)
                    //     return $route.reload();
                    $location.url('/' + page, true);
                    // console.log(page);
                }

                scope.move_item_check = function(){
                    var page = '/manage/item_check';
                    $location.url(page, true);
                }

                scope.move_category_page = function(main_type, sub_type){
                    if (main_type === '') {
                        return ;
                    }
                    var page = '/manage/item_check?itemType=' + main_type + '&itemSubType=' + sub_type;
                    $location.url(page, true);
                }

                scope.insert_meta_item = function () {
                    Modal.open(
                        'views/video_editor.html',
                        'VideoEditorCtrl',
                        'sisung',
                        {
                            video_idx: function(){
                                return undefined;
                            }
                        }
                    );
                }
                scope.menuCount = 0;
                scope.categoryMenuDown = function () {
                    if(scope.menuCount == 0){
                        $('#sidebar__dropdown__menu').css('display', 'block');
                        scope.menuCount = 1;
                    }else{
                        $('#sidebar__dropdown__menu').css('display', 'none');
                        scope.menuCount = 0;
                    }
                }

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

                // scope.optionCount = 0;
                // scope.optionMenuDown = function () {
                //     if(scope.menuCount == 0){
                //         $('#sidebar__dropdown__menu').css('display', 'block');
                //         scope.menuCount = 1;
                //     }else{
                //         $('#sidebar__dropdown__menu').css('display', 'none');
                //         scope.menuCount = 0;
                //     }
                // }
            }
        };
    });