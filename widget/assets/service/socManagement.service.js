'use strict';

(function () {
    angular
        .module('cybersponse')
        .factory('socManagementService', socManagementService);

    socManagementService.$inject = ['$q', '$http', 'API', '$resource', 'ALL_RECORDS_SIZE', 'PromiseQueue', 'Modules'];

    function socManagementService($q, $http, API, $resource, ALL_RECORDS_SIZE, PromiseQueue, Modules) {
        var service = {
            getResourceData: getResourceData,
            getPlaybookRun: getPlaybookRun,
            getPlaybookActionExecuted: getPlaybookActionExecuted,
            getStatusByPicklistName: getStatusByPicklistName,
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
        
        function getStatusByPicklistName(_name) {
            var deferredPicklists = $q.defer();
            var query = {
                module: 'picklist_names',
                $limit: ALL_RECORDS_SIZE,
                $relationships: true,
                $orderby: 'name',
                $export: false,
                name: _name
            };
            var promise = PromiseQueue.get('picklistsByName' + _name);
            if (!promise) {
                promise = Modules.get(query).$promise;
                PromiseQueue.set('picklistsByName' + _name, promise);
            }
            promise.then(function (data) {
                deferredPicklists.resolve(data['hydra:member']);
                PromiseQueue.clear('picklistsByName' + _name);
            });
            return deferredPicklists.promise;
        }
        
        function getConfig() {
            return $http.get('widgets/installed/socManagement-1.0.1/assets/socWidgetInput.json');
        }
    }
})();