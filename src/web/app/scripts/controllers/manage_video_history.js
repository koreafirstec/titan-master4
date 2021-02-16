'use strict';

angular.module('titanApp').controller('AdminVideoHistoryCtrl', function ($scope, AuthService) {
    $scope.user_idx = AuthService.getIdx();

});