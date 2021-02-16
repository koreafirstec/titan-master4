'use strict';

angular.module('titanApp', ['api'])
.controller('SettingCtrl',['$scope', 'api_item_detail', 'api_video', 'api_item', 'api_make_titan_video', function SettingCtrl($scope, api_item_detail, api_video, api_item, api_make_titan_video){
    $scope.remocon_types = [
        { type: 'over', value: '유튜브 영상 위에 표시' },
        { type: 'right', value: '유튜브 영상 오른쪽에 표시' },
        { type: 'move', value: '이동 가능하게 표시' }
    ]

    chrome.storage.sync.get('titan_status', function(item) {
        chrome.storage.sync.set({"titan_status": !item.titan_status});
    });

    function changeDisabled() {
        $scope.remocon_types.forEach(function(types) {
            document.getElementById(types.type).disabled = !$scope.titan_remocon_status;
        });
        
    }

    chrome.storage.sync.get('titan_remocon_status', function(item) {
        $scope.titan_remocon_status = item.titan_remocon_status;
        document.getElementById('check').checked = $scope.titan_remocon_status;
        changeDisabled();
    });

    chrome.storage.sync.get('titan_remocon_type', function(item) {
        document.getElementById(item.titan_remocon_type).checked = true;
    });

    $scope.remoconStatus = function() {
        chrome.storage.sync.set({"titan_remocon_status": $scope.titan_remocon_status});
        changeDisabled();
    }

    $scope.remoconType = function(type) {
        chrome.storage.sync.set({"titan_remocon_type": type});
    }

    $scope.titanStatus = function() {
        chrome.storage.sync.get('titan_status', function(item) {
            chrome.storage.sync.set({"titan_status": !item.titan_status});
        });
    }

    $scope.itemAddStatus = function() {
        chrome.storage.sync.get('titan_add_status', function(item) {
            chrome.storage.sync.set({"titan_add_status": !item.titan_add_status});
        });
    }
}]);