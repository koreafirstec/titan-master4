'use strict';

angular.module('titanApp')
    .directive('cellHighlight', function() {
      return {
        restrict: 'C',
        link: function postLink(scope, iElement, iAttrs) {
          iElement.find('td')
            .mouseover(function() {
              $(this).parent('tr').css('opacity', '0.7');
            }).mouseout(function() {
              $(this).parent('tr').css('opacity', '1.0');
            });
        }
      };
}).directive('context', [
  function() {
    return {
      restrict: 'A',
      scope: '@&',
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          post: function postLink(scope, iElement, iAttrs, controller) {
            var ul = $('#' + iAttrs.context),
              last = null;
            ul.css({
              'display': 'none'
            });
            $(iElement).bind('contextmenu', function(event) {
              event.preventDefault();
               ul.css({
                position: "fixed",
                display: "block",
                left: event.clientX +'px',
                top: event.clientY +'px',
                width: 8+'%'
              });
              last = event.timeStamp;
            });


            $(document).mousedown(function (e) {
                var container = $(".context_back");
                if (!container.is(e.target) && container.has(e.target).length === 0){
                    $('.context_back').css('display', 'none');
                }
            });
//            $('.context_back').mouseleave(function(e) {
//                $('.context_back').css('display', 'none');
//              var target = $(e.target);
//              if (!target.is(".context_back") && !target.parents().is(".context_back")) {
//                if (last === e.timeStamp)
//                  return;
//                ul.css({
//                  'display': 'none'
//                });
//              }
//            });

            $('.context_back').click(function(e) {
                $('.context_back').css('display', 'none');
            });
          }
        };
      }
    };
  }
]);