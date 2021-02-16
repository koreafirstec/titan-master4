'use strict';

angular.module('titanApp')
    .factory('api_search_youtube', function ($resource, ENV) {
        return $resource(ENV.host + '/api/search_youtube', null, {'update': {method: 'PUT'}});
    });