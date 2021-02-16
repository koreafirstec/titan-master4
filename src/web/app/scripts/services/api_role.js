'use strict';

angular.module('titanApp')
    .factory('api_role', function ($resource, ENV) {
        return $resource(ENV.host + '/api/role', null, {'update': {method: 'PUT'}});
    });
