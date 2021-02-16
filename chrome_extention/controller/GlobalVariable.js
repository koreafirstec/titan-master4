const ENV = 'http://118.37.64.217/';

var video;
var parentVideo;

function findVideo() {
    video = document.body.querySelector('video');
    parentVideo = video.parentNode;
}

function $(id) { return document.getElementById(id); }

function createElement(type, attributes, append_element = false) {
    var element = document.createElement(type);
    for (var key in attributes) {
        if (key == "class") {
            element.classList.add.apply(element.classList, attributes[key]);
        } else {
            element[key] = attributes[key];
        }

        if (type == "img") {
            element.onerror = function(){
                element.src = ENV + 'images/common/noimg.png';
            };
        }
    }

    if(append_element) append_element.appendChild(element);
    return element;
}

var item_list;
var detail_list;
var item_idx;
var titan_remocon_type;

// canvasOnOff
var intervals;

// itemAdd
var sizeChange;