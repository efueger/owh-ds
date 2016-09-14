'use strict';

describe('Footer component: ', function() {
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
        $templateCache.put('app/modules/home/home.html', 'app/modules/home/home.html');
        $templateCache.put('app/components/owh-footer/footer.html', 'app/components/owh-footer/footer.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
        $httpBackend.whenGET('app/components/owh-footer/footer.html').respond( $templateCache.get('app/components/owh-footer/footer.html'));
    });


    it('Should show next phase popup', inject(function ($httpBackend, $location) {
        var ctrl = $componentController('owhFooter', null, null);
        expect(ctrl.showPhaseTwoWarningModal).toBeDefined();
        ctrl.showPhaseTwoWarningModal();
    }));

});
