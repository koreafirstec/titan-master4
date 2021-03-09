'use strict';

angular.module('titanApp')
    .factory('api_acgan_classification', function ($resource, ENV) {
        return $resource(ENV.host + '/api/acgan_classification', null, {'update': {method: 'PUT'}});
    });
