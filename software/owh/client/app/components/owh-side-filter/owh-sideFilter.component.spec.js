'use strict';

describe('OWH Side filter component: ', function() {
    var $rootScope, $injector, $templateCache, $scope, filters,closeDeferred, controllerProvider,
        modalService,givenModalDefaults, ModalService,elementVisible, thenFunction;
    var $httpBackend, $compile, $http, $componentController;

    beforeEach(function() {
        module('owh');

        ModalService = jasmine.createSpy('ModalServiceMock');

        module(function ($provide) {
            ModalService.showModal = function(modalDefaults) {
                givenModalDefaults = modalDefaults;
                givenModalDefaults.element = {
                    show: function(){
                        elementVisible = true
                    },
                    hide: function(){
                        elementVisible = false
                    }
                };
                return {
                    then: function(func) {
                        thenFunction = func;
                    }
                };
            };
            $provide.value('ModalService', ModalService);
        });

        inject(function(_$rootScope_, _$state_, _$injector_, _$templateCache_,_$location_, _$compile_, _$http_,
                        _$componentController_ , _$q_, _$controller_) {
            $rootScope  = _$rootScope_;
            $injector   = _$injector_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $http = _$http_;
            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            $componentController = _$componentController_;
            //modalService = _ModalService_;
            closeDeferred = _$q_.defer();
            controllerProvider = _$controller_;
        });
        $templateCache.put('app/components/owh-side-filter/owhSideFilter.html', 'app/components/owh-side-filter/owhSideFilter.html');
        $templateCache.put('app/modules/home/home.html', 'app/modules/home/home.html');
        $templateCache.put('app/components/owh-footer/footer.html', 'app/components/owh-footer/footer.html');
        $templateCache.put('app/partials/marker-template.html', 'app/partials/marker-template.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/components/owh-side-filter/owhSideFilter.html').respond( $templateCache.get('app/components/owh-side-filter/owhSideFilter.html'));
        $httpBackend.whenGET('app/components/owh-footer/footer.html').respond( $templateCache.get('app/components/owh-footer/footer.html'));
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));

        function searchResultsFn() {

        }
        filters= { selectedPrimaryFilter: {
            key: 'deaths', title: 'label.filter.mortality', primary: true, value: [], header:"Mortality",
            allFilters: [], searchResults: searchResultsFn, showMap:true,
            countLabel: 'Number of Deaths', mapData:{}, initiated:true,
            sideFilters:[
                {
                    filterGroup: false, collapse: false, allowGrouping: true, groupBy:false,
                    filters: {key: 'race', title: 'label.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'row',
                        type:"label.filter.group.demographics", showChart: true, defaultGroup:"column",
                        autoCompleteOptions: []}
                },
                {
                    filterGroup: false, collapse: true, allowGrouping: true,groupBy:true,
                    filters: {key: 'gender', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], groupBy: 'column',
                        type:"label.filter.group.demographics", groupByDefault: 'column', showChart: true,
                        autoCompleteOptions: [
                            {key:'F',title:'Female'},
                            {key:'M',title:'Male'}
                        ], defaultGroup:"column"
                    }
                }
            ]
        }
        };
    });


    it('Should have the controller', inject(function ($httpBackend, $location) {
        var ctrl = $componentController('owhSideFilter', null, null);
        expect(ctrl).toBeDefined();//<aside>
    }));

    it("should call updateGroupValue on the filter",inject( function(){
        var bindings = { filters : filters };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[1].filters);

        //If allChecked
        ctrl.updateGroupValue(group);
        expect(group.value.length).toBe(0);

        //Add values to group
        group.allChecked = false;
        ctrl.updateGroupValue(group);
        expect(group.value.length).toBe(2);
    }));

    it("should call getOptionCount on the filter",inject( function() {
        var bindings = { filters : filters };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[1].filters);

        //get option count
        var optionCount = ctrl.getOptionCount(group);
        expect(optionCount).toBe(0);

        group.deaths = 230;
        optionCount = ctrl.getOptionCount(group);
        expect(optionCount).toBe(230);
    }));


    it("should call getOptionCountPercent on the filter",inject( function() {
        var bindings = { filters : filters };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[1].filters);

        //get option count
        var optionCountPercent = ctrl.getOptionCountPercentage(group);
        expect(optionCountPercent).toBe(0);

        group.deathsPercentage = 64;
        optionCountPercent = ctrl.getOptionCountPercentage(group);
        expect(optionCountPercent).toBe(64);
    }));

    it("should call groupBySideFilter on the filter",inject( function() {
        var bindings = { filters : filters };
        var ctrl = $componentController( 'owhSideFilter', null, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[1]);
        group.filters = [];
        group.filters.push(group.filters);

        //call groupBySideFilter
        expect(filters.selectedPrimaryFilter.value.length).toBe(0);
        ctrl.groupBySideFilter(group);
        expect(filters.selectedPrimaryFilter.value.length).toBe(1);
        //add the value to selected primary filter

        //if group has no filters
        group.filters=undefined;
        ctrl.groupBySideFilter(group);
    }));

    it("should call groupBySideFilter with else conditions",inject( function() {
        var moreFilters= { selectedPrimaryFilter: {
            key: 'deaths', title: 'label.filter.mortality', primary: true, value: [{key:"gender",text:"gender"}], header:"Mortality",
            allFilters: [], searchResults: undefined, showMap:true,
            countLabel: 'Number of Deaths', mapData:{}, initiated:false,
            sideFilters:[
                {
                    filterGroup: false, collapse: true, allowGrouping: true,groupBy:false,
                    filters: [{key: 'gender', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], groupBy: 'column',
                        type:"label.filter.group.demographics", groupByDefault: 'column', showChart: true,
                        autoCompleteOptions: [
                            {key:'F',title:'Female'},
                            {key:'M',title:'Male'}
                        ], defaultGroup:"column"
                    }]
                }
            ]
        }};
        var bindings = { filters : moreFilters };
        var ctrl = $componentController( 'owhSideFilter', null, bindings);
        expect(ctrl).toBeDefined();

        //call groupBySideFilter
        //remove the selected value from the primary filter
        expect(moreFilters.selectedPrimaryFilter.value.length).toBe(1);
        ctrl.groupBySideFilter(moreFilters.selectedPrimaryFilter.sideFilters[0]);
        expect(moreFilters.selectedPrimaryFilter.value.length).toBe(0);


        //call groupBySideFilter with groupBy true
        moreFilters.selectedPrimaryFilter.sideFilters[0].key= "race";
        ctrl.groupBySideFilter(moreFilters.selectedPrimaryFilter.sideFilters[0]);
    }));



    it("should call clearSelection on the filter",inject( function(){
        var bindings = { filters : filters };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[0].filters);
        group.selectedValues=["1","2"];
        //If allChecked
        ctrl.clearSelection(group, true);
        expect(group.value.length).toBe(0);
        expect(group.selectedValues.length).toBe(0);

        //Add values to group
        ctrl.clearSelection(group, false);
        expect(group.groupBy).toBe(false);
    }));

    it("Should show tree modal on selecting ucd filters", function() {
        var allFilters = [
            { key: 'question', title: 'label.yrbs.filter.question', queryKey:"question.path", aggregationKey:"question.key",
                primary: false, value: [], groupBy: 'row', filterType: 'tree', autoCompleteOptions: [], donotshowOnSearch:true,
                selectTitle: 'select.label.yrbs.filter.question', iconClass: 'fa fa-pie-chart purple-text', selectedValues :[]
            },
            { key: 'ucd-chapter-10', title: 'label.filter.ucd.icd.chapter', queryKey:"ICD_10_code.path",
                primary: true, value: [], groupBy: false, type:"label.filter.group.ucd", groupKey:"ucd",
                autoCompleteOptions: [],aggregationKey:"ICD_10_code.code",selectedValues :[{id:"disease1",text:"disease1"}]
            }
        ];
        var selectedFilter = allFilters[1];
        var bindings = { filters : filters };
        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope}, bindings);
        expect(ctrl).toBeDefined();

        ctrl.showModal(selectedFilter,allFilters);

        var modalCtrl = controllerProvider(givenModalDefaults.controller, { $scope: $scope, close: closeDeferred.promise});
        modalCtrl.element = givenModalDefaults.element;
        modalCtrl.controller = modalCtrl;
        modalCtrl.optionValues = [{id:"disease1",text:"disease1"},{id:"disease2",text:"disease2"}];
        thenFunction(modalCtrl);
        expect(elementVisible).toBeTruthy();
        closeDeferred.resolve({});
        $scope.$apply();
        expect(elementVisible).toBeFalsy();
    });


    it("Should show tree modal on selecting YRBS Question filters", function() {
        var allFilters = [
            { key: 'question', title: 'label.yrbs.filter.question', queryKey:"question.path", aggregationKey:"question.key",
                primary: false, value: [], groupBy: 'row', filterType: 'tree', autoCompleteOptions: [], donotshowOnSearch:true,
                selectTitle: 'select.label.yrbs.filter.question', iconClass: 'fa fa-pie-chart purple-text', selectedValues:undefined
            },
            { key: 'ucd-chapter-10', title: 'label.filter.ucd.icd.chapter', queryKey:"ICD_10_code.path",
                primary: true, value: [], groupBy: false, type:"label.filter.group.ucd", groupKey:"ucd",
                autoCompleteOptions: [],aggregationKey:"ICD_10_code.code",selectedValues :["disease1"]
            }
        ];
        var selectedFilter = allFilters[0];
        var bindings = { filters : filters };
        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope}, bindings);
        expect(ctrl).toBeDefined();

        ctrl.showModal(selectedFilter,allFilters);

        var modalCtrl = controllerProvider(givenModalDefaults.controller, { $scope: $scope, close: closeDeferred.promise});
        modalCtrl.element = givenModalDefaults.element;
        modalCtrl.controller = modalCtrl;
        modalCtrl.optionValues = [];
        thenFunction(modalCtrl);
        expect(elementVisible).toBeTruthy();
        closeDeferred.resolve({});
        $scope.$apply();
        expect(elementVisible).toBeFalsy();
    });


    it("Should show next phase implementation popup on selecting other filters", function() {
        var allFilters = [ { filterGroup: false, collapse: false, allowGrouping: true, groupBy:false,
                filters: {key: 'race', title: 'label.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'row',
                    type:"label.filter.group.demographics", showChart: true, defaultGroup:"column",selectedValues:[],
                    autoCompleteOptions: []} }
        ];
        var selectedFilter = allFilters[0],
            bindings = { filters : filters };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();

        //Should show next phase implementation
        ctrl.showModal(selectedFilter,allFilters);
    });
});
