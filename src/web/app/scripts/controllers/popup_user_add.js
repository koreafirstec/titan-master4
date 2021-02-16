'use strict';

angular.module('titanApp')
    .controller('PopupUserAddCtrl', function ($scope, AuthService, $location, Session, Modal, $modalInstance, $route) {
        $scope.user_title = "사용자 추가";
        $scope.credentials = {

        };

        $scope.user_add = function(credentials){
            AuthService.userAdd(credentials);
            $modalInstance.dismiss('cancel');
            $route.reload();
        };



        $scope.close = function(){
            $modalInstance.dismiss('cancel');
        }
    });