'use strict';

angular.module('titanApp')
    .factory('api_video', function ($resource, ENV) {
        return $resource(ENV.host + '/api/video', null, {'update': {method: 'PUT'}});
    });
