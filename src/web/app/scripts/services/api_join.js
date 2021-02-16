'use strict';

angular.module('titanApp')
    .factory('api_join', function ($resource, ENV) {
        return $resource(ENV.host + '/api/join', null, {'update': {method: 'PUT'}});
    });