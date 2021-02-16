/**
 * Created by sisung
 */
'use strict';

//angular.module('monApp')
angular.module('titanApp')
    .controller('AdminElectionCtrl', function ($scope, $rootScope,AuthService, $location, Modal, $timeout, ngTableParams, item){
//		$scope.onElectionAdd = function (item) {
//			Modal.open(
//				'views/popup_election_add.html',
//				'PopupElectionAddCtrl',
//				'sisung',
//				{
//					item: function(){
//						return item;
//					}
//				}
//			);
//		};

        function testFunc(message) {
            $scope.count = message;
            console.log(message);

            $scope['item'] = "oh";
        }
    });
