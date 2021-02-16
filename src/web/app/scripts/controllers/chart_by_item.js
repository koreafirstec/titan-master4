'use strict';

angular.module('titanApp')
    .controller('ChartByItemCtrl', function ($scope, api_item_history) {
        var api_params = {};
        $scope.prev_history_month = 0;

        api_params['group_type'] = 'year';
        api_item_history.get(api_params, function (data) {
            $scope.history_years = data.objects;

            $scope.history_year = $scope.history_years[$scope.history_years.length-1];
            chart_data_set();
        });

        function chart_data_set(history_month=0) {
            console.log('history_month:', history_month);
            api_params['group_type'] = 'item';
            api_params['history_year'] = $scope.history_year;
            if($scope.prev_history_month === history_month) {
                history_month = 0;
            }
            $scope.prev_history_month = history_month;
            api_params['history_month'] = history_month;
            api_item_history.get(api_params, function (data) {
                $scope.item_history_list = data.objects[0];

                $scope.click_pie_chart.series[0].data = $scope.item_history_list.click_objects;
                $scope.buy_pie_chart.series[0].data = $scope.item_history_list.buy_objects;
                $scope.click_bar_chart.series[0].data = $scope.item_history_list.click_month_objects;
                $scope.buy_bar_chart.series[0].data = $scope.item_history_list.buy_month_objects;

                $scope.click_bar_chart.options.xAxis.categories = $scope.item_history_list.click_months;
                $scope.buy_bar_chart.options.xAxis.categories = $scope.item_history_list.buy_months;
            });

            $scope.click_pie_chart.options.title.text = $scope.history_year + "년 " + (history_month === 0 ? "" : history_month + "월 ") + "상품별 조회 차트";
            $scope.buy_pie_chart.options.title.text = $scope.history_year + "년 " + (history_month === 0 ? "" : history_month + "월 ") + "상품별 구매 이동 차트";
            $scope.click_bar_chart.options.title.text = $scope.history_year + "년 월별 상품 조회 차트";
            $scope.buy_bar_chart.options.title.text = $scope.history_year + "년 월별 상품 구매 이동 차트";
        }

        $scope.change_year = function() {
            chart_data_set();
        };

        $scope.click_pie_chart = {
            options: {
                chart: {
                    type: 'pie',
                    backgroundColor: '#FFFFFF',
                    shadow: true,
                    width: 600
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: '',
                    useHTML:true
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}',
                            distance: -50,
                        },
                        showInLegend: true
                    },
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}회</b><br/>'
                },
            },
            series: [
                {
                    data: []
                }
            ]
        };

        $scope.buy_pie_chart = {
            options: {
                chart: {
                    type: 'pie',
                    backgroundColor: '#FFFFFF',
                    shadow: true,
                    width: 600
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: '',
                    useHTML:true
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}',
                            distance: -50,
                        },
                        showInLegend: true
                    },
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}회</b><br/>'
                },
            },
            series: [
                {
                    data: []
                }
            ]
        };

        $scope.click_bar_chart = {
            options: {
                chart: {
                    type: 'column',
                    backgroundColor: '#FFFFFF',
                    shadow: true,
                    width: 800
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    enabled: false
                },
                xAxis: {
                    categories: []
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    stackLabels: {
                        enabled: false
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
            },
            series: [{
                color: 'gray',
                cursor: 'pointer',
                'name': '',
                events: {
                    click: function (e) {
                        chart_data_set(parseInt(e.point.category));
                    }
                }
            }]
        };

        $scope.buy_bar_chart = {
            options: {
                chart: {
                    type: 'column',
                    backgroundColor: '#FFFFFF',
                    shadow: true,
                    width: 800
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    enabled: false
                },
                xAxis: {
                    categories: []
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    stackLabels: {
                        enabled: false
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
            },
            series: [{
                color: 'gray',
                'name': ''
            }]
        };
    });