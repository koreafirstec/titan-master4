'use strict';

angular.module('titanApp')
    .factory('api_temporary_password', function ($resource, ENV) {
        return $resource(ENV.host + '/api/temporary_password', null, {'update': {method: 'PUT'}});
    });
