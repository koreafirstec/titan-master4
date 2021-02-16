'use strict';

angular.module('titanApp')
    .controller('ManageItemHistoryCtrl', function ($scope, $timeout, api_item_history, ngTableParams) {
        // TABLE HEADER
        $scope.item_history_table_headers = [
            {name: 'No.', class_name: 'no', sortable: false},
            {name: '아이디', class_name: 'id', sortable: true, field: 'user_id'},
            {name: '상품명', class_name: 'title', sortable: true, field: 'item_title'},
            {name: '상태', class_name: 'status', sortable: true, field: 'action_status'},
            {name: '날짜 시간', class_name: 'date', sortable: true, field: 'date'}
        ];

        $scope.status = [
            {action: '상품 클릭'},
            {action: '구매 페이지 이동'}
        ];

        // DATE FORMAT FUNCTION
        Number.prototype.lpad = function () {
            return this.toString().padStart(2, 0);
        };

        $scope.date_format = function(create_date) {
            create_date = new Date(create_date);
            var year = create_date.getFullYear();
            var month = create_date.getMonth() + 1;
            var day = create_date.getDate();
            var hour = create_date.getHours();
            var Minute = create_date.getMinutes();
            var second = create_date.getSeconds();
            var date_arr = [year, month.lpad(), day.lpad()];
            var time_arr = [hour.lpad(), Minute.lpad(), second.lpad()];

            return date_arr.join('/') + ' ' + time_arr.join(':');
        };

        var parameters = {
            page: 1,
            count: 15,
            sorting: {}
        };

        if ($scope.show_item_history == undefined) {
            $scope.show_item_history = new ngTableParams(parameters, {
                counts: [],
                total: 0,
                getData: function ($defer, parameters) {
                    var api_params = {};
                    api_params['limit'] = parameters.count();
                    api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
                    api_item_history.get(api_params, function (data) {
                        $timeout(function () {
                            parameters.total(data.meta.total_count);
                            $defer.resolve(data.objects);
                        }, 500);
                    });
                }
            });
        } else {
            $scope.show_item_history.reload();
        }

    });