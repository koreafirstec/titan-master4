'use strict';

angular.module('titanApp')
    .factory('api_build_group', function ($resource, ENV) {
        return $resource(ENV.host + '/api/build_group', null, {'update': {method: 'PUT'}});
    });
