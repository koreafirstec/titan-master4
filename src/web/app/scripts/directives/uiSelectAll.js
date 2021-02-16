'use strict';

angular.module('titanApp')
    .directive('uiSelectAll', ['$filter', function($filter) {
        return {
            restrict: 'E',
            template: '<input type="checkbox">',
            replace: true,
            link: function(scope, iElement, iAttrs) {
                function changeState(checked, indet) {
                    iElement.prop('checked', checked).prop('indeterminate', indet);
                }
                function updateItems() {
                    angular.forEach(scope.$eval(iAttrs.items), function(el) {
                        el[iAttrs.prop] = iElement.prop('checked');
                    });
                }
                iElement.bind('change', function() {
                    scope.$apply(function() { updateItems(); });
                });
                scope.$watch(iAttrs.items, function(newValue) {
                    var checkedItems = $filter('filter')(newValue, function(el) {
                        return el[iAttrs.prop];
                    });
                    switch(checkedItems ? checkedItems.length : 0) {
                        case 0:                // none selected
                            changeState(false, false);
                            break;
                        case newValue.length:  // all selected
                            changeState(true, false);
                            break;
                        default:               // some selected
                            changeState(false, true);
                    }
                }, true);
                updateItems();
            }
        };
    }]);