'use strict';

angular.module('titanApp')
    .factory('api_logout', function ($resource, ENV) {
        return $resource(ENV.host + '/api/logout', null, {'update': {method: 'PUT'}});
    });
