'use strict';

angular.module('titanApp')
    .factory('api_user', function ($resource, ENV) {
        return $resource(ENV.host + '/api/user', null, {'update': {method: 'PUT'}});
    });
