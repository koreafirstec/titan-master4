'use strict';

angular.module('titanApp')
    .factory('api_shape_video_list', function ($resource, ENV) {
        return $resource(ENV.host + '/api/shape_video_list', null, {'update': {method: 'PUT'}});
    });
