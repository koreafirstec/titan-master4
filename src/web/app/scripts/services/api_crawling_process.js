'use strict';

angular.module('titanApp')
    .factory('api_crawling_process', function ($resource, ENV) {
        return $resource(ENV.host + '/api/crawling_process', null, {'update': {method: 'PUT'}});
    });
