// titan action message
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    switch(req.action) {
        case 'titan_on':
            findVideo();
            // if(item_list !== req.item_list) {
                titanOff();
            // }
            item_list = req.item_list;
            
            detail_list = req.detail_list;
            item_idx = req.item_idx;
        
            titan_status = req.titan_status;
            titan_add_status = req.titan_add_status;
            item_list_status = req.item_list_status;
            
            itemAddCancel();
            titanOn();
            break;
        case 'titan_off':
            titanOff();
            break;
    }
});

// remocon action message
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    switch(req.action) {
        case 'remocon_on':
            findVideo();
            
            titan_remocon_type = req.titan_remocon_type;
            // console.log('titan_remocon_type', titan_remocon_type);
            
            RemoconOff(titan_remocon_type);

            switch(titan_remocon_type) {
                case 'over':
                    if($('nav_icon')) break;
                    
                    var nav_icon = createElement("img", {
                        'id': 'nav_icon',
                        'src': ENV + 'images/arrow_right.png'
                    });
                    if($("titan_remocon")) nav_icon.src = ENV + 'images/arrow_left.png';
                    parentVideo.insertBefore(nav_icon, video);

                    nav_icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                
                        if(!$("titan_remocon")) {
                            nav_icon.src = ENV + 'images/arrow_left.png';
                            RemoconOn();
                        } else {
                            nav_icon.src = ENV + 'images/arrow_right.png';
                            $('titan_remocon').remove();
                        }
                    })
                    break;
                case 'right':
                    RemoconRightOn();
                    break;
                case 'move':
                    RemoconOn();
                    break;
            }
            break;
        case 'remocon_off':
            RemoconOff();
            break;
    }
});

// item add action message
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    switch(req.action) {
        case 'item_add':
            titanOff();
            itemAdd();
            break;
        case 'item_add_cancel':
            itemAddCancel();
            break;
    }
});

// show item list action message
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    switch(req.action) {
        case 'show_item':
            showItem();
            break;
        case 'show_item_cancel':
            showItemCancel();
            break;
    }
});