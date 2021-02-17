'use strict';

angular.module('titanApp')
    .controller('ItemAddCtrl', function ($scope, $route, api_item) {
        $scope.li_info_add = true;
        $scope.li_category = false;
        $scope.li_option = false;

        $scope.item_title = '';
        $scope.item_price = '';
        $scope.item_explanation = '';
        $scope.item_url = '';

        $scope.li_click = function (click) {
            switch (click) {
                case 'li_info_add':
                    $scope.li_info_add = true;
                    $scope.li_category = false;
                    $scope.li_option = false;
                    break;
                case 'li_category':
                    $scope.li_info_add = false;
                    $scope.li_category = true;
                    $scope.li_option = false;
                    break;
                case 'li_option':
                    $scope.li_info_add = false;
                    $scope.li_category = false;
                    $scope.li_option = true;
                    break;
            }
        };

        $scope.item_add = function(){
            var api_params = {};
            api_params['item_title'] = $scope.item_title;
            api_params['item_price'] = $scope.item_price;
            api_params['item_explanation'] = $scope.item_explanation;
            api_params['item_url'] = $scope.item_url;

            api_item.save(api_params, function (data) {
                if(data.status==200){
                    // $scope.dataStatus = 200;
                    //
                    // api_item.get(get_params, function (data) {
                    //     if (data.status == 200) {
                    //         // console.log(data.objects[data.objects.length - 1].idx);
                    //         // preview(item.item_title, data.objects[data.objects.length - 1].idx);
                    //
                    //         $route.reload();
                    //         // $modalInstance.dismiss('ok');
                    //     }
                    // });
                }
            })
        }
//        $(document).on('mousedown', function(e){
//           var container2 = $("#video_item_insert_list");
//           if (!container2.is(e.target) && container2.has(e.target).length === 0){
//               $modalInstance.dismiss('cancel');
//           }
//        });

//         var val = $("input[name=img_select]:checked").val();
//
//         $scope.select_video_list = [];
//         $scope.select_video = null;
//         $scope.item_img_path = '';
//         $scope.img_select = 1;
//         $scope.item = {};
//         $scope.myFile = [];
//         $scope.item.make_request = true;
//         $scope.item_len = $scope.item.length;
//         $scope.i = 0;
//
//         $scope.item_main_type= [
//             {index: 0, item: '의류', value: 0},
//             {index: 1, item: '가전류', value: 1},
//             {index: 2, item: '고전', value: 2},
//             {index: 3, item: '대통령', value: 3},
//             {index: 4, item: '장난감', value: 4},
//             {index: 5, item: '가방', value: 5},
//         ];
//
//         $scope.item_main = $scope.item_main_type[0];
//
//         $scope.item_sub_s_type = [
//             {index: 0, item: '셔츠', value: 0},
//             {index: 1, item: '바지', value: 1},
//             {index: 2, item: '모자', value: 2},
//             {index: 3, item: '블라우스', value: 3},
//             {index: 4, item: '신발', value: 4},
//             {index: 5, item: '점퍼', value: 5}
//         ];
//
//         $scope.item_sub_e_type = [
//             {index: 0, item: '전자레인지', value: 0},
//             {index: 1, item: '냉장고', value: 1},
//             {index: 2, item: 'TV', value: 2}
//         ];
//
//         $scope.item_sub_p_type = [
//             {index: 0, item: '골동품', value: 0}
//         ];
//
//         $scope.item_sub_president_type = [
//             {index: 0, item: '대통령', value: 1}
//         ];
//
//         $scope.item_sub_toys_type = [
//             {index: 0, item: '장난감', value: 0}
//         ];
//
//         $scope.item_sub_bag_type = [
//             {index: 0, item: '구찌', value: 0}
//         ];
//
//         $scope.item_sub_type = $scope.item_sub_s_type;
//         $scope.item_sub = $scope.item_sub_s_type[0];
//
//         var api_params = {};
//
//         // if(AuthService.getFkGroupIdx() != 1){
// //        api_params['fk_group_idx'] = AuthService.getFkGroupIdx();
// //        api_params['user_idx'] = AuthService.getIdx();
//         // }else{
//         //     api_params['all_list'] = 'all';
//         // }
//
// //        api_video.get(api_params, function (data) {
// //            if(data.status == 200){
// //                for(let objectKey in data.objects){
// //                    var object = data.objects[objectKey];
// //                    $scope.select_video_list.push({
// //                        'video_idx': object.idx,
// //                        'video_name': shorten(object.video_title, 20, '...', false),
// //                        'video_title': shorten(object.video_title, 20, '...', false),
// //                        'video_id': object.video_url.substr(32, 11)
// //                    });
// //                }
// //            }
// //        });
//         $scope.select_video = $scope.select_video_list[0];
//
//         $scope.item_idx = 0;
//
//         $scope.calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
//             var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
//             return { width: srcWidth*ratio, height: srcHeight*ratio };
//         };
//
//         $scope.generateThumbnail = function(url,prefix,file, width, height, quality) {
//             var deferred = $q.defer();
//             var canvasElement = document.createElement('canvas');
//             var imagenElement = document.createElement('img');
//             imagenElement.onload = function () {
//                 var dimensions = $scope.calculateAspectRatioFit(imagenElement.width, imagenElement.height, width, height);
//                 canvasElement.width = dimensions.width;
//                 canvasElement.height = dimensions.height;
//
//                 var context = canvasElement.getContext('2d');
//                 context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
//
//                 var file = canvasElement.toDataURL('image/jpeg', 0.9);
//                 var blob = $scope.dataURItoBlob(file);
//
//                 $scope.upload = $upload.upload({
//                     url: url,
//                     method: 'POST',
//                     file: blob
//                 }).success(function(data, status, headers, config) {
//                     if(status == 200){
//                         $scope.item_img_path = data.objects['fileurl'] + "?cb=" + new Date().getTime();;
//                         // console.log("URL : " + $scope.item_img_path);
//                     }else{
//                         alert("문제가 발생했습니다.");
//                     }
//                 });
//
//             };
//             imagenElement.src = file;
//         };
//
//         $scope.dataURItoBlob = function(dataURI) {
//         // convert base64/URLEncoded data component to raw binary data held in a string
//             var byteString;
//             if (dataURI.split(',')[0].indexOf('base64') >= 0){
//                 byteString = atob(dataURI.split(',')[1]);
//             } else
//                 byteString = unescape(dataURI.split(',')[1]);
//
//             // separate out the mime component
//             var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//
//             // write the bytes of the string to a typed array
//             var ia = new Uint8Array(byteString.length);
//             for (var i = 0; i < byteString.length; i++) {
//                 ia[i] = byteString.charCodeAt(i);
//             }
//
//             return new Blob([ia], {type:mimeString});
//         };
//
//         $scope.Uploads = function(){
//            var fileUp = document.getElementById("TEST");
//            var imageUp = document.getElementById("imageFile");
//            if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest') {
//                 imageUp.onclick = function() {
//                     fileUp.click();
//                 };
//            }else{
//                 $scope.$apply(function() {
//                     imageUp.onclick = function() {
//                         fileUp.click();
//                     };
//                 });
//            }
//         }
//
//         $scope.onFileSelect = function($file,prefix) {
//             $rootScope.timeout = true;
// //            var item_idx = document.querySelector('input[id='+prefix+']').files[0];
// //            var item_idx = 999;
//             $scope.imgVersion++;
//             //+ '&imgVersion='+$scope.imgVersion
//             var url = ENV.host + "/api/file_upload?&prefix=" + prefix + '&item_idx=' + $scope.item_idx;
//             var file = null;
//             file = document.querySelector('input[id='+prefix+']').files[0];
//             var reader = new FileReader();
//
//             reader.onload = function (e) {
//                 //4:3 416:312 = 4:3
//                 $scope.generateThumbnail(url,prefix,e.target.result,416,312,50);
//                 document.getElementById(prefix).value = "";
//             };
//
//             reader.readAsDataURL(file);
//         };
//         function preview(prefix, item_idx) {
//             $scope.i = 0;
//             var input = document.getElementById('sample_images');
//             if (input.files && input.files[0]) {
//
//                 builder_uploader(item_idx, prefix).then(() => {
//                     console.log("work successfully");
//                 });
//
//                 $(input.files).each(function () {
//                     $scope.i++;
//                     var reader = new FileReader();
//                     reader.readAsDataURL(this);
//                     reader.onload = function (e) {
//                         var url = ENV.host + "/api/file_upload?&prefix=" + prefix + '&fk_item_idx=' + $scope.item_idx + "&group_idx=" + group_idx + "&umm="+ $scope.i;
//                         var blob = $scope.dataURItoBlob(e.target.result);
//                         $scope.upload = $upload.upload({
//                             url: url,
//                             method: 'POST',
//                             file: blob
//                         }).success(function (data, status, headers, config) {
//                             if (status == 200) {
//                                 // $scope.item_img_path = data.objects['fileurl'] + "?cb=" + new Date().getTime();
//                                 // console.log("URL : " + $scope.item_img_path);
//                             } else {
//                                 alert("문제가 발생했습니다.");
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//
//         $scope.add_new_item = async function(item, video_idx, item_img_path, main, sub){
//             var api_params = {}
//             $scope.dataStatus = 203;
//             api_params['item_idx'] = $scope.item_idx;
//             api_params['fk_video_idx'] = video_idx;
//             api_params['fk_user_idx'] = AuthService.getIdx();
//             api_params['item_title'] = item.item_title;
//             api_params['item_description'] = item.item_description;
//             api_params['item_price'] = item.item_price;
//             api_params['item_redirect_url'] = item.item_redirect_url;
//             api_params['item_description_url'] = '';
//             api_params['fk_item_main_type'] = main;
//             api_params['fk_item_sub_type'] = sub;
//             api_params['item_img_path'] = item_img_path;
//             api_params['item_shape_type'] = 1;
//             api_params['using'] = 0;
//             api_params['item_description_toggle'] = 0;
//             api_params['insert_status'] = 0;
//             api_params['img_select'] = $scope.img_select;
//             if($scope.item.make_request){
//                 api_params['make_request'] = 1;
//             }else{
//                 api_params['make_request'] = 0;
//             }
//
//             var change_item = confirm('정말로 추가하시겠습니까?');
//             if(change_item) {

//             }else {
//                 alert('취소하셨습니다.');
//             }
//         };
//
//         $scope.change_item = function (item_main) {
//             if(item_main.value == 0){
//                 $scope.item_sub_type = $scope.item_sub_s_type;
//                 $scope.item_sub = $scope.item_sub_s_type[0];
//             }else if(item_main.value == 1){
//                $scope.item_sub_type = $scope.item_sub_e_type;
//                $scope.item_sub = $scope.item_sub_e_type[0];
//             }else if(item_main.value == 2){
//                 $scope.item_sub_type = $scope.item_sub_p_type;
//                 $scope.item_sub = $scope.item_sub_p_type[0];
//             }else if(item_main.value == 3){
//                 $scope.item_sub_type = $scope.item_sub_president_type;
//                 $scope.item_sub = $scope.item_sub_president_type[0];
//             }else if(item_main.value == 4){
//                 $scope.item_sub_type = $scope.item_sub_toys_type;
//                 $scope.item_sub = $scope.item_sub_toys_type[0];
//             }else if(item_main.value == 5){
//                 $scope.item_sub_type = $scope.item_sub_bag_type;
//                 $scope.item_sub = $scope.item_sub_bag_type[0];
//             }else{
//
//             }
//         }
//
//         angular.element('#make_request').attr("checked", true);
//
//         function shorten(text, maxLength, delimiter, overflow) {
//               delimiter = delimiter || "&hellip;";
//               overflow = overflow || false;
//               var ret = text;
//               if (ret.length > maxLength) {
//                 var breakpoint = overflow ? maxLength + ret.substr(maxLength).indexOf(" ") : ret.substr(0, maxLength).lastIndexOf(" ");
//                 ret = ret.substr(0, breakpoint) + delimiter;
//               }
//               return ret;
//             }
//
//             $scope.ShowPicture = function(image_path){
//                 return ENV.webs + "/" + image_path;
//             }
//
//             $scope.close = function () {
//                 $modalInstance.dismiss('cancel')
//             }
//
//         async function builder_uploader(item_idx, item_name) {
//             const key = await init();
//
//             uploadToBuilder(key, item_idx, item_name);
//             return key;
//         }
//
//         async function init() {
//             var key = await new Promise((resolve, reject) => {
//                 $http.get('http://localhost:3000/init')
//                     .success((response) => {
//                         resolve(response.key);
//                     }).error((err) => {
//                         reject(err);
//                     });
//             });
//
//             return key;
//         }
//
//         var formData = new FormData();
//         $scope.myFiles = function($files) {
//             for(var i in $files) {
//                 formData.append('img', $files[i]);
//             }
//             checkFormdata(formData);
//         };
//         async function uploadToBuilder(key, item_idx, item_name) {
//
//             formData.append('group_id', key);
//             formData.append('item_number', item_idx);
//             formData.append('shape_idx', '1');
//             formData.append('item_name', item_name);
//             formData.append('type', 'item');
//
//             checkFormdata(formData);
//
//             uploadFileToUrl().then((res) => {
//                 console.log(res);
//             }).catch((err) => {
//                 console.log(err);
//             });
//         }
//
//         function uploadFileToUrl() {
//             // checkFormdata(formData);
//
//             return $http.post(
//                 'http://localhost:3000/upload',
//                 formData,
//                 {
//                     transformRequest: angular.identity,
//                     headers: {'Content-Type': undefined}
//                 })
//         }
//
//         function checkFormdata(form_data) {
//             for (var key of form_data.entries()) {
//                 console.log(key[0] + ', ' + key[1]);
//             }
//         }
//     }).directive('fileModel', ['$parse', function($parse) {
//         function fn_link(scope, element, attrs) {
//             var onChange = $parse(attrs.fileModel);
//             element.on('change', function (event) {
//                 onChange(scope, { $files: event.target.files });
//             });
//         }
//
//         return {
//             link: fn_link
//         }
//     }
//     ]
    });