'use strict';

angular.module('titanApp')
    .factory('api_get_item', function ($resource, ENV) {
        return $resource(ENV.host + '/api/get_item', null, {'update': {method: 'PUT'}});
    });
