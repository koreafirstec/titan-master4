'use strict';

angular.module('titanApp')
    .factory('api_item', function ($resource, ENV) {
        return $resource(ENV.host + '/api/item', null, {'update': {method: 'PUT'}});
    });
