'use strict';

describe('owhAccordionTable component: ', function() {
    var $rootScope, $injector, $templateCache, $scope;
    var $httpBackend, $compile, $http, $componentController;


    beforeEach(function() {
        module('owh');
        inject(function(_$rootScope_, _$state_, _$injector_, _$templateCache_,_$location_, _$compile_, _$http_, _$componentController_ ) {
            $rootScope  = _$rootScope_;
            $injector   = _$injector_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $http = _$http_;
            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            $componentController = _$componentController_;
        });
        $templateCache.put('app/modules/search/components/owh-accordion-table/owhAccordionTable.html', 'app/modules/search/components/owh-accordion-table/owhAccordionTable.html');

        $httpBackend.whenGET('app/modules/search/components/owh-accordion-table/owhAccordionTable.html').respond( $templateCache.get('app/modules/search/components/owh-accordion-table/owhAccordionTable.html'));
    });

    it('should have a row of headers for each column header', function() {

    });

    it('should have an accordion row for each category', function() {

    });

});

