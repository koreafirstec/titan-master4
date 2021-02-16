/**
 * Created by ksm on 2014-12-11.
 */
'use strict';

angular.module('titanApp')
.controller('PopupMakeCtrl', function ($scope,$rootScope,AuthService, $window,$modalInstance,$timeout, $location,$filter,$route,Modal, api_item, $upload, ENV, $q, item, item_info, item_video, /* api_shape_list,itemListParams,item, $sce,CanvasDirective ,api_video_item_detail_list*/) {
        $scope.user_id = AuthService.getUserId();
        $scope.title = "상품 수정";
        $scope.message = "";
        $scope.item_main = null;
        $scope.item_shape = null;
        $scope.item_sub = null;
        $scope.item_idx = 0;
        $scope.imgVersion = 0;
        $scope.item_sub_info = item_info;

        if(item_info.idx == undefined){
            $scope.tb_item_idx = item_info.fk_item_idx;
        }else{
            $scope.tb_item_idx = item_info.idx;
        }
        if(item_info.fk_video_idx == undefined){
            $scope.fk_video_idx = item_info.video_idx;
        }else{
            $scope.fk_video_idx = item_info.fk_video_idx;
        }
        $scope.fk_user_idx = AuthService.getIdx();
        $scope.item_price = String(item_info.update_item_price);
        $scope.item_title = item_info.item_title;
        $scope.item_description = item_info.item_description;
        $scope.item_redirect_url = item_info.item_redirect_url;
        $scope.item_description_url = item_info.item_description_url;
        $scope.item_img_path = item_info.item_img_path;
        $scope.video_auto_preview = item_video.video_auto_preview;
        $scope.img_exists = item_info.img_exists;

        $scope.item_main_type= [
            {index: 0, item: '의류', value: 0},
            {index: 1, item: '가전류', value: 1},
            {index: 2, item: '고전', value: 2},
            {index: 3, item: '대통령', value: 3},
            {index: 4, item: '장난감', value: 4},
        ];

        $scope.item_main = $scope.item_main_type[item_info.fk_item_main_type];

        $scope.item_sub_s_type = [
            {index: 0, item: '셔츠', value: 0},
            {index: 1, item: '바지', value: 1},
            {index: 2, item: '모자', value: 2},
            {index: 3, item: '블라우스', value: 3},
            {index: 4, item: '신발', value: 4},
            {index: 5, item: '점퍼', value: 5}
        ];

        $scope.item_sub_e_type = [
            {index: 0, item: '전자레인지', value: 0},
            {index: 1, item: '냉장고', value: 1},
            {index: 2, item: 'TV', value: 2}
        ];

        $scope.item_sub_p_type = [
            {index: 0, item: '골동품', value: 0}
        ];

        $scope.item_sub_president_type = [
            {index: 0, item: '대통령', value: 0}
        ];

        $scope.item_sub_toys_type = [
            {index: 0, item: '장난감', value: 0}
        ];

        if($scope.item_main.value == 0){
           $scope.item_sub_type = $scope.item_sub_s_type;
           $scope.item_main_sub = $scope.item_sub_s_type.find(subS => subS.value === item_info.fk_item_sub_type);
           if($scope.item_main_sub){
               $scope.item_sub = $scope.item_main_sub;
           }else
               $scope.item_sub = $scope.item_sub_s_type.find(subS => subS.value === 0);
        }else if($scope.item_main.value == 1){
            $scope.item_sub_type = $scope.item_sub_e_type;
            $scope.item_main_sub = $scope.item_sub_e_type.find(subS => subS.value === item_info.fk_item_sub_type);
            if($scope.item_main_sub){
                $scope.item_sub = $scope.item_main_sub;
            }else
                $scope.item_sub = $scope.item_sub_e_type.find(subS => subS.value === 0);
        }else if($scope.item_main.value == 2){
            $scope.item_sub_type = $scope.item_sub_p_type;
            $scope.item_main_sub = $scope.item_sub_p_type.find(subS => subS.value === item_info.fk_item_sub_type);
            if($scope.item_main_sub){
                $scope.item_sub = $scope.item_main_sub;
            }else
                $scope.item_sub = $scope.item_sub_p_type.find(subS => subS.value === 0);
        }else if($scope.item_main.value == 3){
            $scope.item_sub_type = $scope.item_sub_president_type;
            $scope.item_main_sub = $scope.item_sub_president_type.find(subS => subS.value === item_info.fk_item_sub_type);
            if($scope.item_main_sub){
                $scope.item_sub = $scope.item_main_sub;
            }else;
        }else if($scope.item_main.value == 4){
            $scope.item_sub_type = $scope.item_sub_toys_type;
            $scope.item_main_sub = $scope.item_sub_toys_type.find(subS => subS.value === item_info.fk_item_sub_type);
            if($scope.item_main_sub){
                $scope.item_sub = $scope.item_main_sub;
            }else
                $scope.item_sub = $scope.item_sub_toys_type.find(subS => subS.value === 0);
        }

        $scope.item_shape_type= [
            {index: 0, item: '사각형', value: 0},
            {index: 1, item: '선물상자', value: 1},
            {index: 2, item: '모두', value: 2}
        ];

        $scope.item_shape = $scope.item_shape_type[item_info.item_shape_type];

        $scope.item_change_site= [
            {index: 0, item: '구매 사이트', value: 0},
            {index: 1, item: '설명 사이트', value: 1}
        ];

        $scope.item_site = $scope.item_change_site[item_info.item_description_toggle];

        // $scope.autoVideoPreview= [
        //     {index: 0, item: '종료', value: 0},
        //     {index: 1, item: '실행', value: 1}
        // ];
        //
        // $scope.auto_preview = $scope.autoVideoPreview[item_video.video_auto_preview];

         $scope.item_idx = 999;

         $scope.calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
            var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
            return { width: srcWidth*ratio, height: srcHeight*ratio };
        };

        $scope.generateThumbnail = function(url,prefix,file, width, height, quality) {
            var deferred = $q.defer();
            var canvasElement = document.createElement('canvas');
            var imagenElement = document.createElement('img');
            imagenElement.onload = function () {
                var dimensions = $scope.calculateAspectRatioFit(imagenElement.width, imagenElement.height, width, height);
                canvasElement.width = dimensions.width;
                canvasElement.height = dimensions.height;
                var context = canvasElement.getContext('2d');
                context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
                var file = canvasElement.toDataURL('image/jpeg', 0.9);
                var blob = $scope.dataURItoBlob(file);
                $scope.upload = $upload.upload({
                    url: url,
                    method: 'POST',
                    file: blob
                }).success(function(data, status, headers, config) {
                    if(status == 200){
                        $scope.item_img_path = data.objects['fileurl'];
                        console.log("URL : " + $scope.item_img_path);
                    }else{
                        alert("아닛!!!!!");
                    }
                });

            };
            imagenElement.src = file;
        };

        $scope.dataURItoBlob = function(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0){
                byteString = atob(dataURI.split(',')[1]);
            } else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        };

        $scope.Uploads = function(){
           var fileUp = document.getElementById("TEST");
           var imageUp = document.getElementById("imageFile");
           if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest') {
                imageUp.onclick = function() {
                    fileUp.click();
                };
           }else{
                $scope.$apply(function() {
                    imageUp.onclick = function() {
                        fileUp.click();
                    };
                });
           }
        }

        $scope.onFileSelect = function($file,prefix) {
            $rootScope.timeout = true;
//            var item_idx = document.querySelector('input[id='+prefix+']').files[0];
//            var item_idx = 999;
            $scope.imgVersion++;
            //+ '&imgVersion='+$scope.imgVersion
            var url = ENV.host + "/api/file_upload?&prefix=" + prefix + '&item_idx=' + $scope.item_idx;
            var file = null;
            file = document.querySelector('input[id='+prefix+']').files[0];
            var reader = new FileReader();

            reader.onload = function (e) {
                $scope.generateThumbnail(url,prefix,e.target.result,800,600,50);
                document.getElementById(prefix).value = "";
            };

            reader.readAsDataURL(file);
        };

        $scope.previewOnOff = function(video_auto_preview){
            if($scope.video_auto_preview == 0){
                $scope.video_auto_preview = 1;
            }else{
                $scope.video_auto_preview = 0;
            }
        }

        $scope.UpdateItem = function () {
            var api_params = {};
            api_params['item_idx'] = $scope.tb_item_idx;
            api_params['fk_video_idx'] = $scope.fk_video_idx;
            api_params['fk_user_idx'] = $scope.fk_user_idx;
            api_params['item_price'] = $scope.item_price;
            api_params['item_title'] = $scope.item_title;
            api_params['item_description'] = $scope.item_description;
            // api_params['item_redirect_url'] = $scope.item_redirect_url;
            // api_params['item_description_url'] = $scope.item_description_url;
            if($scope.item_img_path != undefined && $scope.item_img_path != '')
                api_params['item_img_path'] = $scope.item_img_path;
            else
                api_params['item_img_path'] = null;
            if($scope.item_main != undefined)
                api_params['fk_item_main_type'] = $scope.item_main.value;
            else
                api_params['fk_item_main_type'] = -1;
            if($scope.item_sub != undefined)
                api_params['fk_item_sub_type'] = $scope.item_sub.value;
            else
                api_params['fk_item_sub_type'] = -1;
            if($scope.item_shape != undefined)
                api_params['item_shape_type'] = $scope.item_shape.value;
            else
                api_params['item_shape_type'] = -1;
            if($scope.item_site != undefined){
                if($scope.item_site.value == 0){
                    api_params['item_redirect_url'] = $scope.item_redirect_url;
                }else{
                    api_params['item_description_url'] = $scope.item_description_url;
                }
                api_params['item_description_toggle'] = $scope.item_site.value;
            }else
                api_params['item_description_toggle'] = -1;
            api_params['update_check'] = 1;
            api_params['video_auto_preview'] = $scope.video_auto_preview;

            api_item.update(api_params, function(data){
                if(data.status == 200){
                    $modalInstance.dismiss('ok');
                    $route.reload();
                }
                else{
                    console.log('item update fail');
                }
            });
        };

        $scope.close = function () {
            // $scope.delete_item(item_info.fk_item_idx);
            $modalInstance.dismiss('cancel');

        };

        $scope.close2 = function () {
            $modalInstance.dismiss('cancel');
            // $scope.delete_item(item_info.fk_item_idx);
        };

        $scope.delete_item = function(d_item_idx){
            var api_params = {};
            console.log(d_item_idx);
            api_params['d_item_idx'] = d_item_idx;
            api_item.delete(api_params, function (data) {
                if(data.status == 200){
                    $route.reload();
                    $modalInstance.dismiss('cancel');
                }
            });
        }

        $scope.ShowPicture = function(image_path){
            return ENV.webs + "/" + image_path;
        }

        $scope.change_item = function (item_main) {
            if(item_main.value == 0){
                $scope.item_sub_type = $scope.item_sub_s_type;
                $scope.item_main_sub = $scope.item_sub_s_type.find(subS => subS.value === item_info.fk_item_sub_type);
                if($scope.item_main_sub){
                    $scope.item_sub = $scope.item_main_sub;
                }else
                    $scope.item_sub = $scope.item_sub_s_type.find(subS => subS.value === 0);
            }else if(item_main.value == 1){
                $scope.item_sub_type = $scope.item_sub_e_type;
                $scope.item_main_sub = $scope.item_sub_e_type.find(subS => subS.value === item_info.fk_item_sub_type);
                if($scope.item_main_sub){
                    $scope.item_sub = $scope.item_main_sub;
                }else
                    $scope.item_sub = $scope.item_sub_e_type.find(subS => subS.value === 0);
            }else if(item_main.value == 2){
                 $scope.item_sub_type = $scope.item_sub_p_type;
                $scope.item_main_sub = $scope.item_sub_p_type.find(subS => subS.value === item_info.fk_item_sub_type);
                if($scope.item_main_sub){
                    $scope.item_sub = $scope.item_main_sub;
                }else
                    $scope.item_sub = $scope.item_sub_p_type.find(subS => subS.value === 0);
            }else if(item_main.value == 3){
                 $scope.item_sub_type = $scope.item_sub_president_type;
                $scope.item_main_sub = $scope.item_sub_president_type.find(subS => subS.value === item_info.fk_item_sub_type);
                if($scope.item_main_sub){
                    $scope.item_sub = $scope.item_main_sub;
                }else
                    $scope.item_sub = $scope.item_sub_president_type.find(subS => subS.value === 0);
            }else if(item_main.value == 4){
                 $scope.item_sub_type = $scope.item_sub_toys_type;
                $scope.item_main_sub = $scope.item_sub_toys_type.find(subS => subS.value === item_info.fk_item_sub_type);
                if($scope.item_main_sub){
                    $scope.item_sub = $scope.item_main_sub;
                }else
                    $scope.item_sub = $scope.item_sub_toys_type.find(subS => subS.value === 0);
            }
        }
    });
