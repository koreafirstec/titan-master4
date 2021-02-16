'use strict';

angular.module('titanApp')
    .factory('api_admin_video_list', function ($resource, ENV) {
        return $resource(ENV.host + '/api/admin_video_list', null, {'update': {method: 'PUT'}});
    });
