'use strict';

angular.module('titanApp')
.controller('ModelMakeCtrl', function ($scope, $route, $modalInstance, $location, $http, $window, AuthService, $upload, $interval, $timeout, Modal, ENV, api_titan_model, api_item, update_model_idx, update_item_idx, api_build_item, api_crawling_image, api_build_process, api_crawling_process) {
        $scope.user_idx = AuthService.getIdx();
        const generated_path = '../images/builder_generated/';
        const crawling_path = '../images/crawling/';
        $scope.upload_path = '../images/builder_uploads/';
        $scope.update_item_idx = update_item_idx;
        $scope.model_title = '';
        $scope.now_image = "";
        var playing = false;

        $scope.all_images = [];
        $scope.classes = {};
        $scope.annotations = {};

//---------------------------------------------------------------------------------------------------
// 더미 모델 생성
        var model_dummy_data = {
            'model_title': 'dummy',
            'model_description': 'dummy',
            'model_epochs': 0,
            'model_access': '0'
        };

        function makeEmptyModel() {
            var api_model_params = {};
            api_model_params['user_idx'] = $scope.user_idx;
            api_model_params['model_title'] = model_dummy_data.model_title;
            api_model_params['model_description'] = model_dummy_data.model_description;
            api_model_params['model_epochs'] = model_dummy_data.model_epochs;
            api_model_params['model_access'] = model_dummy_data.model_access;

            api_titan_model.save(api_model_params, function(data){
                $scope.model_idx = data.objects[0].model_idx;

                $scope.model_generated_path = generated_path + $scope.model_idx + '/all_images/';
                $scope.model_crawling_path = crawling_path + $scope.model_idx + '/';

                getItemList();
            });
        }


        $scope.uploadedImage = [];
        function getItemList() {
            let api_params = {};
            api_params['item_idx'] = update_item_idx;
            api_params['model_idx'] = $scope.model_idx;
            api_build_item.get(api_params, function (data) {
                if (data.status === 200) {
                    var item = data.objects;
                    for(var i in item) {
                        $scope.uploadedImage.push($scope.upload_path + item[i].filename)
                    }
                }
            });
        }

        // 모델 업데이트
        if (update_model_idx) {
            $scope.model_idx = update_model_idx;
            var api_params = {};
            api_params['model_idx'] = $scope.model_idx;

            api_titan_model.get(api_params, function (data) {
                if (data.status === 200) {
                    let model_info = data.objects[0].model_info;
                    $scope.model_upload_path = $scope.upload_path + $scope.model_idx + '/';
                    $scope.model_generated_path = generated_path + $scope.model_idx + '/all_images/';
                    $scope.model_crawling_path = crawling_path + $scope.model_idx + '/';
                    $scope.model_title = model_info.model_title;

                    $scope.annotations = data.objects[0].anno_list;
                    $scope.classes = data.objects[0].class_list;

                    data.objects[0].upload_image_list.filter(function (d) {
                        let get_image_path = $scope.model_upload_path + d;
                        $scope.uploadedImage.push(get_image_path);
                    });
                    data.objects[0].crawling_image_list.filter(function (d) {
                        let get_image_path = $scope.model_crawling_path + d;
                        $scope.all_images.push(get_image_path);
                        $scope.now_image = get_image_path;
                    });
                    data.objects[0].builder_image_list.filter(function (d) {
                        let get_image_path = $scope.model_generated_path + d;
                        $scope.all_images.push(get_image_path);
                        $scope.now_image = get_image_path;
                    });
                }
            });
        } else {
        // 모델 생성
            makeEmptyModel();
        }

//---------------------------------------------------------------------------------------------------
// 이미지 수집 (crawling_image)
        $scope.crawling_image = [];

         $scope.crawlingImage = function() {
             if(playing === true) return;
             playing = true;

            api_crawling_process.save(null, function (data) {
                if (data.status === 200) {
                    var process_idx = data.objects[0].process_idx;

                    var api_crawling_params = {};
                    api_crawling_params['model_idx'] = $scope.model_idx;
                    api_crawling_params['process_idx'] = process_idx;
                    api_crawling_params['update_item_idx'] = update_item_idx;

                    api_crawling_image.save(api_crawling_params, function (data) {
                    });


                    let last_cnt = 0;
                    var crawling_process = setInterval(function () {
                        var api_params = {};
                        api_params['process_idx'] = process_idx;

                        api_crawling_process.get(api_params, function (data) {
                            if (data.status === 200) {
                                let process = data.objects[0].process;
                                if(process === 0) {
                                    return;
                                }

                                let before_cnt = last_cnt;
                                last_cnt = process;
                                for (let i = before_cnt; i < process; i++) {
                                    $scope.all_images.push($scope.model_crawling_path + 'crawling_' + (i + 1) + '.jpg');
                                }

                                $scope.now_image = $scope.model_crawling_path + 'crawling_' + process + '.jpg';

                                var progress = document.getElementById('progress_bar');

                                $scope.progress_width = (process / data.objects[0].max_value) * 100;
                                progress.style.width = Math.floor($scope.progress_width) + '%';

                                $('#video_cap_img').scrollTop($('#video_cap_img')[0].scrollHeight);

                                if (process === data.objects[0].max_value) {
                                    playing = false;
                                    clearInterval(crawling_process);
                                }
                            }
                        });
                    }, 250)
                }
            });
         };

//---------------------------------------------------------------------------------------------------
// 데이터 생성 (build_image)
        $scope.cycle = 5000;
        $scope.itemName = "";
        $scope.type = "item";
        $scope.shapeType = 1;
        $scope.itemNumber = 0;

        $scope.show_builder = true;
        $scope.build_image = [];

        $scope.now_image = "";

        $scope.controlModel = function() {
             if(playing === true) return;
             playing = true;

            $scope.show_builder = true;

            var api_params = {};
            api_params['item_idx'] = update_item_idx;

            api_item.get(api_params, function (data) {
                if (data.status === 200) {
                    $scope.itemName = data.objects[0].item_title;

                    buildModel()
                } else {

                }
            });
        };

        // 1. 아이템 값 가져오기.
        // 2. 모델정보 가져오기
        // 3. 이미지 빌딩

        async function buildModel() {
            const key = await init();

            await buildImages(key);
        }

        async function init() {
            return new Promise(((resolve, reject) => {
                var api_params = {};
                api_params['item_idx'] = update_item_idx;
                api_params['model_idx'] = $scope.model_idx;
                api_build_item.get(api_params, function (data) {
                    if (data.status === 200) {
                        var item = data.objects[0];
                        console.log(item);
                        resolve({idx: item.group_idx, id: item.group_code})
                    } else {
                        console.log("???");
                        reject();
                    }
                });
            }));
        }

        var interval;
        var end_build = false;

        async function buildImages(key) {
            var process = intervalProcess;
            interval = setInterval(process, 500, key);

            $http({
                method: 'POST',
                url: 'http://localhost:3000/build',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {group_id: key.id, cycle: 10, model_id: $scope.model_idx}
            });
        }

        var lastImageCnt = 0;
        function intervalProcess(key) {
            var api_params = {};
            api_params['group_idx'] = key.idx;

            api_build_process.get(api_params, function (data) {
                if (data.status === 200) {

                    let process = data.objects[0].process;

                    let beforeImageCnt = lastImageCnt;
                    lastImageCnt = process;
                    for (let i = beforeImageCnt; i < process; i++) {
                        findImages(i);
                    }

                    $scope.now_image = $scope.model_generated_path + $scope.itemName + '_' + process + '.jpeg';

                    var progress = document.getElementById('progress_bar');

                    $scope.progress_width = (data.objects[0].process / data.objects[0].max_value) * 100;
                    progress.style.width = Math.floor($scope.progress_width) + '%';

                    $('#video_cap_img').scrollTop($('#video_cap_img')[0].scrollHeight);

                    if (data.objects[0].process === data.objects[0].max_value) {
                        if (!end_build) {
                            end_build = true;

                            var api_anno_params = {};
                            api_anno_params['model_idx'] = $scope.model_idx;
                            api_titan_model.get(api_anno_params, function (data) {
                                if (data.status === 200) {
                                    $scope.annotations = data.objects[0].anno_list;
                                    $scope.classes = data.objects[0].class_list;

                                    // console.log(data.objects[0]);
                                }
                            });
                        }

                        playing = false;
                        clearInterval(interval);
                    }
                }
            });
        }

        function findImages(process) {
            $scope.all_images.push($scope.model_generated_path + $scope.itemName + '_' + (process + 1) + '.jpeg');
        }
//---------------------------------------------------------------------------------------------------
// 모델 학습
        $scope.trainModel = function () {
            if ($scope.model_title === '') {
                return alert('모델명을 입력해주세요.');
            }
            // console.log($scope.classes);
            // console.log($scope.annotations);
            var api_make_model_params = {};
            api_make_model_params['classes'] = $scope.classes;
            api_make_model_params['annotations'] = $scope.annotations;

            api_make_model_params['user_idx'] = $scope.user_idx;
            api_make_model_params['model_idx'] = $scope.model_idx;
            api_make_model_params['model_title'] = $scope.model_title;
            api_make_model_params['model_description'] = $scope.model_title + ' 모델';
            api_make_model_params['model_epochs'] = 50;
            api_make_model_params['model_access'] = 0;
            api_make_model_params['create_model'] = 1;
            if(update_model_idx) api_make_model_params['update'] = 1;

            api_titan_model.update(api_make_model_params, function (data) {
                if (data.status === 402) {
                    alert('같은 이름의 모델이 이미 존재합니다.');
                }
            });

            var api_params = {};
            api_params['model_idx'] = $scope.model_idx;

            api_titan_model.get(api_params, function (data) {
                if (data.status === 200) {
                    if(data.objects[0].model_info.model_title === $scope.model_title) {
                        Modal.open(
                            'views/alert_modal.html',
                            'AlertCtrl',
                            '',
                            {
                                alertTitle: function () {
                                    return '모델 생성 중';
                                },
                                alertMsg: function () {
                                    return '모델 생성 스케줄에 추가되었습니다.';
                                }
                            }
                        );
                        $modalInstance.dismiss('cancel');
                        $route.reload();
                    }
                }
            });
        };
//---------------------------------------------------------------------------------------------------

        $scope.imageChange = function (img_name) {
            $scope.show_builder = false;
            $scope.show_image = img_name;
        };


        $scope.imgAdd = function () {
            var image_add_btn = document.getElementById("image_add_btn");
            if ($scope.$$phase == '$apply' || $scope.$$phase == '$digest') {
                image_add_btn.onclick = function () {
                    $('#image_file_add').click();
                };
            } else {
                $scope.$apply(function () {
                    image_add_btn.onclick = function () {
                        $('#image_file_add').click();
                    };
                });
            }
        };

        function closeModal() {
            Modal.open(
                'views/alert_modal.html',
                'AlertCtrl',
                '',
                {
                    alertTitle: function () {
                        return '모델 생성 종료';
                    },
                    alertMsg: function () {
                        return '모델 생성이 종료되었습니다.';
                    }
                }
            );
            $modalInstance.dismiss('cancel');
            $route.reload();
        }

        $scope.close = function () {
            var editor_close = confirm('모델 생성을 종료하시겠습니까?');
            if (editor_close) {
                if(update_model_idx) {
                    closeModal();
                } else {
                    let api_params = {};
                    api_params['model_idx'] = $scope.model_idx;

                    api_titan_model.delete(api_params, function (data) {
                        if (data.status === 200) {
                            closeModal();
                        }
                    });
                }
            } else {
                console.log('작업 계속 수행');
            }
        };

//---------------------------------------------------------------------------------------------------

    var drew_rect;
    $scope.annotation = {};

    function annoChange() {
        // console.log($scope.annotations);
        // console.log($scope.show_image);
        var item = $scope.show_image.split('/');
        var itemname = item[item.length - 1].split(".")[0]
        if($scope.annotations[itemname]) {
            $scope.annotation = $scope.annotations[itemname];

            $timeout(function () {
                for(let class_name in $scope.annotation) {
                    for(let i=0; i<Object.keys($scope.annotation[class_name]).length; i++) {
                        drew_rect = document.getElementById(class_name + '_' + i.toString());
                        drew_rect.style.left = $scope.annotation[class_name][i][0] + 'px';
                        drew_rect.style.top = $scope.annotation[class_name][i][1] + 'px';
                        drew_rect.style.width = $scope.annotation[class_name][i][2] - $scope.annotation[class_name][i][0] + 'px';
                        drew_rect.style.height = $scope.annotation[class_name][i][3] - $scope.annotation[class_name][i][1] + 'px';
                    }
                }
            }, 500);
        } else {
            $scope.annotation = {};
        }
    }

    $scope.$watch('show_image', function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        annoChange();
    });

    // Annotation Rect variable
    var canvasElement = document.createElement('canvas');
    var imageElement = document.createElement('img');
    canvasElement.width = 416;
    canvasElement.height = 416;
    var context = canvasElement.getContext('2d');

    var image_area, draw_rect, class_form;
    var start_position, end_position;
    var left, top, width, height;
    var drawing = false;

    function getMousePosition(e) {
        return {
            x: e.clientX - image_area.getBoundingClientRect().x,
            y: e.clientY - image_area.getBoundingClientRect().y
        };
    }

    $scope.drawStart = function (e) {
        image_area = document.getElementsByClassName('image_area')[0];
        draw_rect = document.getElementById('draw_rect');
        start_position = getMousePosition(e);

        class_form = document.getElementById('class_form');
        class_form.style.display = 'none';

        drawing = true;
    };

    $scope.drawing = function(e) {
        if(!drawing) return;
        end_position = getMousePosition(e);

        left = start_position.x;
        top = start_position.y;
        width = end_position.x - left;
        height = end_position.y - top;

        draw_rect.style.display = 'block';
        draw_rect.style.left = left + 'px';
        draw_rect.style.top = top + 'px';
        draw_rect.style.width = width + 'px';
        draw_rect.style.height = height + 'px';
    };

    $scope.drawEnd = function() {
        drawing = false;

        class_form.style.display = 'block';
        class_form.style.left = left + width + 'px';
        class_form.style.top = top + 'px';
    };

    $scope.addDataImageSubmit = function () {
        let item = $scope.show_image.split('/');
        let image_name = item[item.length - 1];
        // console.log(image_name, left, top, width + left, height + top);

        let api_params = {};
        api_params['image_name'] = image_name;
        api_params['model_idx'] = $scope.model_idx;
        api_params['x_min'] = Math.round(left);
        api_params['y_min'] = Math.round(top);
        api_params['x_max'] = Math.round(width + left);
        api_params['y_max'] = Math.round(height + top);
        api_crawling_image.get(api_params, function (data) {
            if (data.status === 200) {
                $scope.uploadedImage.push($scope.upload_path + $scope.model_idx + '/' + data.objects[0].image_name);
                $scope.show_builder = true;
            }
        });

        class_form.style.display = 'none';
        draw_rect.style.display = 'none';
    };

    $scope.addDataImageCancel = function () {
        class_form.style.display = 'none';
        draw_rect.style.display = 'none';
    };

    $scope.removeDataImage = function(image) {
        let item = image.split('/');
        let image_name = item[item.length - 1];

        let api_params = {};
        api_params['image_name'] = image_name;
        api_params['model_idx'] = $scope.model_idx;
        api_build_item.delete(api_params, function (data) {
            if (data.status === 200) {
                let index = $scope.uploadedImage.indexOf(image);
                $scope.uploadedImage.splice(index, 1);
            }
        });
    }

    }).directive('fileread', [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}])