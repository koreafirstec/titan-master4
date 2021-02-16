'use strict';

angular.module('titanApp')
    .factory('api_build_item', function ($resource, ENV) {
        return $resource(ENV.host + '/api/build_item', null, {'update': {method: 'PUT'}});
    });
