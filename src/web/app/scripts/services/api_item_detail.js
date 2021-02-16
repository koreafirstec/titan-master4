'use strict';

angular.module('titanApp')
    .factory('api_item_detail', function ($resource, ENV) {
        return $resource(ENV.host + '/api/item_detail', null, {'update': {method: 'PUT'}});
    });
