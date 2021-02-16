'use strict';

angular.module('titanApp')
    .factory('api_item_history', function ($resource, ENV) {
        return $resource(ENV.host + '/api/item_history', null, {'update': {method: 'PUT'}});
    });
