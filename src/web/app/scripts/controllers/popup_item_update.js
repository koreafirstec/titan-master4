'use strict';

angular.module('titanApp')
.controller('PopupItemUpdateCtrl', function ($scope, $rootScope, $modalInstance, item_info, $route, $upload, ENV, $q, api_item) {
    $scope.item_img_path = item_info.item_img_path;
    $scope.item_title = item_info.item_title;
    $scope.item_price = parseInt(item_info.item_price);
    $scope.item_description = item_info.item_description;
    $scope.item_redirect_url = item_info.item_redirect_url;
    $scope.item_shape = item_info.item_shape;

    $scope.item_main_type= [
        {index: 0, item: '의류', value: 0},
        {index: 1, item: '가전류', value: 1}
    ];

    $scope.item_main = $scope.item_main_type[item_info.fk_item_main_type];

    $scope.item_sub_s_type = [
        {index: 0, item: '티셔츠', value: 0},
        {index: 1, item: '바지', value: 1},
        {index: 2, item: '블라우스', value: 2},
        {index: 3, item: '점퍼', value: 3},
        {index: 4, item: '신발', value: 4}
    ];

    $scope.item_sub_e_type = [
        {index: 0, item: '전자레인지', value: 0},
        {index: 1, item: '냉장고', value: 1},
        {index: 2, item: 'TV', value: 2}
    ];

    if($scope.item_main.value == 0){
       $scope.item_sub = $scope.item_sub_s_type[item_info.fk_item_sub_type];
    }else if($scope.item_main.value == 1){
       $scope.item_sub = $scope.item_sub_e_type[item_info.fk_item_sub_type];
    }

    $scope.item_shape_type= [
        {index: 0, item: '사각형', value: 0},
        {index: 1, item: '선물상자', value: 1}
    ];

    $scope.item_shape = $scope.item_shape_type[item_info.item_shape_type];

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

    $scope.UpdateItem = function () {
        console.log("main value : " + $scope.item_main.value)
        console.log("sub value 1: " + $scope.item_sub.item);
        var api_params = {};
        api_params['item_idx'] = item_info.idx;
        console.log("fk_video_idx:", item_info.fk_video_idx);
        api_params['fk_video_idx'] = item_info.fk_video_idx;
        api_params['fk_user_idx'] = item_info.fk_user_idx;
        api_params['item_price'] = $scope.item_price;
        api_params['item_title'] = $scope.item_title;
        api_params['item_description'] = $scope.item_description;
        api_params['item_redirect_url'] = $scope.item_redirect_url;
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
        api_params['update_check'] = 1;

        api_item.update(api_params, function(data){
            if(data.status == 200){
                console.log('item update success');
                $route.reload();
                $modalInstance.dismiss('ok');
            }
            else{
                console.log('item update fail');
            }
        });
    };

    $scope.ShowPicture = function(image_path){
        return ENV.webs + "/" + image_path;
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close2 = function () {
        $modalInstance.dismiss('cancel');
    };
});