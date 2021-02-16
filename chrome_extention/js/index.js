'use strict';

angular.module('titanApp', ['api'])
.controller('YoutubeCtrl',['$scope', 'api_item_detail', 'api_video', 'api_item', 'api_make_titan_video', function YoutubeCtrl($scope, api_item_detail, api_video, api_item, api_make_titan_video){
  const ENV = 'http://118.37.64.217/';

  $scope.titan_status = true;
  chrome.browserAction.setBadgeText({text: '0'});
  chrome.storage.sync.set({"titan_status": $scope.titan_status});

  $scope.titan_add_status = false;
  chrome.storage.sync.set({"titan_add_status": $scope.titan_add_status});

  $scope.item_list_status = false;
  chrome.storage.sync.set({"item_list_status": $scope.item_list_status});

  $scope.titan_remocon_status = false;
  chrome.storage.sync.set({"titan_remocon_status": $scope.titan_remocon_status});

  $scope.titan_remocon_type = "over";
  chrome.storage.sync.set({"titan_remocon_type": $scope.titan_remocon_type});

  // default_icon color change
  function changeLogo() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if(tabs[0].url.match(/^.+(?<=v=).+/)) {
        chrome.browserAction.setIcon({path:"images/logo_color.png"});
      } else {
        chrome.browserAction.setIcon({path:"images/logo_black.png"});
      }
    });
  }

  function titan() {
    if($scope.titan_status) {
      try {
        chrome.browserAction.setBadgeText({text: $scope.item_count.toString()});
      } catch(e) {

      }
      
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'titan_on',
        item_list: $scope.item_list,
        detail_list: $scope.detail_list,
        item_idx: $scope.item_idx,
        titan_status: $scope.titan_status,
        titan_add_status: $scope.titan_add_status,
        item_list_status: $scope.item_list_status
      });
    } else {
      chrome.browserAction.setBadgeText({text: ''});

      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'titan_off'
      });
    }
    remocon();
  }

  function remocon() {
    if($scope.titan_remocon_status) {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'remocon_on',
        titan_remocon_type: $scope.titan_remocon_type
      });
    } else {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'remocon_off'
      });
    }
  }

  function itemAdd() {
    if($scope.titan_add_status) {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'item_add'
      });
    } else {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'item_add_cancel'
      });
    }
  }

  function showItem() {
    if($scope.item_list_status) {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'show_item'
      });
    } else {
      chrome.tabs.sendMessage($scope.tab_id, {
        action: 'show_item_cancel'
      });
    }
  }
  
  function getData(tabId) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs){
      $scope.tab_id = tabId;
      $scope.video_url = tabs[0].url;
      $scope.video_id = $scope.video_url.match(/(?<=v=).{11}/);

      if(!$scope.video_id || $scope.video_url == "") {
        if($scope.titan_status) {
          chrome.browserAction.setBadgeText({text: "0"});
        }
        return;
      }

      $scope.item_list = false;
      $scope.video_id = $scope.video_id[0];
      
      var video_params = {};
      var item_params = {};
      video_params['video_id'] = $scope.video_id;

      try {
        api_video.get(video_params, function (data) {
          if(data.status == 200) {
            $scope.video_idx = data.objects[0].video_idx;
            
            item_params['video_idx'] = $scope.video_idx;

            api_item.get(item_params, function (data) {
              if(data.objects.length > 0) {
                $scope.item_list = data.objects;
                $scope.item_idx = data.objects[0].idx;
                $scope.item_count = data.objects.length;
                
                api_item_detail.get(item_params, function (data) {
                  $scope.detail_list = data.objects;
                  titan();
                });
              } else {
                $scope.item_list = false;
                $scope.item_idx = false;
                $scope.item_count = 0;
                titan();
              }
            });

          // 비디오가 존재하지 않을 경우
          } else {
            $scope.item_count = 0;
            titan();
          }
        });
      }  catch(e) {
        // server error
        console.log(e);
      };
    });
  }

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    changeLogo();
    // console.log('onActivated', activeInfo.tabId);
    getData(activeInfo.tabId);
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
      // console.log('onUpdated', tab);
      
      chrome.tabs.get(tabId, function(tabs) {
        if($scope.video_url != tabs.url && tabs.url == tab.url) {
          // console.log('new page', tab.url, tabs.url);
          changeLogo();
          getData(tabId);
        } else if(tabs.url == tab.url) {
          // console.log('old page', tab.url, tabs.url);
          titan();
        }

      });
    }
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    // console.log('onFocusChanged:', windowId);
    if(windowId !== -1 && $scope.window_id !== windowId) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs){
        $scope.window_id = windowId;
        changeLogo();
        getData(tabs[0].id);
      });
    }
  });

  chrome.storage.onChanged.addListener(function (changes) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs){
      $scope.tab_id = tabs[0].id;
      // console.log('changes:', changes);
      if(changes.titan_status) {
        $scope.titan_status = changes.titan_status.newValue;
        titan();
      } else if(changes.titan_add_status) {
        $scope.titan_add_status = changes.titan_add_status.newValue;
        itemAdd();
      } else if(changes.item_list_status) {
        $scope.item_list_status = changes.item_list_status.newValue;
        showItem();
      } else if(changes.titan_remocon_status) {
        $scope.titan_remocon_status = changes.titan_remocon_status.newValue;
        remocon();
      } else if(changes.titan_remocon_type) {
        $scope.titan_remocon_type = changes.titan_remocon_type.newValue;
        remocon();
      }
    });
  });

  // var already_clicked = false;
  var click_timer;
  chrome.browserAction.onClicked.addListener(function(tabs){
    // on youtube
    if(tabs.url.match(/^http(?:s?):\/\/(?:www\.)?youtube.*/)) {
      // youtube id check
      if(!tabs.url.match(/^.+(?<=v=).+/)) {

      } else {
        // if(already_clicked){
        //     console.log("Double click");
        //     window.clearTimeout(click_timer);
        //     already_clicked = false;
        //     chrome.browserAction.setPopup({tabId: tabs.id, popup:""});
        //     return;
        // }

        // already_clicked = true;
        chrome.browserAction.setPopup({tabId: tabs.id, popup:"setting.html"});

        click_timer = window.setTimeout(function(){
            // console.log("click");
            
            chrome.storage.sync.get('titan_status', function(item) {
              chrome.storage.sync.set({"titan_status": !item.titan_status});
            });

            window.clearTimeout(click_timer);
            // already_clicked = false;
            chrome.browserAction.setPopup({tabId: tabs.id, popup:""});
        }, 300);
      }
    } else {
      chrome.browserAction.setPopup({tabId: tabs.id, popup:"no_video.html"});
    }
  });

  chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    switch(req.action) {
      case 'titan':
        chrome.storage.sync.set({"titan_status": !req.titan_status});
        break;
      case 'item_add':
        chrome.storage.sync.get('titan_add_status', function(item) {
          chrome.storage.sync.set({"titan_add_status": !item.titan_add_status});
          chrome.storage.sync.set({"titan_status": item.titan_add_status});
        });
        break;
      case 'item_list':
        chrome.storage.sync.set({"item_list_status": !req.item_list_status});
        break;
      case 'detection':
        $scope.item_rect = '';
        var make_titan_params = {};
        
        make_titan_params['video_url'] = sender.url;
        make_titan_params['video_current_time'] = req.video_current_time;
        make_titan_params['video_duration_time'] = req.video_duration_time;

        api_make_titan_video.get(make_titan_params, function(data) {
          $scope.item_rect = data.objects;
          chrome.tabs.query({active:true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: req.action,
              item_rect: $scope.item_rect
            });
          });
        });
        break;
      case 'add':
        chrome.tabs.create({
          url: chrome.extension.getURL('popup_item_add.html') + `?video_idx=${$scope.video_idx}&shape_type=${req.shape_type}`,
          active: false
        }, function(tab) {
          chrome.windows.create({
            tabId: tab.id,
            type: 'popup',
            focused: true
          });
        });
        break;
      case 'item_click':
        console.log('item_click');
        break;
      case 'buy_item':
        console.log('buy_item');
        break;
    }
  });

  chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install") {
      window.open(ENV + '#/login', '_blank');
    } else if (details.reason == "update") {

    }
  });

  // chrome.runtime.setUninstallURL(linkuninstall);

  // chrome.fileSystem.chooseEntry(
  //   {/* options */},
  //   function(entry) {
  //     if(chrome.runtime.lastError) {
  //       // Something went wrong
  //       console.warn("Whoops.. " + chrome.runtime.lastError.message);
  //       // Maybe explain that to the user too?
  //     } else {
  //       // No errors, you can use entry
  //     }
  //   }
  // );
}]);