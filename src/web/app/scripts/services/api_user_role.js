'use strict';

angular.module('titanApp')
    .factory('api_user_role', function ($resource, ENV) {
        return $resource(ENV.host + '/api/user_role', null, {'update': {method: 'PUT'}});
    });
