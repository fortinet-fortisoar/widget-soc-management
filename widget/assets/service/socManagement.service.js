'use strict';

(function () {
    angular
        .module('cybersponse')
        .factory('socManagementService', socManagementService);

    socManagementService.$inject = ['$q', '$http', 'API', '$resource'];

    function socManagementService($q, $http, API, $resource) {
        var service = {
            getResourceData: getResourceData,
            getPlaybookRun: getPlaybookRun,
            getIriElement: getIriElement,
            getPlaybookActionExecuted: getPlaybookActionExecuted,
            getConfig: getConfig
        };
        return service;

        function getResourceData(resource, queryObject) {
            var defer = $q.defer();
            $resource(API.QUERY + resource).save(queryObject.getQueryModifiers(), queryObject.getQuery(true)).$promise.then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function getPlaybookRun(queryObject) {
            var defer = $q.defer();
            var url = API.WORKFLOW + 'api/query/workflow_logs/';
            $resource(url,{}, {}, {stripTrailingSlashes: false}).save(queryObject).$promise.then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function getIriElement(iri){
            var defer = $q.defer();
            $http.get(iri).then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function getPlaybookActionExecuted(queryObject) {
            var defer = $q.defer();
            var url = API.WORKFLOW + 'api/workflows/metrics/?&';
            $resource(url).get(queryObject, function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }
        
        function getConfig() {
            return $http.get('widgets/installed/socManagement-1.0.0/assets/socWidgetInput.json');
        }
    }
})();