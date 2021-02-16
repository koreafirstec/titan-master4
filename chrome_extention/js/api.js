'use strict';

var ENV = {
    host: 'http://118.37.64.217:8080'
};

angular.module('api', ['ngResource'])
    .factory('api_item_detail', ['$resource', function api_item_detail($resource) {
        return $resource(ENV.host + '/api/item_detail', null, {'update': {method: 'PUT'}});
    }])

    .factory('api_video', ['$resource', function api_video($resource) {
        return $resource(ENV.host + '/api/video', null, {'update': {method: 'PUT'}});
    }])

    .factory('api_item', ['$resource', function api_item($resource) {
        return $resource(ENV.host + '/api/item', null, {'update': {method: 'PUT'}});
    }])
    
    .factory('api_make_titan_video', ['$resource', function api_make_titan_video($resource) {
        return $resource(ENV.host + '/api/make_titan_video', null, {'update': {method: 'PUT'}});
    }])

    .factory('api_progress_process', ['$resource', function api_progress_process($resource) {
        return $resource(ENV.host + '/api/progress_process', null, {'update': {method: 'PUT'}});
    }])