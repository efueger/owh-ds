(function(){
    angular
        .module('owh.search')
        .service('SearchService', SearchService);

    SearchService.$inject = ["$q", "API"];

    function SearchService($q, API){
        var service = {
            searchResults : searchResults,
            uploadImage : uploadImage
        };
        return service;

        function searchResults(query) {
            var deferred = $q.defer();
            API.search({q:query}).$promise.then(onComplete).catch(onFailed);
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
    }

}());