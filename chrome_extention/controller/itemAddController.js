function itemAdd() {
    if($('item_detection')) return;

    var item_detection_btn = createElement("input", {
        'id': 'item_detection',
        'type': 'button',
        'value': '상품 찾기'
    });
    parentVideo.insertBefore(item_detection_btn, video);

    item_detection_btn.addEventListener('click', function(e) {
        e.stopPropagation();

        video.pause();
        var loading_div = createElement("div", {
            'id': 'loading'
        });
        parentVideo.insertBefore(loading_div, video);

        item_detection_btn.style.display = "none";
        item_detection_cancel_btn.style.display = "block";

        chrome.runtime.sendMessage({action: "detection", video_current_time: video.currentTime, video_duration_time: video.duration});

        chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
            if(req.action == 'detection') {
                loading_div.remove();
                if(req.item_rect) {
                    var item_rect = req.item_rect;
                    console.log(item_rect);
                    var item_detection_div = document.createElement('div', {
                        'id': 'item_detection_div'
                    });
                    item_detection_div.style.cssText = 'border: 1px solid white; position: absolute; z-index: 100; background-color: rgba(0, 0, 0, 0.3); cursor: pointer;';
                    parentVideo.insertBefore(item_detection_div, video);
                    
                    var left = Math.floor(item_rect[0].left / (1920 / parseInt(video.style.width)));
                    var top = Math.floor(item_rect[0].top / (1080 / parseInt(video.style.height)));
                    var width = Math.floor(item_rect[0].width / (1920 / parseInt(video.style.width))) - left;
                    var height = Math.floor(item_rect[0].height / (1080 / parseInt(video.style.height))) - top;

                    item_detection_div.style.left = left + "px";
                    item_detection_div.style.top = top + "px";
                    item_detection_div.style.width = width + "px";
                    item_detection_div.style.height = height + "px";

                    item_detection_div.addEventListener('mouseenter', function() {
                        item_detection_div.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                    })

                    item_detection_div.addEventListener('mouseleave', function() {
                        item_detection_div.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    })
                    
                    item_detection_div.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        chrome.runtime.sendMessage({action: "add", shape_type: item_rect[0].shape});
                    })
                } else {
                    // TODO: 아이템이 존재하지 않을 시 이벤트
                }
            }
        });
    });

    var item_detection_cancel_btn = createElement("input", {
        'id': 'item_detection_cancel_btn',
        'type': 'button',
        'value': '취소'
    });
    item_detection_cancel_btn.style.display = "none";
    parentVideo.insertBefore(item_detection_cancel_btn, video);

    item_detection_cancel_btn.addEventListener('click', function(e) {
        e.stopPropagation();

        item_detection_btn.style.display = "block";
        item_detection_cancel_btn.style.display = "none";
        if($('item_detection_div')) $('item_detection_div').remove();
    });
}

function itemAddCancel() {
    if($('item_detection')) $('item_detection').remove();

    if($('item_detection_cancel_btn')) $('item_detection_cancel_btn').remove();

    if($('item_detection_div')) $('item_detection_div').remove();
}
