'use strict';

angular.module('titanApp')
    .factory('api_shape', function ($resource, ENV) {
        return $resource(ENV.host + '/api/shape', null, {'update': {method: 'PUT'}});
    });
