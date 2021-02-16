'use strict';
angular.module('titanApp')
    .directive(
        'PopupWindow',
        function () {
            return {
                template : '<div>Click me !</div>',
                replace : true,
                link : function (scope, element) {
                    element.bind('click', function ()
                    {
                        alert('Clicked !');
                    });
                },
            };
        }
    );
