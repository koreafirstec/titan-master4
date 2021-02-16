'use strict';

angular.module('titanApp')
    .factory('api_auth', function ($resource, ENV) {
        return $resource(ENV.host + '/api/auth', null, {'update': {method: 'PUT'}});
    });
