'use strict';

angular.module('titanApp')
    .factory('api_login', function ($resource, ENV) {
        return $resource(ENV.host + '/api/login', null, {'update': {method: 'PUT'}});
    });
