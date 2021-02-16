'use strict';

angular.module('titanApp')
    .factory('api_progress_process', function ($resource, ENV) {
        return $resource(ENV.host + '/api/progress_process', null, {'update': {method: 'PUT'}});
    });
