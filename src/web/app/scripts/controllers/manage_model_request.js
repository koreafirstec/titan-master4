'use strict';

angular.module('titanApp')
    .controller('ManageModelRequestCtrl', function ($scope, $timeout, api_model_request, ngTableParams, Modal, $location, $route) {
        $scope.model_table_headers = [
            {name: '사진', class_name: 'description', sortable: true, width: '80px'},
            {name: '상품명', class_name: 'title', sortable: true, field: 'item_title'},
            {name: '요청인', class_name: 'no', sortable: true},
            {name: '등록 일자', class_name: 'epochs', sortable: true},
            {name: '상태', class_name: 'epochs', sortable: true},
            {name: '선택', class_name: 'del'}
        ];

        $scope.status = [
            {value: '제작 중'},
            {value: '완료'}
        ];

        var parameters = {
            page: 1,
            count: 10,
            sorting: {}
        };

        if ($scope.show_model === undefined) {
            // $scope.show_model = new ngTableParams(parameters, {
            //     counts: [],
            //     total: 0,
            //     getData: function ($defer, parameters) {
            // var api_params = {};
            //         // api_params['limit'] = parameters.count();
            //         // api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
            api_model_request.get(null, function (data) {
                $timeout(function () {
                    // parameters.total(data.meta.total_count);
                    $scope.model_request = data.objects;
                    // console.log(data.objects);
                }, 500);
            });
                // }
            // });
        } else {
            $scope.show_model.reload();
        }

        $scope.onModelModify = function (idx) {
            Modal.open(
                'views/model_make.html',
                'ModelMakeCtrl',
                'sisung',
                {
                    update_model_idx: function () {
                        return false;
                    },
                    update_item_idx: function () {
                        // console.log(idx);
                        return idx;
                    }
                }
            )
        };

        $scope.onModelDelete = function (item_idx) {
            var api_params_d = {};
            api_params_d['item_idx'] = item_idx;
            var drop_item = confirm('정말로 삭제하시겠습니까?');
            if (drop_item === true) {
                api_model_request.delete(api_params_d, function (data) {
                    if (data.status === 200)
                        $route.reload();
                });
            } else {
                alert('취소하셨습니다.');
            }

        };
        var height = '';
        // 페이지 로드시 자동실행
        $(window).ready(function () {
            height = document.getElementById("contents").offsetHeight - 195 +'px';
            // 페이지 로드시 id값의 div의 높이를 구함

            document.getElementById("library-check-wrap").style.maxHeight = height;
            // 높이를 id 의 height 값에 저장

            // console.log("load height : " + height);
        });


        // 화면 리사이즈시 실행
        $(window).resize(function () {
            height = document.getElementById("contents").offsetHeight - 195 +'px';
            // 화면 리사이즈 시 id값의 div의 높이를 구함

            document.getElementById("library-check-wrap").style.maxHeight = height;
            // 화면 리사이즈시 id의 height값 변경 후 저장

            // console.log("resize height : " + height);
        });
    });