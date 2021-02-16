'use strict';

angular.module('titanApp')
    .controller('LoadingCtrl', function ($scope, $modalInstance) {
        $scope.close = function(){
            $modalInstance.dismiss('cancel');
        }
    });