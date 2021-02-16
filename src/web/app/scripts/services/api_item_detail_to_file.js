'use strict';

angular.module('titanApp')
    .factory('api_item_detail_to_file', function ($resource, ENV) {
        return $resource(ENV.host + '/api/item_detail_to_file', null, {'update': {method: 'PUT'}});
    });
