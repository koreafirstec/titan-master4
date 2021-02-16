'use strict';

angular.module('titanApp')
    .controller('ManageUserAccessHistoryCtrl', function ($scope, ngTableParams, api_user_access_hist, $timeout) {
         var access_hist_params = {};
        //  api_user_access_hist.get(access_hist_params, function (data) {
        //     $scope.userAccessHist = data.objects;
        // });
        $scope.log_table_headers = [
            {name: 'No.', class_name: 'no', sortable: false},
            {name: '아이디', class_name: 'id', sortable: true, field: 'user_id'},
            {name: '접속 시간', class_name: 'name', sortable: true, field: 'access_time'},
            {name: '접속 타입', class_name: 'choose', sortable: true, field: 'access_type'},
            {name: '브라우저 종류', class_name: 'name', sortable: true, field: 'access_browser'},
            {name: '플랫폼 종류', class_name: 'name', sortable: true, field: 'access_platform'},
            {name: '접속 IP', class_name: 'name', sortable: true, field: 'access_ip'}
        ];

        var parameters = {
            page: 1,
            count: 15,
            sorting: {}
        };
        if ($scope.userAccessHistParams == undefined) {
            $scope.userAccessHistParams = new ngTableParams(parameters, {
                counts: [],
                total: 0,
                getData: function ($defer, parameters) {
                    var api_params = {};
                    api_params['limit'] = parameters.count();
                    api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
                    api_user_access_hist.get(api_params, function (data) {
                        $timeout(function () {
                            //console.log(data);
                            parameters.total(data.meta.total_count);
                            $defer.resolve(data.objects);
                            // $scope.total_count = data.meta.total_count
                        }, 500);
                    });
                }
            });
        } else {
            $scope.userAccessHistParams.reload();
        }
    });