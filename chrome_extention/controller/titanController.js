function titanStart() {
    var element_list = document.createDocumentFragment();
    var titan_message = createElement('div', {
        'id': 'titan_message',
        'innerHTML': 'TITAN 실행 중'
    }, element_list);

    function makeTitanElement() {
        for(let i=1; i<=item_list.length; i++) {
            var item_info = item_list[i-1];

            var item_rect = createElement('div', {
                'id': 'item_' + i,
                'class': ['item_rect']
            }, element_list);

            var item_status = createElement('div', {
                'id': 'item_status_' + i,
                'class': ['item_status']
            }, element_list);

            createElement('p', {
                'innerHTML': item_info.item_title,
                'class': ['item_title']
            }, item_status);

            var item_status_img_area = createElement('div', {
                'class': ['item_status_img_area']  
            }, item_status);

            createElement('img', {
                'src': ENV + `images/uploads/${item_idx}_product.jpg`,
                'class': ['item_status_img']  
            }, item_status_img_area);

            var item_status_text_area = createElement('div', {
                'class': ['item_status_text_area']
            }, item_status);

            createElement('p', {
                'innerHTML': item_info.item_description,
                'class': ['item_status_text']  
            }, item_status_text_area);

            item_rect.addEventListener('click', function(e) {
                e.stopPropagation();
                // chrome.runtime.sendMessage({action: 'item_click'});
                video.pause();
                
                if(!$('item_detail')) {
                    var item_detail = createElement('div', {
                        'id': 'item_detail',
                        'class': ['item_detail'],
                    });
                    var parenTitan_rect = item_rect.parentNode;
                    parenTitan_rect.insertBefore(item_detail, item_rect);

                    item_detail.addEventListener('click', function(e) {
                        e.stopPropagation();
                    })

                    var simple_item_image = createElement('div', {
                        'id': 'simple_item_image'
                    }, item_detail);

                    createElement('img', {
                        'id': 'item_img',
                        'src': ENV + `images/uploads/${item_idx}_product.jpg`
                    }, simple_item_image);

                    var simple_item_info = createElement('div', {
                        'id': 'simple_item_info'
                    }, item_detail);

                    createElement('p', {
                        'id': 'item_title',
                        'innerHTML': item_info.item_title   
                    }, simple_item_info);

                    createElement('p', {
                        'id': 'item_description',
                        'innerHTML': item_info.item_description
                    }, simple_item_info);

                    // createElement('p', {
                    //     'innerHTML': '가격 : ' + item_info.item_price.toLocaleString() + '원'
                    // }, simple_item_info);

                    var item_input_div = createElement('div', {
                        'id': 'item_input_div',
                        'class': ['item_input_div']
                    }, simple_item_info);

                    var buyItem = createElement('input', {
                        'type': 'button',
                        'value': '구매'
                    }, item_input_div);
                    buyItem.addEventListener('click', function() {
                        window.open(item_info.item_redirect_url, '_blank');
                        chrome.runtime.sendMessage({action: 'buy_item'});
                    });

                    var cancel = createElement('input', {
                        'type': 'button',
                        'value': '취소'
                    }, item_input_div);
                    cancel.addEventListener('click', function() {
                        item_detail.remove();
                        // video.play();
                    });
                } else {
                    $('item_detail').remove();
                }
            });
        }
    }

    if(item_list === false) {
        titan_message.innerHTML = "등록된 상품이 없습니다.";
    } else {
        makeTitanElement();
    }

    function drawStart(item_length) {
        if(item_length > 1) {
            drawStart(item_length - 1);
        }

        var item_rect = $('item_' + item_length);
        var item_status = $('item_status_' + item_length);

        if(item_rect) {
            item_rect.style.display = "none";
            item_status.style.display = "none";

            count = parseInt(video.currentTime + 0.8) * 30;

            count = detail_list.filter(function(d) { return (d.fk_item_idx == item_list[item_length-1].idx && d.position == count) })[0];
            count = detail_list.indexOf(count);
            var item = detail_list[count];
            if (item != undefined) {
                var left = Math.floor(item.x / (1920 / parseInt(video.style.width)));
                var top = Math.floor(item.y / (1080 / parseInt(video.style.height)));
                var width = Math.floor(item.width / (1920 / parseInt(video.style.width))) - left;
                var height = Math.floor(item.height / (1080 / parseInt(video.style.height))) - top;

                drawRect(left, top, width, height, item_rect);
                moveStatus(left, top, width, height, item_status);
            }
        }
    }

    function drawRect(left, top, width, height, item_rect) {
        item_rect.style.left = left + "px";
        item_rect.style.top = top + "px";
        item_rect.style.width = width + "px";
        item_rect.style.height = height + "px";
        item_rect.style.display = "inline-block";
    }

    function moveStatus(left, top, width, height, item_status) {
        var vtop = parseInt(top - (250 - height) / 2);
        var vleft = left + width + 4;
        var wleft = parseInt(left - (200 + 10));

        if (vleft >= 600) {
            if (wleft < 0) {
                item_status.style.left = parseInt(left - (200 - width) / 2) + "px";
                item_status.style.top = parseInt(top - (250 - height) / 2) + "px";
            } else {
                item_status.style.left = wleft + "px";
                if (0 > vtop) {
                    item_status.style.top = 0 + "px";
                } else {
                    item_status.style.top = vtop + "px";
                }
            }
        } else {
            item_status.style.left = vleft + "px";
            if (0 > vtop) {
                item_status.style.top = 0 + "px";
            } else {
                item_status.style.top = vtop + "px";
            }
        }

        item_status.style.display = "inline-block";
    }
    
    parentVideo.insertBefore(element_list, video);
    var message_count = 0;
    var message_time = setInterval(function() {
        message_count++;
        if (message_count >= 5)
        {
            if($('titan_message')) $('titan_message').remove();
            clearInterval(message_time);
        }
    }, 1000);

    intervals = setInterval(function() { drawStart(item_list.length); }, 0);
}

function titanOn() {
    // 광고
    var advertising = setInterval(function() {
        if(!document.querySelectorAll('[id^=simple-ad-badge]')[0]) {
            titanStart();
            clearInterval(advertising);
        }
    }, 1000)
}

function titanOff() {
    if(intervals) clearInterval(intervals);
    if($('titan_message')) $('titan_message').remove();
    
    var rm_item_rect = document.getElementsByClassName('item_rect');
    while(rm_item_rect.length > 0)
        rm_item_rect[0].remove();

    var rm_item_status = document.getElementsByClassName('item_status');
    
    while(rm_item_status.length > 0)
        rm_item_status[0].remove();

    if($('item_detail')) $('item_detail').remove();
}