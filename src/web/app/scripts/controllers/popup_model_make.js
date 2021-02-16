'use strict';

angular.module('titanApp')
    .controller('PopupModelMakeCtrl', function ($scope, AuthService, classes, annotations, model, api_shape, api_titan_model, $modalInstance, $location, $timeout) {
        $scope.user_idx = AuthService.getIdx();
        $scope.modal_title = "모델 생성";
        $scope.model = model;
        $scope.create_model = true;
        var reload = true;
        $scope.new_shape = [];
        $scope.classes = classes;

        api_shape.get(null, function (data) {
            $scope.shape_list = data.objects;

            for(let i=0; i<Object.keys(classes).length; i++) {
                var alredy_shape = $scope.shape_list.filter(function (d) {
                    if(d.shape_type === classes[i]) return d;
                });
                if(alredy_shape.length > 0) {
                    $scope.new_shape.push(alredy_shape[0].shape_title);
                } else {
                    $scope.new_shape.push('');
                }
            }
        });

        if (model) {
            $scope.modal_title = "모델 수정";
            $scope.model_title = model.model_title;
            $scope.model_description = model.model_description;
            $scope.model_epochs = model.model_epochs;
            $scope.model_access = model.model_access;
            if($scope.model_access) $scope.model_access_status = true;
            else $scope.model_access_status = false;
        }

        var api_params = {};
        api_params['classes'] = classes;
        api_params['annotations'] = annotations;

        $scope.model_make = function() {
            api_params['user_idx'] = $scope.user_idx;
            api_params['model_title'] = $scope.model_title;
            api_params['model_description'] = $scope.model_description;
            api_params['model_epochs'] = $scope.model_epochs;
            if($scope.model_access_status) $scope.model_access = 1;
            else $scope.model_access = 0;
            api_params['model_access'] = $scope.model_access;
            if($scope.create_model) api_params['create_model'] = 1;
            else api_params['create_model'] = 0;

            $timeout(function () {
                if(model) {
                    api_params['model_idx'] = model.idx;
                    api_titan_model.update(api_params, function(data){
                        if(data.status === 402){
                            alert('같은 이름의 모델이 이미 존재합니다.');
                            reload = false;
                            return;
                        }
                        reload = true;
                    });
                } else {
                    api_titan_model.save(api_params, function(data){
                        if(data.status === 402){
                            alert('같은 이름의 모델이 이미 존재합니다.');
                            reload = false;
                            return;
                        }
                        reload = true;
                    });
                }
            }, 500);

            if(reload) {
                $modalInstance.close(true);
                // $modalInstance.dismiss('cancel');
                // $location.url('/manage/model', true);
            }
        };

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    });