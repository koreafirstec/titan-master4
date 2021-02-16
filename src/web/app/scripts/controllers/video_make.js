'use strict';

angular.module('titanApp')
    .controller('VideoMakeCtrl', function ($scope, $rootScope, $http, $location, $route, AuthService,  Modal/*, ngTableParams,$timeout*/) {
        // COMMON ------------------------------------------------------------------------------------------------------
        $scope.isAuthenticated = AuthService.isAuthenticated();

        $scope.video_make = null;

        var params = $location.search();
//        $scope.order = params['order'] || '-';
//        $scope.order_by = params['order_by'] || 'uname';

        $scope.MakePopup = function() {
             Modal.open(
            'views/popup_make.html',
            'PopupMakeCtrl',
            'sisung',
//            {
//               item: function(){
//                   console.log(item);
//                  return item;
//               }
//            }
            );
        };
    });
