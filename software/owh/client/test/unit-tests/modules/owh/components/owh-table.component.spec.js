'use strict';

describe('owhTable component: ', function() {
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
        $templateCache.put('app/partials/owhTable.html', 'app/partials/owhTable.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
        $httpBackend.whenGET('app/partials/owhTable.html').respond( $templateCache.get('app/partials/owhTable.html'));
    });


    it('Should call owhTableDataUpdated on load', inject(function ($httpBackend, $location) {
        var bindings = {headers:{rowHeaders:[], columnHeaders:[]}, data:[], countKey:'total_accruals', totalCount:0,
            countLabel:'Total', calculatePercentage:0, calculateRowTotal:0};
        var ctrl = $componentController('owhTable', {$scope: $scope}, bindings);
        expect(ctrl).toBeDefined();
    }));

    it('Should call owhTableDataUpdated on change', inject(function ($httpBackend, $location) {
        var bindings = {headers:{rowHeaders:[], columnHeaders:[]}, data:"oldValue", countKey:'total_accruals', totalCount:0,
            countLabel:'Total', calculatePercentage:0, calculateRowTotal:0, tableDataPrepared:true};
        var ctrl = $componentController('owhTable', {$scope: $scope}, bindings);
        $scope.$digest();
        ctrl['data'] = "changedValue";
        expect(ctrl).toBeDefined();
        $scope.$digest();
        expect(ctrl.data).toBe("changedValue");
    }));

});

