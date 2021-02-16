'use strict';

angular.module('titanApp')
    .factory('api_item_type', function ($resource, ENV) {
        return $resource(ENV.host + '/api/type_api', null, {'update': {method: 'PUT'}});
    });
