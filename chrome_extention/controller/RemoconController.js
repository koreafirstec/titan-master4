function RemoconOn() {
    function makeRemoconElement() {
        var titan_remocon = createElement('div', {
            'id': 'titan_remocon',
            'class': ['titan_remocon_' + titan_remocon_type],
        });
        switch(titan_remocon_type) {
            case 'over':
                parentVideo.insertBefore(titan_remocon, video);
                break;
            case 'right':
                var size_drag_div = createElement('div', {
                    'id': 'size_drag_div'
                });
                document.body.appendChild(size_drag_div);
                document.body.appendChild(titan_remocon);
    
                try {
                    var youtube_nav_height = $('container').offsetHeight + 'px';
                    titan_remocon.style.top = youtube_nav_height;
                    size_drag_div.style.top = youtube_nav_height;
                } catch {
                }
    
                size_drag_div.style.right = titan_remocon.offsetWidth + 'px';
                
                var is_resizing = false;
                var init_x = 0;
                var init_width;
                var new_width;
                
                size_drag_div.addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                    is_resizing = true;
                    init_x = e.clientX;
                    init_width = titan_remocon.offsetWidth;
                });
                document.addEventListener('mousemove', function (e) {
                    e.stopPropagation();
                    if (!is_resizing) return;
                    new_width = init_width + (init_x - e.clientX);
                    
                    if (new_width >= 200) {
                        titan_remocon.style.width = new_width + 'px';
                        size_drag_div.style.right = titan_remocon.style.width;
                    }
                });
                document.addEventListener('mouseup', function (e) {
                    is_resizing = false;
                });
    
                var remocon_power_off = createElement('div', {
                    'id': 'remocon_power_off'
                }, titan_remocon);
                remocon_power_off.addEventListener('click', function(e) {
                    e.stopPropagation();
                    $('titan_remocon').style.display = 'none';
                    if($('remocon_power_on')) {
                        $('remocon_power_on').style.display = 'block';
                    } else {
                        RemoconRightOn(false);
                    }
                });
    
                // titan_remocon.style.width = 0;
                // var size_interval = setInterval(function() {
                //     if(parseInt(titan_remocon.style.width) >= 300) {
                //         clearInterval(size_interval);
                //     }
                    
                //     titan_remocon.style.width = parseInt(titan_remocon.style.width) + 5 + 'px';
                // }, 1);
                
                var remocon_icon = createElement('img', {
                    'id': 'remocon_icon',
                    'src': ENV + 'images/arrow_right.png'
                }, remocon_power_off);
                break;
            case 'move':
                document.body.appendChild(titan_remocon);
    
                var remocon_title = createElement('div', {
                    'id': 'remocon_title',
                    'innerHTML': 'Titan'
                }, titan_remocon);
    
                var offset = [0,0];
                var is_down = false;
                var body_width;
                var new_left;
                var new_top;
    
                titan_remocon.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                    is_down = true;
                    body_width = document.body.offsetWidth;
                    offset = [
                        titan_remocon.offsetLeft - e.clientX,
                        titan_remocon.offsetTop - e.clientY
                    ];
                }, true);
                
                document.addEventListener('mouseup', function() {
                    is_down = false;
                }, true);
                
                document.addEventListener('mousemove', function(e) {
                    e.stopPropagation();
                    if (!is_down) return;
    
                    new_left = (e.clientX + offset[0]);
                    new_top = (e.clientY + offset[1]);
    
                    if (new_left >= 0 && titan_remocon.offsetWidth + e.clientX <= body_width) titan_remocon.style.left = new_left + 'px';
                    if (new_top >= 0) titan_remocon.style.top  = new_top + 'px';
                }, true);
                break;
        }
        titan_remocon.addEventListener('click', function(e) {
            e.stopPropagation();
        })
    
        var remocon_btn = createElement('div', {
            'id': 'remocon_btn'
        }, titan_remocon);
    
        var titan_btn = createElement('input', {
            'type': 'button',
            'id': 'titan_btn',
            'value': 'Titan 실행'
        }, remocon_btn);
        titan_btn.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'titan', titan_status: titan_status});
            titan_status = !titan_status;
        })
    
        var item_add_btn = createElement('input', {
            'type': 'button',
            'id': 'item_add_btn',
            'value': '상품 등록'
        }, remocon_btn);
        item_add_btn.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'item_add'});
        })
    
        var item_list_btn = createElement('input', {
            'type': 'button',
            'id': 'item_list_btn',
            'value': '상품 리스트'
        }, remocon_btn);
        item_list_btn.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'item_list', item_list_status: item_list_status});
            item_list_status = !item_list_status;
        })
    }
    
    if($('titan_remocon')) {
        return
    } else {
        makeRemoconElement();
    }
}

function RemoconOff(now_type=false) {
    if($('nav_icon')) $('nav_icon').remove();
    if($('remocon_power_on') && now_type != 'right') $('remocon_power_on').remove();
    if($('size_drag_div') && now_type != 'right') $('size_drag_div').remove();
    if($('titan_remocon')) {
        if(now_type) {
            if(!document.getElementsByClassName('titan_remocon_' + now_type)[0]) {
                $('titan_remocon').remove();
            }
        } else {
            $('titan_remocon').remove();
        }
    }
}

function RemoconRightOn(check=true) {
    if(check && ($(remocon_power_on) || $('titan_remocon'))) return;

    var remocon_power_on = createElement('div', {
        'id': 'remocon_power_on'
    }, document.body);
    remocon_power_on.addEventListener('click', function(e) {
        e.stopPropagation();
        RemoconOn();
        remocon_power_on.style.display = 'none';
        if($('titan_remocon')) $('titan_remocon').style.display = 'block';
    });

    var remocon_icon = createElement('img', {
        'id': 'remocon_icon',
        'src': ENV + 'images/arrow_left.png',
        'title': 'Titan'
    }, remocon_power_on);
}