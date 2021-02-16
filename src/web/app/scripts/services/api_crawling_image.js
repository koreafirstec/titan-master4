'use strict';

angular.module('titanApp')
    .factory('api_crawling_image', function ($resource, ENV) {
        return $resource(ENV.host + '/api/crawling_image', null, {'update': {method: 'PUT'}});
    });
