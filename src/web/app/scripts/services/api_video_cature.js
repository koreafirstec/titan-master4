'use strict';

angular.module('titanApp')
    .factory('api_video_capture', function ($resource, ENV) {
        return $resource(ENV.host + '/api/video_capture', null, {'update': {method: 'PUT'}});
    });
