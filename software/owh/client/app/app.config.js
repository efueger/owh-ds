(function(){
    'use strict';

    // Declare app level module which depends on views, and components
    angular
        .module('owh')
        .config(appConfig);
    appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$translateProvider'];

    function appConfig($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider ) {

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        //TODO: move these route definitions inside of their respective modules
        //Routes
        $stateProvider.state('home', {
            url:'/',
            templateUrl: 'app/modules/home/home.html',
            controller: 'HomeController',
            controllerAs: 'hc'
        }).state('search', {
                url:'/search/:queryId',
                templateUrl: 'app/modules/search/search.html',
                controller: 'SearchController',
                controllerAs: 'sc',
                params: {primaryFilterKey: 'deaths'}
        });

        $urlRouterProvider.otherwise('/');

        // configures staticFilesLoader
        $translateProvider.useStaticFilesLoader({
            prefix: 'app/i18n/messages-',
            suffix: '.json'
        });

        // load 'en' table on startup
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitize');
    }
}());
