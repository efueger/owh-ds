(function(){
    angular
        .module('owh.search')
        .service('SearchService', SearchService);

    SearchService.$inject = ["$q", "API"];

    function SearchService($q, API){
        var service = {
            searchResults : searchResults,
            uploadImage : uploadImage,
            generateHashCode : generateHashCode,
            getQueryResults: getQueryResults
        };
        return service;

        function searchResults(primaryFilter, queryID) {
            var deferred = $q.defer();
            API.search({q:primaryFilter, qID:queryID}).$promise.then(onComplete).catch(onFailed);
            function onComplete(response) { deferred.resolve(response); }
            function onFailed(error) { deferred.reject(error) }
            return deferred.promise;
        }

        function uploadImage(data) {
            var deferred = $q.defer();
            API.upload({q:{data:data}}).$promise.then(onComplete).catch(onFailed);
            function onComplete(response) { deferred.resolve(response); }
            function onFailed(error) { deferred.reject(error) }
            return deferred.promise;
        }

        function generateHashCode(query) {
            var deferred = $q.defer();
            API.generateHashCode({q:query}).$promise.then(onComplete).catch(onFailed);
            function onComplete(response) { deferred.resolve(response); }
            function onFailed(error) { deferred.reject(error) }
            return deferred.promise;
        }

        function getQueryResults(queryId) {
            var deferred = $q.defer();
            API.getQueryResults({queryId:queryId}).$promise.then(onComplete).catch(onFailed);
            function onComplete(response) {  deferred.resolve(response); }
            function onFailed(error) { deferred.reject(error) }
            return deferred.promise;
        }
    }

}());