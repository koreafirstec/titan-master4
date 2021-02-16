'use strict';

angular.module('titanApp')
    .controller('ManageModelCtrl', function ($scope, $timeout, api_titan_model, ngTableParams, Modal, $location, $route) {
        $scope.model_table_headers = [
            {name: 'No.', class_name: 'no', sortable: false},
            {name: '모델명', class_name: 'no', sortable: true, field: 'user_id'},
            {name: '설명', class_name: 'no', sortable: true, field: 'item_title'},
            {name: '학습 횟수', class_name: 'epochs', sortable: true},
            {name: '생성 유저', class_name: 'user', sortable: true},
            {name: '공개 여부', class_name: 'epochs', sortable: true},
            {name: '생성 일자', class_name: 'no', sortable: true},
            {name: '상태', class_name: 'epochs', sortable: true},
            {name: '선택', class_name: 'del'}
        ];

        $scope.access = [
            {type: '비공개'},
            {type: '공개'}
        ];

        $scope.status = [
            {value: '제작 중..'},
            {value: '완성'}
        ];

        var parameters = {
            page: 1,
            count: 10,
            sorting: {}
        };

        // if ($scope.show_model === undefined) {
        //     $scope.show_model = new ngTableParams(parameters, {
        //         counts: [],
        //         total: 0,
        //         getData: function ($defer, parameters) {
        //             var api_params = {};
        //             api_params['limit'] = parameters.count();
        //             api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
        //             api_titan_model.get(api_params, function (data) {
        //                 $timeout(function () {
        //                     parameters.total(data.meta.total_count);
        //                     $defer.resolve(data.objects);
        //                 }, 500);
        //             });
        //         }
        //     });
        // } else {
        //     $scope.show_model.reload();
        // }

        api_titan_model.get(null, function (data) {
            if (data.status === 200) {
                $scope.model_list = data.objects;
            }
        });

        $scope.onModelModify = function (model_idx) {
//            $location.path('/manage/model_make', true).search({model_idx: model_idx});
            Modal.open(
                'views/model_make.html',
                'ModelMakeCtrl',
                'sisung',
                {
                    update_model_idx: function(){
                        return model_idx;
                    },
                    update_item_idx: function () {
                        return false;
                    }
                }
            )
        };

        $scope.onModelDelete = function (model_idx) {
            var api_params_d = {};
            api_params_d['model_idx'] = model_idx;
            var drop_model = confirm('정말로 삭제하시겠습니까?');
            if (drop_model === true) {
                api_titan_model.delete(api_params_d, function (data) {
                    if (data.status === 200)
                        $route.reload();
                });
            } else {
                alert('취소하셨습니다.');
            }

        };

        $scope.makeModel = function () {
            Modal.open(
                'views/model_make.html',
                'ModelMakeCtrl',
                'sisung',
                {
                    update_model_idx: function () {
                        return false;
                    },
                    update_item_idx: function () {
                        return false;
                    }
                }
            )
        };

        $scope.model_request = function () {
            $location.path('/manage/model_request', true)
        }
        var width;
        var height;
        var margin;
        // 페이지 로드시 자동실행
        $(window).ready(function () {
            $scope.change_video_list_height();
        });


        // 화면 리사이즈시 실행
        $(window).resize(function () {
            $scope.change_video_list_height();
        });

        $scope.change_video_list_height = function() {
            width = document.getElementById("contents").offsetWidth;
            margin = document.getElementById("contents").offsetLeft;
            if (margin == 260){
                height = document.getElementById("contents").offsetHeight - 195 +'px';
                document.getElementById("library-model-wrap").style.maxHeight = height;
            }
            else if (width <= 768) {
                height = document.getElementById("contents").offsetHeight - 135 +'px';
                document.getElementById("library-model-wrap").style.maxHeight = height;
            }
        }
    });