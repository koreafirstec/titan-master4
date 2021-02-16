'use strict';

angular.module('titanApp')
    .factory('api_editor_list', function ($resource, ENV) {
        return $resource(ENV.host + '/api/editor_list', null, {'update': {method: 'PUT'}});
    });
