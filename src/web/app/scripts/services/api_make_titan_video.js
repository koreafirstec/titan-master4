'use strict';

angular.module('titanApp')
    .factory('api_make_titan_video', function ($resource, ENV) {
        return $resource(ENV.host + '/api/make_titan_video', null, {'update': {method: 'PUT'}});
    });
