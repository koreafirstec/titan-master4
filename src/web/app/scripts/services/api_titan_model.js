'use strict';

angular.module('titanApp')
    .factory('api_titan_model', function ($resource, ENV) {
        return $resource(ENV.host + '/api/titan_model', null, {'update': {method: 'PUT'}});
    });
