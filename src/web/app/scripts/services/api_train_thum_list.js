'use strict';

angular.module('titanApp')
    .factory('api_train_thum_List', function ($resource, ENV) {
        return $resource(ENV.host + '/api/train_thum_List', null, {'update': {method: 'PUT'}});
    });
