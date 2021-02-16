'use strict';

angular.module('titanApp')
    .factory('api_file_upload', function ($resource, ENV) {
        return $resource(ENV.host + '/api/file_upload', null, {'update': {method: 'PUT'}});
    });
