'use strict';

angular.module('titanApp')
    .controller('AlertCtrl', function ($scope,$modalInstance,alertTitle,alertMsg) {
        $scope.alertTitle = alertTitle;
        $scope.alertMsg = alertMsg;

        $(document).on('keydown', function(e){
            var code = (e.keyCode ? e.keyCode : e.which);
            switch (code) {
                case 27: //ESC
                    $modalInstance.dismiss('cancel');
                    $('#alert_modal').off("keydown");
                    break;
            }
        });

        $(document).mousedown(function (e) {
            var container = $("#alert_modal");
            if (!container.is(e.target) && container.has(e.target).length === 0){
                $modalInstance.dismiss('cancel');
            }
        });

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    });
