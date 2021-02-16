'use strict';

angular.module('titanApp')
    .factory('api_user_access_hist', function ($resource, ENV) {
        return $resource(ENV.host + '/api/user_access_hist', null, {'update': {method: 'PUT'}});
    });
