'use strict';

angular.module('titanApp')
    .factory('api_search_video', function ($resource, ENV) {
        return $resource(ENV.host + '/api/search_video', null, {'update': {method: 'PUT'}});
    });