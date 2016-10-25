(function(){
    angular
        .module('owh.search')
        .service('SearchService', SearchService);

    SearchService.$inject = ["$q", "API"];

    function SearchService($q, API){
        var service = {
            searchResults : searchResults,
            uploadImage : uploadImage,
            generateHashCode: generateHashCode
        };
        return service;

        function searchResults(query, queryID) {
            var deferred = $q.defer();
            API.search({q:query, qID:queryID}).$promise.then(onComplete).catch(onFailed);
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

        function generateHashCode(queryJson){
            return 10101;
        }

        /*function getResults(query) {
            //if(query.queryJSON) {
                var deferred = $q.defer();
                API.getResults({q:query}).$promise.then(onComplete).catch(onFailed);
                function onComplete(response) { deferred.resolve(response); }
                function onFailed(error) { deferred.reject(error) }
                return deferred.promise;
            //}
        }*/
    }

}());