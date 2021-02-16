'use strict';

angular.module('titanApp')
    .factory('api_model_request', function ($resource, ENV) {
        return $resource(ENV.host + '/api/model_request', null, {'update': {method: 'PUT'}});
    });
