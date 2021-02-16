'use strict';

angular.module('titanApp')
    .controller('VideoDropCtrl', function ($scope, $route,$modalInstance, api_video, $timeout, Modal, api_shape, api_rect_check, AuthService, ENV) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        }
});