'use strict';

angular.module('titanApp')
.directive('youtube', function($window, $location, $rootScope, api_item, api_item_detail, api_item_position_detail, api_video_capture, $timeout, $interval, api_make_titan_video, ENV) {
  return {
    restrict: "E",
    scope: {
      videoid: "@",
      videoidx: "@",
      open: "@",
      modeltitle: "@",
      itemlist: "@",
      statusi: "@",
      isautoplay: "@",
      iscontrols: "@",
      drawitemtype: "@",
      modifyposition: "@",
      rectstatus: "@",
      itemdetection: "@",
      seektime: "@",
      rightstatus: "@",
      firsttime: "@",
      isfs: "@"
    },

    template: '<div></div>',

    link: function(scope, element) {
      var player;
      if (!window.YT) {
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          $window.onYouTubeIframeAPIReady = function () {
              runPlayer();
          };
      } else
          runPlayer();

      function runPlayer() {
        if(!scope.isautoplay)
            scope.isautoplay = 0;
        if(!scope.isfs)
            scope.isfs = 1;
        if(!scope.iscontrols)
            scope.isfs = 1;
        if(!scope.seektime)
            scope.seektime = 0;
        player = new YT.Player(element.children()[0], {
          playerVars: {
            html5: 1,
            theme: "light",
            modesbranding: 0,
            color: "white",
            iv_load_policy: 3,
            showinfo: 1,
            controls: scope.iscontrols,
            autoplay: scope.isautoplay,
            fs: scope.isfs,
            rel: 0
          },
          events: {
           onStateChange: onPlayerStateChange
          },
          height: "100%",
          width: "100%",
          videoId: scope.videoid,
        });
        $rootScope.local_player = player;
      };

      var api_params = {};
      var intervals = [];
      var count = 0;
      var dataObjects;
      var item_list;
      $rootScope.newTime = 0;
      $rootScope.position = 0;
      $rootScope.total_position = 0;
      $rootScope.item_position_status = false;
      let seekTime = 0;
      var table_left;
      var table_top;
      $rootScope.hour = 0;
      $rootScope.minutes = 0;
      $rootScope.seconds = 0;
      var item_detection;
      var unique;
      $rootScope.remove_item_list = false;
      scope.item_detection_jq;
      // const category = ['top', 'bottom', 'skirt', 'shoes', 'cap', 'golfball', 'golfbag', 'golfclub'];
      $("#backward_btn").on('click', function(e){
          if(scope.videoid){
              var current_time = player.getCurrentTime()-5;
              player.seekTo(current_time, true);
          }
      });

      $("#play_btn").on('click', function(e){
          if(scope.videoid){
              player.playVideo();
          }
      });

      $("#modify_play_btn").on('click', function(e){
          if(scope.videoid){
              player.playVideo();
              $('.video_editor_modify_div').css('display', 'none');
          }
      });

      $("#forward_btn").on('click', function(e){
          if(scope.videoid){
              var current_time = player.getCurrentTime()+5;
              player.seekTo(current_time, true);
          }
      });

      $("#pause_btn").on('click', function(){
          if($rootScope.current_time_youtube != 0){
              angular.element('#meta_data_detector').css('display', 'none');
              player.seekTo(parseFloat($rootScope.current_time_youtube));
              $(".editor__rect").css('display', 'flex');
              clearInterval($rootScope.update_timer);
              player.pauseVideo();
          }else{
              $(".editor__rect").css('display', 'flex');
              clearInterval($rootScope.update_timer);
              player.pauseVideo();
          }
      });

      if(scope.videoidx) {
          api_params['video_id'] = scope.videoid;
          api_params['video_idx'] = scope.videoidx;
          api_item_detail.get(api_params, function (data) {
              $timeout(function () {
                  dataObjects = data.objects;
                  $rootScope.item_list = [];
                    let item_list = dataObjects.filter(function(d) { return (Number(d.position_time.toFixed(2)) === 0)});
                    for(let i in item_list) {
                        drawRect(item_list[i]);
                    }
              }, 500);
          });
      }

     function formatTime(time){
         time = parseInt(time);

         var hour = Math.floor(time / 3600),
         minutes = Math.floor((time - (hour * 3600)) / 60),
         seconds = time - (hour * 3600) - (minutes * 60);

         hour = hour < 10 ? '0' + hour : hour;
         minutes = minutes < 10 ? '0' + minutes : minutes;
         seconds = seconds < 10 ? '0' + seconds : seconds;

         return hour + ":" + minutes + ":" + seconds;
     }
      var time = 0;
      function onPlayerStateChange() {
          if(scope.videoidx) {
            if(player.getPlayerState() == 1) {
                $('#current-time').text(formatTime( player.getCurrentTime() ));
                $('#duration').text(formatTime( player.getDuration() ));
                $rootScope.myTimer = setInterval(function(){
                    $('#current-time').text(formatTime( player.getCurrentTime() ));
                    $('#duration').text(formatTime( player.getDuration() ));
                }, 1000);

                $('#play_btn').css('display', 'none');
                $('#pause_btn').css('display', 'inline-block');
                $('#modify_play_btn').css('display', 'none');
                $('#modify_pause_btn').css('display', 'inline-block');
                $('#meta_data_detector').css('display', 'none');
                // $('#video_canvas').css('display', 'flex');

                $rootScope.item_position_status = false;
                removeDiv();
                $('#next_time').on('click', function(e){
                    let seekTime = e.target.getAttribute("data-seek");
                    player.seekTo(parseFloat(seekTime), true);
                });
                $('#position_time').on('click', function(e){
                    let seekTime = e.target.getAttribute("data-seek");
                    player.seekTo(parseFloat(seekTime), true);
                });
                // item_list = JSON.parse(scope.itemlist);
                // if(item_list.length > 0) {
                //     item_list = JSON.parse(scope.itemlist);
                //     if (item_list.length > 0) {intervals.push($interval(function () { createDiv(item_list.length);}, 0));}
                // }else{
                //     var api_params = {};
                //     api_params['video_idx'] = scope.videoidx;
                //     api_params['detail_exists'] = 'exists';
                //     api_item.get(api_params, function(data){
                //         if(data.status == 200){
                //             item_list = data.objects;
                //             $rootScope.item_list = data.objects;
                //             if (item_list.length > 0) {intervals.push($interval(function () { createDiv(item_list.length);}, 0));}
                //         }
                //     });
                // }

                intervals.push($interval(function () { createDiv();}, 28));
            }else if(player.getPlayerState() == 2){
                clearInterval($rootScope.myTimer);
               //  angular.forEach(intervals, function(interval) {
               //     $interval.cancel(interval);
               // });
               // intervals.length = 0;
                $('#current-time').text(formatTime( player.getCurrentTime() ));
                $('#duration').text(formatTime( player.getDuration() ));
                $('#play_btn').css('display', 'inline-block');
                $('#pause_btn').css('display', 'none');
                $('#modify_play_btn').css('display', 'inline-block');
                $('#modify_pause_btn').css('display', 'none');
                if($rootScope.current_time_youtube != 0){
                    // $('#video_canvas').css('display', 'flex');
                    $('#meta_data_detector').css('display', 'none');
                }else{
                    $('#video_canvas').css('display', 'none');
                    $('#meta_data_detector').css('display', 'inline-block');
                }
            }else{
                clearInterval($rootScope.myTimer);
                $('#play_btn').css('display', 'inline-block');
                $('#pause_btn').css('display', 'none');
                $('#modify_play_btn').css('display', 'inline-block');
                $('#modify_pause_btn').css('display', 'none');
            }
          }
      }

       function removeDiv() {
         angular.forEach(intervals, function(interval) {
             $interval.cancel(interval);
         });
         intervals.length = 0;
       }

       function createDiv() {
            // $rootScope.newTime = Number(player.getCurrentTime().toFixed(2));
            // $rootScope.newTime = (Math.round(Number(player.getCurrentTime()) * 100.0) / 100.0).toFixed(2);
           $rootScope.newTime = player.getCurrentTime();
            // let item_list = dataObjects.filter(function(d) { return (Number(d.position_time.toFixed(2)) === $rootScope.newTime + 0.01)})
           // let item_list = dataObjects.filter(function(d) { return (Number(d.position_time.toFixed(2)) === $rootScope.newTime)})
           // var prevTime = $rootScope.newTime - 0.05;
           // var futureTime = $rootScope.newTime + 0.05;
           var prevTime = $rootScope.newTime - 0.0166666666666666666666665;
           var futureTime = $rootScope.newTime + 0.0166666666666666666666665;


           // console.log(prevTime + " / " +  dataObjects[0].position_time + " / "  + futureTime);

           let item_list = dataObjects.filter( d=> {return (d.position_time >= prevTime && d.position_time <= futureTime)})
           // console.log(item_list.length);

           drawRect(item_list);

           // if(item_list.length !== 0 && $rootScope.item_list !== item_list) {
           //      drawRect(item_list);
           //      $rootScope.item_list = item_list;
           // }

          //   // if(item_list.length !== 0 && $rootScope.item_list !== item_list) {
          //   //     $rootScope.item_list = item_list;
          //   //     drawRect($rootScope.item_list);
          //   // }
          //
          //  if($rootScope.remove_item_list) {
          //      $rootScope.item_list.splice(0, $rootScope.item_list.splice.length);
          //      $rootScope.remove_item_list = false;
          //  }
          //
          //
          // if(item_list.length !== 0) {
          //     for(let j in item_list) {
          //         if($rootScope.item_list.indexOf(item_list[j]) === -1) {
          //           drawRect(item_list[j]);
          //         }
          //     }
          //     $rootScope.remove_item_list = true;
          // }

        }

        function drawRect(item_list) {
            // $rootScope.item_list.push(item_list);
            // for(let i in item_list) {
            //     let item = item_list[i];
            //     let left = Math.floor(item.x / (1920 / 953));
            //     let top = Math.floor(item.y / (1080 / 536));
            //     let width = Math.floor(item.width / (1920 / 953));
            //     let height = Math.floor(item.height / (1080 / 536));
            //
            //     // let item_id = '#item_' + item.idx;
            //     let item_id = '#item_' + i;
            //     $(item_id).css('left', left);
            //     $(item_id).css('top', top);
            //     $(item_id).css('width', width);
            //     $(item_id).css('height', height);
            //     $(item_id).css('display', 'inline-block');
            // }

            for(let i = 0; i <= 30; i++) {
                let item_id = '#item_' + i;
                $(item_id).css('display', 'none');
            }

            for(let i = 0; i <= 30; i++) {
                let item_id = '#item_' + i;
                if(i < item_list.length) {
                    let item = item_list[i];
                    let left = Math.floor(item.x / (1920 / 953));
                    let top = Math.floor(item.y / (1080 / 536));
                    let width = Math.floor(item.width / (1920 / 953));
                    let height = Math.floor(item.height / (1080 / 536));

                    // let item_id = '#item_' + item.idx;
                    $(item_id).css('left', left);
                    $(item_id).css('top', top);
                    $(item_id).css('width', width);
                    $(item_id).css('height', height);
                    // $(item_id).text(category[item.draw_item_type]);
                    $(item_id).css('display', 'inline-block');
                }
                // else {
                //     $(item_id).css('display', 'none');
                // }
            }
        }

//       function createDiv(item_length) {
//           if(item_length > 1) {
//             intervals.push($interval(function() { createDiv(item_length - 1); }, 0, 1));
//           }
//           angular.element('#item_'+item_list[item_length-1].idx).css('display', 'none');
//           angular.element('#img_'+item_list[item_length-1].idx).css('display', 'none');
//           angular.element('#item_status_'+item_list[item_length-1].idx).css('display', 'none');
//           angular.element('#img_status_'+item_list[item_length-1].idx).css('display', 'none');
//           count = parseInt(player.getCurrentTime() + 0.8) * 30;
//           count = dataObjects.filter(function(d) { return (d.fk_item_idx == item_list[item_length-1].idx && d.position == count)});
// //          count = dataObjects.indexOf(count);
// //          var item = dataObjects[count];
//
//           if(count.length > 0){
//               for(var i in count){
//                   var current_position = parseInt(player.getCurrentTime() + 0.8) * 30;
//                   if(count[i] != undefined) {
//                       if(item_list[item_length-1].using == 1 && item_list[item_length-1].item_shape_type == 0){
//                           angular.element('#img_'+item_list[item_length-1].idx).css('display', 'none');
//                           angular.element('#img_status_'+item_list[item_length-1].idx).css('display', 'none');
//                           var left = Math.floor(count[i].x / (1920 / player.f.offsetWidth));
//                           var top = Math.floor(count[i].y / (1080 / player.f.offsetHeight));
//                           var width = Math.floor(count[i].width / (1920 / player.f.offsetWidth)) - left;
//                           var height = Math.floor(count[i].height / (1080 / player.f.offsetHeight)) - top;
//                           var drawtype = "item_";
//                           var p_order = count[i].position_order;
//                           var total_position = count[i].total_position;
// //                          item_detection = document.getElementById('item_video_rect');
// //                          scope.item_detection_jq = $('#item_video_rect');
// //
// //                          if(count[count.length-1].position_order == 1){
// //                              if(count[i].position != current_position){
// //                                  if(item_detection.hasChildNodes())
// //                                      scope.item_detection_jq.children().remove();
// //                              }else{
// //                                  if(item_detection.hasChildNodes())
// //                                      scope.item_detection_jq.children().remove();
// //                              }
// //                          }
//                           drawRect(left, top, width, height, item_length, drawtype, current_position, count, total_position, p_order, count[i]);
//                       }else if(item_list[item_length-1].using == 1 && item_list[item_length-1].item_shape_type == 1){
//                           angular.element('#item_'+item_list[item_length-1].idx).css('display', 'none');
//                           angular.element('#item_status_'+item_list[item_length-1].idx).css('display', 'none');
//                           var left = Math.floor(count[i].x / (1920 / player.f.offsetWidth));
//                           var top = Math.floor(count[i].y / (1080 / player.f.offsetHeight));
//                           var width = Math.floor(count[i].width / (1920 / player.f.offsetWidth)) - left;
//                           var height = Math.floor(count[i].height / (1080 / player.f.offsetHeight)) - top;
//                           var drawtype = "img_";
//                           var p_order = count[i].position_order;
//                           var total_position = count[i].total_position;
// //                          item_detection = document.getElementById('item_video_rect');
// //                          scope.item_detection_jq = $('#item_video_rect');
// //
// //                          if(count[i].position != current_position){
// //                              if(item_detection.hasChildNodes())
// //                                  scope.item_detection_jq.children().remove();
// //                          }
//                           drawRect(left, top, width, height, item_length, drawtype, current_position, count, total_position, p_order, count[i]);
//                       }
//                   }
//               }
//           }
// //          else{
// //              item_detection = document.getElementById('item_video_rect');
// //              scope.item_detection_jq = $('#item_video_rect');
// //              if(item_detection.hasChildNodes())
// //                  scope.item_detection_jq.children().remove();
// //          }
//       }

//       function drawRect(left, top, width, height, item_length, drawtype, current_position, count, total_position, p_order, count_detail) {
//           $rootScope.total_position = total_position;
//           $rootScope.position = current_position;
//           $rootScope.count = count;
//           $rootScope.item_idx = item_list[item_length - 1].idx;
//           var video_left = left; // 그려진 rect에 왼쪽
//           var video_top = top; // 그려진 rect에 위쪽
//           var Rect_Status = document.getElementById(drawtype+"status_"+item_list[item_length-1].idx); // 필요 없음
//
//           var vtop = parseInt(video_top - (250 - height) / 2);
//           var vleft = video_left + width + 4;
//           var wleft = parseInt(video_left - (260 + 10));
//           var name_top = video_top;
//           var name_left = video_left;
//           var name_wleft = parseInt(video_left - (200 + 10));
//           if (name_left >= 600) { // rect 왼쪽 값이 600보다 크거나 같으면
//               if (name_wleft < 0) {
//                   $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("top", parseInt(video_top - (250 - height) / 2));
//                   $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("left", parseInt(video_left - (200 - width) / 2));
//               } else {
//                   angular.element("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("left", name_wleft);
//                   if (0 > name_top) {
//                       $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("top", 0);
//                   } else {
//                       $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("top", name_top);
//                   }
//               }
//           } else {
//               angular.element("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("left", name_left);
//               if (0 > name_top) {
//                   $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("top", 0);
//               } else {
//                   $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css("top", name_top);
//               }
//           }
//
//           if (vleft >= 600) { // rect 왼쪽 값이 600보다 크거나 같으면
//               if (wleft < 0) {
//                   $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("bottom", parseInt(video_top - (250 - height) / 2));
//                   $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("left", parseInt(video_left - (260 - width) / 2));
//               } else {
//                   $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("left", wleft);
//                   if (0 > vtop) {
//                       $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("top", 0);
//                   } else {
//                       $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("top", vtop);
//                   }
//               }
//           } else {
//               angular.element("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("left", vleft);
//               if (0 > vtop) {
//                   $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("top", 0);
//               } else {
//                   $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css("top", vtop);
//               }
//           }
//
//           angular.element('#' + drawtype + item_list[item_length - 1].idx).css('display', 'inline-block');
//           if(scope.modifyposition != undefined){
//               $('#' + drawtype + item_list[item_length - 1].idx).css('left', parseInt(left) + parseInt(scope.modifyposition));
//           }else{
//               $('#' + drawtype + item_list[item_length - 1].idx).css('left', left);
//           }
//           $('#' + drawtype + item_list[item_length - 1].idx).css('top', top);
//           $('#item_' + item_list[item_length - 1].idx).css('width', width);
//           $('#item_' + item_list[item_length - 1].idx).css('height', height);
//           $('#' + drawtype + item_list[item_length - 1].idx).css('position', 'absolute');
//           $('#item_' + item_list[item_length - 1].idx).css('border', '1px solid #fff');
//           $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css('display', 'inline-block');
//           $("#"+drawtype + "status_" + item_list[item_length - 1].idx).css('position', 'absolute');
//           $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css('display', 'inline-block');
//           $("#item_simple_show_wrap_" + item_list[item_length - 1].idx).css('position', 'absolute');
// //          var count_detection = count_detail
// //          count_detection = document.createElement('div');
// //          count_detection.id = 'item_video_rect_' + count_detail.position_order;
// //          count_detection.setAttribute("ng-click","openItem("+item_list[item_length - 1].idx+")");
// //          count_detection.style.cssText = 'display: flex; position: absolute; border: 1px solid white; cursor: pointer;';
// //          item_detection.appendChild(count_detection);
// //
// //          count_detection.style.left = left + "px";
// //          count_detection.style.top = top + "px";
// //          count_detection.style.width = width + "px";
// //          count_detection.style.height = height + "px";
// //
// //          count_detection.classList = [count_detail.position_order];
//       }

      scope.$watch('videoid', function(newValue, oldValue) {
         if (newValue == oldValue) {
           return;
         }

        player.cueVideoById(scope.videoid);
      });

      scope.$watch('open', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        removeDiv();

      });

      scope.$watch('firsttime', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        player.seekTo(parseFloat(newValue), true);
      });

      scope.$watch('rightstatus', function(newValue, oldValue) {
        if(scope.rightstatus == 1){
            player.pauseVideo();
            return;
        }
        $('#item_update').on('click', function () {
            player.playVideo();
          });

        $('#rectChange').on('click', function () {
            player.playVideo();
          });
      });

      scope.$watch('statusi', function(newValue, oldValue) {
          if (newValue == 100) {
              var api_params = {};
              if(scope.videoidx) {
                  api_params['video_idx'] = scope.videoidx;
                  api_item_detail.get(api_params, function (data) {
                      $timeout(function () {
                          dataObjects = data.objects;
                      }, 500);
                  });
              }
          }
      });

      var make_params = {};
      var api_params = {};
      var item_detection;
      $rootScope.item_detections = '';
      $rootScope.item_rect = '';
      $rootScope.item_rect_detection = '';
      $rootScope.image_capture = [];
      $rootScope.image_capture_status = 404;
      scope.$watch('itemdetection', function(newValue, oldValue) {
        if(scope.videoidx) {
            if (newValue) {
                $rootScope.item_detect_status = 200;
                $rootScope.make_titan_status = 404;
                // angular.element('#video_canvas').css('display', 'flex');
                $("#AIList").css('display', 'none');
                $rootScope.item_rect_detection = '';
                $rootScope.meta_data_insert = true;
                $rootScope.loading_alert = true;
                $rootScope.loading_title = "로딩 중"
                if (player.getCurrentTime() == 0 || player.getDuration() == 0) return;
                make_params['video_current_time'] = player.getCurrentTime();
                make_params['video_duration_time'] = player.getDuration();
                make_params['model_title'] = scope.modeltitle;
                make_params['video_url'] = "https://www.youtube.com/watch?v=" + scope.videoid;
                api_make_titan_video.get(make_params, function (data) {
                    if(data.status == 200) {
                        $rootScope.item_detect_status = 200;
                        $rootScope.make_titan_status = 404;
                        if(data.objects != '' && data.objects != undefined) {
                            angular.element('#item_detection').css('display', 'flex');
                            // angular.element('#video_canvas').css('display', 'flex');
                            $("#AIList").css('display', 'none');
                            $rootScope.item_rect = data.objects.boxes;
                            $rootScope.make_titan_status = 200;
                            $rootScope.item_detect_status = 404;
                            $rootScope.loading_title = "완료";
                            $rootScope.loading_alert = false;
                            $rootScope.item_rect_detection = data.objects.boxes;
                            item_detection = document.getElementById('item_detection');
                            if($rootScope.item_rect_detection != ''){
                                $rootScope.meta_data_insert = true;
                                $rootScope.make_titan_status = 200;
                                $rootScope.item_detect_status = 404;
                                $rootScope.loading_title = "완료";
                                $rootScope.loading_alert = false;
                            }else{
                                $rootScope.loading_title = "실패";
                                $rootScope.loading_alert = false;
                                $rootScope.meta_data_insert = false;
                                $rootScope.make_titan_status = 200;
                                $rootScope.item_detect_status = 404;
                            }
                        }else{
                            $rootScope.item_rect_detection = '';
                            $rootScope.meta_data_insert = false;
                        }
                    }else{
                        $rootScope.loading_title = "모델 없음";
                        // $('#video_canvas').css('display', 'flex');
                        $('#video_canvas').css('background-color', 'unset');
                        $("#AIList").css('display', 'none');
                        $rootScope.item_detect_status = 404;
                        $rootScope.make_titan_status = 200;
                        $rootScope.item_rect_detection = '';
                    }
                });
            }
        }
      });
//      scope.$watch('height + width', function(newValue, oldValue) {
//        if (newValue == oldValue) {
//          return;
//        }
//
//        player.setSize(scope.width, scope.height);
//
//      });
    }
  };
})
.controller('PopupYoutubeCtrl', function ($scope, $rootScope, $window, Modal, $modalInstance, api_item_position_detail, AuthService, api_video_capture, item, video_status, api_item, $timeout, api_item_history, ENV) {
    $scope.title = item.video_title;
    $rootScope.item_list;
    $scope.rightStatus = 0;
    $scope.video_id = item.video_url.substr(32, 11);
    $scope.video_idx = item.idx;
    $scope.video_status = video_status;
    $scope.rect_status = item.video_auto_preview;
    $scope.videoCaptureStatus = true;
    $scope.item_click_img = 0;
    $scope.item_click_item = 0;
    $scope.update_position = true;
    $scope.current_position = 0;
    $scope.idx = 0;
    $scope.user_idx = AuthService.getIdx();

    var api_params = {};
    var history_param = {};
    $scope.$watch('position', function (newValue, oldValue) {
        $scope.show_position = $rootScope.position;
    });

    $(document).mousedown(function (e) {
        var container = $("#popup_new_election_common");
        if (!container.is(e.target) && container.has(e.target).length === 0){
            $scope.open = false;
            clearInterval($rootScope.myTimer);
            $modalInstance.dismiss('cancel');
        }
    });

    $scope.img_num = 0;
    $scope.show_item_idx = 0;
    $scope.image_num_array = [];
    $scope.last_time = 0;
    $scope.previousTime = 0;
    $scope.imageHover = false;
    $scope.user_idx = AuthService.getIdx();

    api_params['video_idx'] = $scope.video_idx;
    api_params['video_url'] = item.video_url;
    api_params['detail_exists'] = 'exists';
    if($scope.video_status == 1) {
        api_params['item_idx'] = item.item_idx;
        api_item.get(api_params, function (data) {
            $rootScope.item_list = data.objects;
        });
    }else{
        api_item.get(api_params, function (data) {
            $rootScope.item_list = data.objects;
        });
    }

    // $scope.openItem = function(item_idx) {
    //     $scope.openTime = true;
    //     if($scope.item_click == 1 && $scope.idx == item_idx) {
    //         $scope.item_click = 0;
    //         return;
    //     }
    //     $scope.idx = item_idx;
    //
    //     $scope.item_title = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_title;
    //     $scope.item_description = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description;
    //     $scope.item_price = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_price.toLocaleString();
    //     $scope.item_redirect_url = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_redirect_url;
    //     $scope.item_description_url = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description_url;
    //     $scope.item_description_toggle = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_description_toggle;
    //     $scope.item_img_path = $rootScope.item_list.filter(function(d) { return d.idx == item_idx })[0].item_img_path;
    //     $scope.item_click = 1;
    //     $scope.idx = item_idx;
    //
    //     history_param = {};
    //     history_param['fk_user_idx'] = parseInt($scope.user_idx);
    //     history_param['fk_item_idx'] = $scope.idx;
    //     history_param['action_status'] = 0;
    //     api_item_history.save(history_param, function (data) {});
    //
    //     $timeout(function () {
	//         $scope.openTime = false;
    //     }, 5000, true );
    // }

    $scope.buyItem = function() {
        history_param = {};
        history_param['fk_user_idx'] = parseInt($scope.user_idx);
        history_param['fk_item_idx'] = $scope.idx;
        history_param['action_status'] = 1;
        api_item_history.save(history_param, function (data) {});
        $window.open($scope.item_redirect_url, '_blank');
    }

    $scope.descripItem = function(){
        var history_param = {};
        // history_param['fk_user_idx'] = parseInt($scope.user_idx);
        // history_param['fk_item_idx'] = $scope.idx;
        // history_param['action_status'] = 0;
        // api_item_history.save(history_param, function (data) {});
        $window.open($scope.item_description_url, '_blank');
    }

    $scope.open = true;

    $window.addEventListener('keydown', function (e) {
        var key = e.which || e.keyCode;
        if (key === 27) {
            $scope.open = false;
        }
    });

    $scope.close = function () {
        $scope.open = false;
        clearInterval($rootScope.myTimer);
        $modalInstance.dismiss('cancel');
    };
});