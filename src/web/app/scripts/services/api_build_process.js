'use strict';

angular.module('titanApp')
    .factory('api_build_process', function ($resource, ENV) {
        return $resource(ENV.host + '/api/build_process', null, {'update': {method: 'PUT'}});
    });
