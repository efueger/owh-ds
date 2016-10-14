'use strict';

describe('owhAccordionRow component: ', function() {
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
        $templateCache.put('app/partials/marker-template.html', 'app/partials/marker-template.html');
        $templateCache.put('app/partials/home/home.html', 'app/partials/home/home.html');
        $templateCache.put('app/modules/search/components/owh-accordion-table/owh-accordion-row/owhAccordionRow.html', 'app/modules/search/components/owh-accordion-table/owh-accordion-row/owhAccordionRow.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
        $httpBackend.whenGET('app/modules/search/components/owh-accordion-table/owh-accordion-row/owhAccordionRow.html').respond( $templateCache.get('app/modules/search/components/owh-accordion-table/owh-accordion-row/owhAccordionRow.html'));
    });


    it('should expand properly', function () {

    });

    it('should collapse properly after expanding', function () {

    });

});

