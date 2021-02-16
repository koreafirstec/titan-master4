function showItem() {
    console.log('item_list:', item_list);
    console.log(titan_remocon_type);
    if($('item_list_div')) return;
    
    if(titan_remocon_type === 'move') {
        var item_list_area = createElement('div', {
            'id': 'item_list_area'
        });
        document.body.appendChild(item_list_area);
        item_list_area.addEventListener('click', function(e) {
            e.stopPropagation();
        })

        var item_list_div = createElement('div', {
            'id': 'item_list_div'
        }, item_list_area);

        var item_list_title_area = createElement('div', {
            'id': 'item_list_title_area'
        }, item_list_div);

        var item_list_title = createElement('div', {
            'id': 'item_list_title',
            'innerHTML': '상품 리스트'
        }, item_list_title_area);

        var item_close_btn = createElement('button', {
            'id': 'item_close_btn',
            'innerHTML': 'X'
        }, item_list_title_area);
        item_close_btn.addEventListener('click', function(e) {
            showItemCancel();
        })
    } else {
        var item_list_div = createElement('div', {
            'id': 'item_list_div'
        }, $('titan_remocon'));
    }

    if(!item_list) {
        var no_item_message = createElement('div', {
            'id': 'no_item_message',
            'innerHTML': '아이템이 존재하지 않습니다.'
        }, item_list_div);
    } else {
        var items_area = createElement('div', {
            'id': 'items_area'
        }, item_list_div);
        for(var i = 0; i < item_list.length; i++) {
            var item_area = createElement('div', {
                'id': 'item_area'
            }, items_area);

            var item_img = createElement('img', {
                'id': 'item_img',
                'src': ENV + `${item_list[i].item_img_path}`,
                'title': '구매 페이지로 이동합니다.'
            }, item_area);
            item_img.addEventListener('click', function(e) {
                window.open(item_list[i].item_redirect_url, '_blank');
            })

            var item_title = createElement('div', {
                'id': 'item_title',
                'innerHTML': item_list[i].item_title
            }, item_area);
            item_title.addEventListener('click', function(e) {
                window.open(item_list[i].item_redirect_url, '_blank');
            })

            var item_price = createElement('div', {
                'id': 'item_price',
                'innerHTML': item_list[i].item_price.toLocaleString() + "원"
            }, item_area);
        }
    }

}

function showItemCancel() {
    if($('item_list_area')) $('item_list_area').remove();
    if($('item_list_div')) $('item_list_div').remove();
}