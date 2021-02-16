'use strict';

angular.module('titanApp')
    .controller('ManageItemCtrl', function ($scope, $route, $filter, $http,/* api_item, api_item_detail, ngTableParams, api_build_group, $timeout, AuthService, Modal, ENV*/) {
        console.log('되냐?');
        // $scope.currentPage = 1;
        // $scope.pageSize = 10;
        // $scope.numberOfItem = 0;
        // $scope.dataItemStatus = 200;
        // $scope.item_check_main_type = [];
        // $scope.modify_item_list = [];
        // $scope.modify_item_title = [];
        // $scope.modify_item_price = [];
        // $scope.modify_item_obj = [];
        // $scope.modify_enabled = [];
        // $scope.modify_disabled = [];
        // $scope.modify_item_position = [];
        // $scope.modify_item_toggle = [];
        //
        // $scope.item_price_range = {
        //     min_price: 0,
        //     max_price: 50000
        // };
        // var today = new Date();
        // $scope.startDate = today.toISOString().slice(0, 10);
        // $scope.endDate = today.toISOString().slice(0, 10);
        //
        // $scope.user_idx = AuthService.getIdx();
        // // $scope.fk_group_idx = AuthService.getFkGroupIdx();
        //
        // $scope.search_title = '';
        // $scope.item_main_type = $scope.item_sub_type = -1;
        //
        // // var api_params = {};
        // //
        // // api_params['user_idx'] = $scope.user_idx;
        // // api_params['fk_group_idx'] = $scope.fk_group_idx;
        //
        // $scope.item_all_type = [
        //     {index: 0, item: '전체', value: 0},
        //     {index: 1, item: '분류별 선택', value: 1},
        // ];
        // $scope.item_all = $scope.item_all_type[0];
        //
        // $scope.item_sub_s_type = [
        //     {index: 0, item: '셔츠', value: 0},
        //     {index: 1, item: '바지', value: 1},
        //     {index: 2, item: '모자', value: 2},
        //     {index: 3, item: '블라우스', value: 3},
        //     {index: 4, item: '신발', value: 4},
        //     {index: 5, item: '점퍼', value: 5}
        // ];
        //
        // $scope.item_sub_e_type = [
        //     {index: 0, item: '전자레인지', value: 0},
        //     {index: 1, item: '냉장고', value: 1},
        //     {index: 2, item: 'TV', value: 2}
        // ];
        //
        // $scope.item_sub_p_type  = [
        //     {index: 0, item: '골동품', value: 0}
        // ];
        //
        // $scope.item_sub_president_type = [
        //     {index: 0, item: '원수', value: 0},
        //     {index: 1, item: '대통령', value: 1},
        // ];
        //
        // $scope.item_sub_toys_type = [
        //     {index: 0, item: '장난감', value: 0}
        // ];
        //
        // $scope.item_sub_bag_type = [
        //     {index: 0, item: '구찌', value: 0}
        // ];
        //
        // $scope.item_position_change = [
        //     {index: 0, stat: '기본'},
        //     {index: 1, stat: '선물상자'},
        //     {index: 2, stat: '모두'},
        // ];
        //
        // /////////////////////////////////////
        //
        // $scope.item_position = $scope.item_position_change[0];
        //
        // $scope.item_toggle_change = [
        //     {index: 0, stat: '구매용'},
        //     {index: 1, stat: '설명용'},
        //     {index: 2, stat: '전시용'},
        // ];
        // $scope.item_toggle = $scope.item_toggle_change[0];
        //
        // $scope.search_category = [
        //     {index: 0, title: '상품명', column: 'item_title'},
        //     {index: 1, title: '상품가', column: 'item_price'},
        //     {index: 2, title: '사용자명', column: 'user_name'},
        // ];
        // $scope.search_item = $scope.search_category[0];
        //
        // $scope.item_create_date = [
        //     {index: 0, title: '전체', value: 0},
        //     {index: 1, title: '등록일 선택', value: 1}
        // ];
        // $scope.item_date = $scope.item_create_date[0];
        //
        // $scope.init_array = function(){
        //     $scope.modify_item_list = [];
        //     $scope.modify_item_title = [];
        //     $scope.modify_item_price = [];
        //     $scope.modify_item_obj = [];
        //     $scope.modify_enabled = [];
        //     $scope.modify_disabled = [];
        //     $scope.modify_item_position = [];
        //     $scope.modify_item_toggle = [];
        // }
        //
        // $scope.change_item_all = function (item_all){
        //     if(item_all.value == 0){
        //         $scope.item_main = null;
        //         $scope.item_check_sub = null;
        //         $scope.item_check_main_type= [];
        //         $scope.item_check_sub_type = null;
        //     }else if(item_all.value == 1){
        //         $scope.item_check_main_type= [
        //             {index: 0, item: '의류', value: 0},
        //             {index: 1, item: '가전류', value: 1},
        //             {index: 2, item: '고전', value: 2},
        //             {index: 3, item: '대통령', value: 3},
        //             {index: 4, item: '장난감', value: 4},
        //             {index: 5, item: '가방', value: 5},
        //         ];
        //     }
        // }
        //
        // $scope.change_item_check = function (item_main, sub) {
        //     if(item_main != null){
        //         if(item_main.value == ''){
        //             $scope.item_check_sub_type = $scope.item_sub_s_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_s_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }
        //         else if(item_main.value == 0){
        //             $scope.item_check_sub_type = $scope.item_sub_s_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_s_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }else if(item_main.value == 1){
        //            $scope.item_check_sub_type = $scope.item_sub_e_type;
        //            if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_e_type[sub];
        //            else
        //                 $scope.item_check_sub = '';
        //         }else if(item_main.value == 2){
        //             $scope.item_check_sub_type = $scope.item_sub_p_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_p_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }else if(item_main.value == 3){
        //             $scope.item_check_sub_type = $scope.item_sub_president_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_president_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }else if(item_main.value == 4){
        //             $scope.item_check_sub_type = $scope.item_sub_toys_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_toys_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }else if(item_main.value == 5){
        //             $scope.item_check_sub_type = $scope.item_sub_bag_type;
        //             if(sub != null)
        //                 $scope.item_check_sub = $scope.item_sub_bag_type[sub];
        //             else
        //                 $scope.item_check_sub = '';
        //         }
        //     }else{
        //         $scope.item_check_sub_type = null;
        //         $scope.item_check_sub = null;
        //     }
        // }
        //
        // $scope.item_check_headers = [
        //     {name: 'No', class_name: 'no', sortable: true, field: 'no'},
        //     {name: '사용자 이름', class_name: 'user_name', sortable: true, field: 'user_name'},
        //     {name: '상품명', class_name: 'item_title', sortable: true, field: 'item_title'},
        //     {name: '판매가', class_name: 'item_price', sortable: true, field: 'item_price'},
        //     {name: '등록일', class_name: 'create_date', sortable: true, field: 'create_date'},
        //     {name: '상품 사용 설정', class_name: 'item_using', sortable: true, field: 'item_using'},
        //     {name: '상품 영역 상태', class_name: 'item_shape', sortable: true, field: 'item_shape'},
        //     {name: '구매/설명 url 설정', class_name: 'item_description_toggle', sortable: true, field: 'item_description_toggle'},
        // ];
        //
        // var parameters = {
        //     page: 1,
        //     count: 10,
        //     sorting: {
        //         name: 'asc'
        //     }
        // }
        //
        // // api_item.get(api_params, function(data){
        // //     if(data.status == 200) {
        // //         $scope.item_main_type = $scope.item_sub_type = -1;
        // //         $timeout(function () {
        // //             $scope.itemCheckFunc(data.objects);
        // //         }, 500);
        // //     }
        // // });
        // var main_type = gup('itemType', window.location.href);
        // var sub_type = gup('itemSubType', window.location.href);
        // var api_params = {}
        // if (main_type != null) {
        //     api_params['search_main_type'] = main_type
        // }
        // if (sub_type != null) {
        //     api_params['search_sub_type'] = sub_type
        // }
        //
        //
        // api_params['user_idx'] = $scope.user_idx;
        // // api_params['fk_group_idx'] = $scope.fk_group_idx;
        //
        // api_item.get(api_params, function (data) {
        //     $timeout(function () {
        //         // parameters.total(data.meta.total_count);
        //         $scope.item_check = data.objects;
        //     }, 500);
        // });
        //         // console.log(data.objects);
        //     // $scope.itemListParams = new ngTableParams(parameters, {
        //     //     counts: [],
        //     //     total: 0,// length of data
        //     //     getData: function ($defer, parameters) {
        //     //         // api_params['limit'] = parameters.count();
        //     //         // api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
        //     //         var sorting = parameters.sorting();
        //     //         api_item.get(api_params, function (data) {
        //     //             if (data.status == 200) {
        //     //                 $timeout(function () {
        //     //                     parameters.total(data.meta.total_count);
        //     //                     $defer.resolve(data.objects);
        //     //                     $scope.enable_idx = [];
        //     //                     $scope.video_idx = [];
        //     //                     $scope.enable_status_value = [];
        //     //                     $scope.video_status_value = [];
        //     //                 }, 500);
        //     //             }
        //     //         });
        //     //     }
        //     // });
        //
        // $scope.selectedCheckItem = {};
        // $scope.itemSelected = function (item, e) {
        //     var lib_td = $('#library__td__checkbox__' + item.idx);
        //     if (!lib_td.is(e.target) && lib_td.has(e.target).length === 0) {
        //         $('#form-title').value = "";
        //         $scope.selectedCheckItem = item;
        //
        //         $('.detail').css('display', 'unset');
        //         $('#contents').attr('class', 'container module-detail');
        //     }
        // };
        //
        // $scope.getItemsType = function(mainType, subType) {
        //     switch (mainType) {
        //         case 0:
        //             return $scope.item_sub_s_type[subType].item;
        //         case 1:
        //             return $scope.item_sub_e_type[subType].item;
        //         case 2:
        //             return $scope.item_sub_p_type[subType].item;
        //         case 3:
        //             return $scope.item_sub_president_type[subType].item;
        //         case 4:
        //             return $scope.item_sub_toys_type[subType].item;
        //         case 5:
        //             return $scope.item_sub_bag_type[subType].item;
        //         default:
        //             return "Empty";
        //     }
        // };
        //
        // $scope.closePopup = function () {
        //     $('.detail').css('display', 'none');
        //     $('#contents').attr('class', 'container module-default');
        // };
        //
        //
        //
        // // if($scope.itemListParams == undefined) {
        // //     $scope.itemListParams = new ngTableParams(parameters, {
        // //         counts: [],
        // //         total: 0,// length of data
        // //         getData: function ($defer, parameters) {
        // //             var api_params = {};
        // //
        // //             api_params['user_idx'] = $scope.user_idx;
        // //             api_params['fk_group_idx'] = $scope.fk_group_idx;
        // //             api_params['limit'] = parameters.count();
        // //             api_params['offset'] = (parameters.page() - 1) * api_params['limit'];
        // //             $scope.item_main_type = $scope.item_sub_type = -1;
        // //             var sorting = parameters.sorting();
        // //             api_item.get(api_params, function (data) {
        // //                 if (data.status == 200) {
        // //                     // for(let i in data.objects){
        // //                     //     let obj = data.objects[i];
        // //                     //     if(obj.using_status){
        // //                     //         angular.element('#unlock_' + String(obj.idx)).css('display', 'none');
        // //                     //         angular.element('#lock_' + String(obj.idx)).css('display', 'flex');
        // //                     //     }else{
        // //                     //         angular.element('#unlock_' + String(obj.idx)).css('display', 'flex');
        // //                     //         angular.element('#lock_' + String(obj.idx)).css('display', 'none');
        // //                     //     }
        // //                     // }
        // //                     $timeout(function () {
        // //                         parameters.total(data.meta.total_count);
        // //                         $defer.resolve(data.objects);
        // //                         $scope.enable_idx = [];
        // //                         $scope.video_idx = [];
        // //                         $scope.enable_status_value = [];
        // //                         $scope.video_status_value = [];
        // //                         $scope.currentPage = (parameters.page() - 1);
        // //                         // angular.element('#video_enter').css('display', 'none');
        // //                     }, 500);
        // //                 }
        // //             });
        // //         }
        // //     });
        // // }else{
        // //     $scope.itemListParams.reload();
        // // }
        //
        // $scope.change_search_category = function(search_item){
        //     if(search_item == 0){
        //         $scope.search_title = ''
        //     }else if(search_item == 1){
        //         $scope.item_price_range = {
        //             min_price: 0,
        //             max_price: 50000
        //         };
        //     }else if(search_item == 2){
        //         $scope.search_title = ''
        //     }
        // }
        //
        // $scope.change_item_date = function(){
        //     $scope.startDate = today.toISOString().slice(0, 10);
        //     $scope.endDate = today.toISOString().slice(0, 10);
        // }
        //
        // $scope.change_position = function(item_idx, item_title, item_price, item_obj, item_position, item_toggle){
        //     var api_params = {};
        //
        //     api_params['item_idx'] = item_idx;
        //     api_params['item_title'] = item_title;
        //     api_params['item_price'] = item_price;
        //     api_params['item_shape'] = item_position;
        //     api_params['item_description_toggle'] = item_toggle;
        //     api_params['using_status'] = item_obj;
        //     api_item_detail.save(api_params, function(data){
        //         if(data.status == 200){
        //             for(let i in item_idx) {
        //                 angular.element('#item_line_' + String(item_idx[i])).css('background', 'none');
        //                 angular.element('#item_checked_' + String(item_idx[i])).attr("checked", false);
        //                 angular.element('#item_check_all').attr("checked", false);
        //                 // $('#shape_' + String(item_idx[i])).attr('disabled', false);
        //                 // $('#toggle_' + String(item_idx[i])).attr('disabled', false);
        //                 // $('#title_' + String(item_idx[i])).attr('disabled', false);
        //                 // $('#price_' + String(item_idx[i])).attr('disabled', false);
        //             }
        //             $scope.init_array();
        //         }
        //     });
        // }
        //
        // $scope.search_item_list = function(search_item, search_title, main, sub, price_range, item_date){
        //     $scope.currentPage = 1;
        //     $scope.itemCheck = [];
        //     $scope.search_main_type = main;
        //     $scope.search_sub_type = sub;
        //     $scope.none_search_title = '';
        //     $scope.dataItemStatus = 400;
        //     var api_params = {};
        //     angular.element('#search_able').css('display', 'none');
        //     if($scope.itemListParams != undefined) {
        //         api_params['search_item_name'] = search_title;
        //         api_params['search_min_price'] = price_range.min_price;
        //         api_params['search_max_price'] = price_range.max_price;
        //         api_params['search_category'] = search_item;
        //         if (search_title != "" && search_title != undefined || price_range != undefined) {
        //             if (parseInt(item_date) == 1) {
        //                 api_params['startDate'] = $("#StartDate").val();
        //                 api_params['endDate'] = $("#EndDate").val();
        //             }
        //             if ($scope.search_main_type >= 0 || $scope.search_sub_type >= 0) {
        //                 api_params['search_main_type'] = $scope.search_main_type;
        //                 api_params['search_sub_type'] = $scope.search_sub_type;
        //                 $scope.pagingItem(api_params);
        //             } else {
        //                 api_params['search_main_type'] = api_params['search_sub_type'] = null;
        //                 $scope.pagingItem(api_params)
        //             }
        //         }
        //     }
        //     // else{
        //     //     $scope.itemListParams.reload();
        //     // }
        // };
        //
        //
        // $scope.drop_item = function (item_idx) {
        //     var change_item = confirm('정말로 삭제하시겠습니까?');
        //     if(change_item) {
        //         if (item_idx != '') {
        //             var api_drop_params = {};
        //             api_drop_params['d_item_idx'] = item_idx;
        //             api_item.delete(api_drop_params, function (data) {
        //                 if (data.status == 200) {
        //                     $route.reload();
        //                 }
        //             });
        //         }
        //     }else {
        //         alert('취소하셨습니다.');
        //     }
        // };
        //
        // $scope.add_item = async function () {
        //     var api_group_params = {}
        //     api_group_params['group_id'] = await KeyMaker();
        //
        //     // api_build_group.save(api_group_params, function(data){
        //     //     if(data.status == 200){
        //     //         Modal.open(
        //     //             'views/popup_item_insert.html',
        //     //             'PopupItemInsertCtrl',
        //     //             'sisung',
        //     //             {
        //     //                 group_idx: function(){
        //     //                     return data.objects[0].group_idx;
        //     //                 }
        //     //             }
        //     //         )
        //     //     }
        //     // });
        // };
        //
        // async function KeyMaker() {
        //     const key = await init();
        //     return key;
        // }
        //
        // async function init() {
        //     var key = await new Promise((resolve, reject) => {
        //         $http({
        //             method: 'GET',
        //             url: 'http://localhost:3000/init',
        //         }).success((response) => {
        //             resolve(response.key);
        //         }).error((err) => {
        //             reject(err);
        //         });
        //     });
        //
        //     return key;
        // }
        //
        // $scope.manage_item_change = function(item){
        //     $scope.currentPage = 1;
        //     Modal.open(
        //         'views/popup_make.html',
        //         'PopupMakeCtrl',
        //         'sisung',
        //         {
        //             item: function(){
        //                 return item.item_obj;
        //             },
        //             item_info: function () {
        //                 return item.item_obj;
        //             },
        //             item_video: function(){
        //                 return 1;
        //             }
        //         }
        //     )
        // }
        //
        // $scope.PriceRange = function(min, max){
        //     $scope.item_price_range = {
        //         min_price: min,
        //         max_price: max
        //     }
        // }
        //
        // $scope.item_check_one = function(item, using_stat, position, toggle, selected){
        //     if($('#item_checked_'+String(item.idx)).is(":checked")){
        //         angular.element('#item_line_'+String(item.idx)).css('background', 'rgba(0, 210, 70, 0.4)');
        //         // $('#shape_' + String(item.idx)).attr('disabled', true);
        //         // $('#toggle_' + String(item.idx)).attr('disabled', true);
        //         // $('#title_' + String(item.idx)).attr('disabled', true);
        //         // $('#price_' + String(item.idx)).attr('disabled', true);
        //         $scope.modify_item_list.push(parseInt(item.idx));
        //         console.log("modify : ", $scope.modify_item_list);
        //         $scope.modify_item_title.push(item.item_title);
        //         $scope.modify_item_price.push(item.update_item_price);
        //         $scope.modify_item_obj.push(parseInt(item.using_status ? 1: 0));
        //         $scope.modify_enabled.push(1);
        //         $scope.modify_disabled.push(0);
        //         // $scope.modify_item_position.push(parseInt(position.index));
        //         // $scope.modify_item_toggle.push(parseInt(toggle.index));
        //     }else{
        //         if(item.using_status || $('#unlock_'+String(item.idx)).css("display") == 'flex'){
        //             angular.element('#item_line_'+String(item.idx)).css('background', 'none');
        //             // $('#shape_'+String(item.idx)).attr('disabled', false);
        //             // $('#toggle_'+String(item.idx)).attr('disabled', false);
        //             // $('#title_'+String(item.idx)).attr('disabled', false);
        //             // $('#price_'+String(item.idx)).attr('disabled', false);
        //         }
        //         angular.element('#item_line_'+String(item.idx)).css('background', 'none');
        //         var index_list = $scope.modify_item_list.indexOf(parseInt(item.idx));
        //         var index_title = $scope.modify_item_title.indexOf(item.item_title);
        //         var index_price = $scope.modify_item_price.indexOf(item.update_item_price);
        //         var index_obj = $scope.modify_item_obj.indexOf(parseInt(item.using_status ? 1: 0));
        //         var index_en = $scope.modify_enabled.indexOf(1);
        //         var index_dis = $scope.modify_disabled.indexOf(0);
        //         // var index_position = $scope.modify_item_position.indexOf(parseInt(position.index));
        //         // var index_toggle = $scope.modify_item_toggle.indexOf(parseInt(toggle.index));
        //         $scope.modify_item_list.splice(index_list, 1);
        //         $scope.modify_item_title.splice(index_title, 1);
        //         $scope.modify_item_price.splice(index_price, 1);
        //         $scope.modify_item_obj.splice(index_obj, 1);
        //         $scope.modify_enabled.splice(index_en, 1);
        //         $scope.modify_disabled.splice(index_dis, 1);
        //         // $scope.modify_item_position.splice(index_position, 1);
        //         // $scope.modify_item_toggle.splice(index_toggle, 1);
        //     }
        // }
        //
        // // $scope.using_stat_change = function(using_stat, item_idx, position, toggle){
        // //     if(using_stat){
        // //         $('#shape_' + String(item_idx)).attr('disabled', true);
        // //         $('#toggle_' + String(item_idx)).attr('disabled', true);
        // //         $('#title_' + String(item_idx)).attr('disabled', true);
        // //         $('#price_' + String(item_idx)).attr('disabled', true);
        // //     }else{
        // //         $('#shape_'+String(item_idx)).attr('disabled', false);
        // //         $('#toggle_'+String(item_idx)).attr('disabled', false);
        // //         $('#title_' + String(item_idx)).attr('disabled', false);
        // //         $('#price_' + String(item_idx)).attr('disabled', false);
        // //     }
        // // }
        //
        // $scope.item_check_all = function(data){
        //     let obj = '';
        //     if($('#item_check_all').is(":checked")){
        //         $scope.init_array();
        //         for(let i in data){
        //             obj = data[i];
        //             // $('#shape_' + String(obj.idx)).attr('disabled', true);
        //             // $('#toggle_' + String(obj.idx)).attr('disabled', true);
        //             // $('#title_' + String(obj.idx)).attr('disabled', true);
        //             // $('#price_' + String(obj.idx)).attr('disabled', true);
        //             angular.element('#item_line_'+String(obj.idx)).css('background', 'rgba(0, 210, 70, 0.4)');
        //             $scope.modify_item_list.push(parseInt(obj.idx));
        //             $scope.modify_item_obj.push(parseInt(obj.using_status ? 1: 0));
        //             $scope.modify_enabled.push(1);
        //             $scope.modify_disabled.push(0);
        //             $scope.modify_item_title.push(obj.item_title);
        //             $scope.modify_item_price.push(parseInt(obj.update_item_price));
        //             $scope.modify_item_position.push(parseInt($scope.item_position_change[parseInt($('#shape_'+String(obj.idx)).val())].index));
        //             $scope.modify_item_toggle.push(parseInt($scope.item_toggle_change[parseInt($('#toggle_'+String(obj.idx)).val())].index));
        //         }
        //     }else{
        //         for(let i in data){
        //             obj = data[i];
        //             if(obj.using_status){
        //                 angular.element('#item_line_'+String(obj.idx)).css('background', 'none');
        //                 // $('#shape_'+String(obj.idx)).attr('disabled', false);
        //                 // $('#toggle_'+String(obj.idx)).attr('disabled', false);
        //                 // $('#title_'+String(obj.idx)).attr('disabled', false);
        //                 // $('#price_'+String(obj.idx)).attr('disabled', false);
        //             }
        //             angular.element('#item_line_'+String(obj.idx)).css('background', 'none');
        //             var index_list = $scope.modify_item_list.indexOf(parseInt(obj.idx));
        //             var index_obj = $scope.modify_item_obj.indexOf(parseInt(obj.using_status ? 1: 0));
        //             var index_en = $scope.modify_enabled.indexOf(1);
        //             var index_dis = $scope.modify_disabled.indexOf(0);
        //             var index_title = $scope.modify_item_title.indexOf(obj.item_title);
        //             var index_price = $scope.modify_item_price.indexOf(parseInt(obj.update_item_price));
        //             var index_position = $scope.modify_item_position.indexOf(parseInt($scope.item_position_change[parseInt($('#shape_'+String(obj.idx)).val())].index));
        //             var index_toggle = $scope.modify_item_toggle.indexOf(parseInt($scope.item_toggle_change[parseInt($('#toggle_'+String(obj.idx)).val())].index));
        //             $scope.modify_item_list.splice(index_list, 1);
        //             $scope.modify_item_obj.splice(index_obj, 1);
        //             $scope.modify_enabled.splice(index_en, 1);
        //             $scope.modify_disabled.splice(index_dis, 1);
        //             $scope.modify_item_title.splice(index_title, 1);
        //             $scope.modify_item_price.splice(index_price, 1);
        //             $scope.modify_item_position.splice(index_position, 1);
        //             $scope.modify_item_toggle.splice(index_toggle, 1);
        //         }
        //     }
        // }
        //
        // $scope.refresh_list = function(){
        //     $route.reload();
        // }
        //
        // $scope.item_enable = function(item_idx, title, price, en, position, toggle){
        //     var api_params = {};
        //     if(en != '') {
        //         api_params['item_idx'] = item_idx;
        //         api_params['item_title'] = title;
        //         api_params['item_price'] = price;
        //         api_params['item_shape'] = position;
        //         api_params['item_description_toggle'] = toggle;
        //         api_params['using_status'] = en;
        //         api_item_detail.save(api_params, function (data) {
        //             if (data.status == 200) {
        //                 for(let i in item_idx){
        //                     let obj = item_idx[i];
        //                     angular.element('#item_line_' + String(item_idx[i])).css('background', 'none');
        //                     angular.element('#unlock_' + String(item_idx[i])).css('display', 'flex');
        //                     angular.element('#usingLk_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#usingUk_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#lock_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#item_checked_' + String(item_idx[i])).attr("checked", false);
        //                     angular.element('#item_check_all').attr("checked", false);
        //                     // $('#shape_' + String(item_idx[i])).attr('disabled', false);
        //                     // $('#toggle_' + String(item_idx[i])).attr('disabled', false);
        //                     // $('#title_' + String(item_idx[i])).attr('disabled', false);
        //                     // $('#price_' + String(item_idx[i])).attr('disabled', false);
        //                 }
        //                 $scope.init_array();
        //             }
        //         });
        //     }else{
        //         $route.reload();
        //     }
        // }
        //
        // $scope.item_disable = function(item_idx, title, price, dis, position, toggle){
        //     var api_params = {};
        //     if(dis != '') {
        //         api_params['item_idx'] = item_idx;
        //         api_params['item_title'] = title;
        //         api_params['item_price'] = price;
        //         api_params['item_shape'] = position;
        //         api_params['item_description_toggle'] = toggle;
        //         api_params['using_status'] = dis;
        //         api_item_detail.save(api_params, function (data) {
        //             if (data.status == 200) {
        //                 for(let i in item_idx){
        //                     let obj = item_idx[i];
        //                     angular.element('#item_line_' + String(item_idx[i])).css('background', 'none');
        //                     angular.element('#unlock_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#usingLk_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#usingUk_' + String(item_idx[i])).css('display', 'none');
        //                     angular.element('#lock_' + String(item_idx[i])).css('display', 'flex');
        //                     angular.element('#item_checked_' + String(item_idx[i])).attr("checked", false);
        //                     angular.element('#item_check_all').attr("checked", false);
        //                     // $('#shape_' + String(item_idx[i])).attr('disabled', true);
        //                     // $('#toggle_' + String(item_idx[i])).attr('disabled', true);
        //                     // $('#title_' + String(item_idx[i])).attr('disabled', true);
        //                     // $('#price_' + String(item_idx[i])).attr('disabled', true);
        //                 }
        //                 $scope.init_array();
        //             }
        //         });
        //     }else{
        //         $route.reload();
        //     }
        // };
        //
        // $scope.item_change = function() {
        //     var api_params = {};
        //     api_params['item_idx'] = $scope.selectedCheckItem.idx;
        //     api_params['fk_video_idx'] = $scope.selectedCheckItem.fk_video_idx;
        //     api_params['fk_user_idx'] = $scope.selectedCheckItem.fk_user_idx;
        //     api_params['item_title'] = $scope.selectedCheckItem.item_title;
        //     api_params['item_description'] = $scope.selectedCheckItem.item_description;
        //     api_params['item_price'] = $scope.selectedCheckItem.item_price;
        //     api_params['item_redirect_url'] = $scope.selectedCheckItem.item_redirect_url;
        //     api_params['item_description_url'] = $scope.selectedCheckItem.item_description_url;
        //     api_params['fk_item_main_type'] = $scope.selectedCheckItem.fk_item_main_type;
        //     api_params['fk_item_sub_type'] = $scope.selectedCheckItem.fk_item_sub_type;
        //     api_params['item_img_path'] = $scope.selectedCheckItem.item_img_path;
        //     api_params['item_shape_type'] = $scope.selectedCheckItem.item_shape_type;
        //     api_params['using'] = $scope.selectedCheckItem.using;
        //     api_params['update_check'] = $scope.selectedCheckItem.update_check;
        //     api_params['item_description_toggle'] = $scope.selectedCheckItem.item_description_toggle;
        //     api_params['make_request'] = $scope.selectedCheckItem.make_request;
        //     api_params['img_select'] = $scope.selectedCheckItem.img_select;
        //     api_params['video_auto_preview'] = $scope.selectedCheckItem.video_auto_preview;
        //     api_params['classesNum'] = $scope.selectedCheckItem.classesNum;
        //
        //     var change_item = confirm('정말로 변경하시겠습니까?');
        //     if(change_item) {
        //         api_item.update(api_params, function (data) {
        //             alert("변경되었습니다.")
        //         });
        //     }else {
        //         alert('취소하셨습니다.');
        //     }
        // };
        //
        // $scope.item_insert = function () {
        //     Modal.open(
        //         'views/popup_item_insert.html',
        //         'PopupItemInsertCtrl',
        //         'sisung',
        //         {}
        //     )
        // };
        //
        // function gup(name, url) {
        //     if (!url) url = location.href;
        //     name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        //     var regexS = "[\\?&]"+name+"=([^&#]*)";
        //     var regex = new RegExp( regexS );
        //     var results = regex.exec( url );
        //     return results == null ? null : results[1];
        // };
        //
        // //변수 선언
        // var width;
        // var height;
        // var margin;
        // // 페이지 로드시 자동실행
        // $(window).ready(function () {
        //     $scope.change_video_list_height();
        // });
        //
        //
        // // 화면 리사이즈시 실행
        // $(window).resize(function () {
        //     $scope.change_video_list_height();
        // });
        //
        // $scope.change_video_list_height = function() {
        //     width = document.getElementById("contents").offsetWidth;
        //     margin = document.getElementById("contents").offsetLeft;
        //     if (margin == 260){
        //         height = document.getElementById("contents").offsetHeight - 195 +'px';
        //         document.getElementById("library-check-wrap").style.maxHeight = height;
        //     }
        //     else if (width <= 768) {
        //         height = document.getElementById("contents").offsetHeight - 135 +'px';
        //         document.getElementById("library-check-wrap").style.maxHeight = height;
        //     }
        // }
    });