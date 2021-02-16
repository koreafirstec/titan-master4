'use strict';

angular.module('titanApp')
    .factory('Modal', function ($modal) {
        return {
            open: function (templateUrl, controller, size, resolve, postProcess) {
                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: controller,
                    backdrop: 'static',
                    keyboard: true,
                    size: size,
                    resolve: resolve
                });
                modalInstance.result.then(postProcess);
            }

        };
    });