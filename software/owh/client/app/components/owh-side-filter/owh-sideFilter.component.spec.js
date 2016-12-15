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
        $httpBackend.whenGET('/getFBAppID').respond({data: { fbAppID: 1111111111111111}});

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

    it("should call clearSelection on the filter",inject( function(){
        var bindings = { filters : filters, onFilter: function(){} };

        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope }, bindings);
        expect(ctrl).toBeDefined();
        var group = angular.copy(filters.selectedPrimaryFilter.sideFilters[0].filters);
        group.selectedValues=["1","2"];
        group.selectedNodes=["1","2"];
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
                selectTitle: 'select.label.yrbs.filter.question', iconClass: 'fa fa-pie-chart purple-text', selectedValues :[], selectedNodes:[]
            },
            { key: 'ucd-chapter-10', title: 'label.filter.ucd.icd.chapter', queryKey:"ICD_10_code.path",
                primary: true, value: [], groupBy: false, type:"label.filter.group.ucd", groupKey:"ucd",
                autoCompleteOptions: [],aggregationKey:"ICD_10_code.code", selectedValues :[{id:"disease1",text:"disease1"}],
                selectedNodes:[]
            }
        ];
        var selectedFilter = allFilters[1];
        var bindings = { filters : filters, onFilter: function(){} };
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
                selectTitle: 'select.label.yrbs.filter.question', iconClass: 'fa fa-pie-chart purple-text',
                selectedValues:[], selectedNodes:[]
            }
        ];
        var selectedFilter = allFilters[0];
        var bindings = { filters : filters, onFilter: function(){} };
        var ctrl = $componentController( 'owhSideFilter', { $scope: $scope}, bindings);
        expect(ctrl).toBeDefined();

        ctrl.showModal(selectedFilter,allFilters);

        var modalCtrl = controllerProvider(givenModalDefaults.controller, { $scope: $scope, close: closeDeferred.promise});
        modalCtrl.element = givenModalDefaults.element;
        modalCtrl.controller = modalCtrl;
        modalCtrl.optionValues = [{id:"Q1", text:"Question 1", childNodes:[{id:"qn1", text:"test ques1"},
                        {id:"qn2", text:"test ques2"}]}, {id:"Q2",text:"Question 2"}];
        thenFunction(modalCtrl);
        expect(elementVisible).toBeTruthy();
        closeDeferred.resolve({});
        $scope.$apply();
        expect(elementVisible).toBeFalsy();
        expect(JSON.stringify(selectedFilter.selectedNodes)).toEqual(JSON.stringify(modalCtrl.optionValues))
        expect(JSON.stringify(selectedFilter.selectedValues)).toEqual(JSON.stringify([{"id":"qn1","text":"test ques1"},{"id":"qn2","text":"test ques2"},{"id":"Q2","text":"Question 2"}]))
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

    it('getOptionCount should return correct total for given option', function() {
        var bindings = {};
        var ctrl = $componentController('owhSideFilter', { $scope: $scope }, bindings);

        ctrl.filters = {selectedPrimaryFilter: {key: 'deaths'}};

        var optionCount = ctrl.getOptionCount({deaths: 42});

        expect(optionCount).toEqual(42);

        optionCount = ctrl.getOptionCount({});

        expect(optionCount).toEqual(0);
    });

    it('getOptionCount should return correct total for given group option', function() {
        var bindings = {};
        var ctrl = $componentController('owhSideFilter', { $scope: $scope }, bindings);

        ctrl.filters = {selectedPrimaryFilter: {key: 'deaths'}};

        var option = {
            options: [
                {
                    deaths: 24
                },
                {
                    deaths: 402
                }
            ]
        };

        var optionCount = ctrl.getOptionCount(option);

        expect(optionCount).toEqual(426);
    });

    it('updateGroupValue should properly update the value array with the selected options', function() {
        var bindings = {onFilter: function(){}};
        var ctrl = $componentController('owhSideFilter', { $scope: $scope }, bindings);

        var group = {autoCompleteOptions: [{key: '2013'}, {key: '2014'}], value: [], allChecked: false};

        ctrl.updateGroupValue(group);

        expect(group.value.length).toEqual(2);
        expect(group.value).toContain('2013');
        expect(group.value).toContain('2014');

        group.allChecked = true;

        ctrl.updateGroupValue(group);

        expect(group.value.length).toEqual(0);
    });

    it('updateGroupValue should call onFilter', function() {
        var bindings = {onFilter: function(){}};
        var ctrl = $componentController('owhSideFilter', { $scope: $scope }, bindings);
        spyOn(ctrl, 'onFilter');

        ctrl.updateGroupValue({value: []});

        expect(ctrl.onFilter).toHaveBeenCalled();

    });

    it('Should getFilterOrder based on sort binding', function() {
        var sort = ['gender', 'race', 'height'];
        var bindings = {filters: [], sort: sort};
        var ctrl = $componentController('owhSideFilter', {$scope: $scope}, bindings);
        expect(ctrl.getFilterOrder({filters: {key: 'race'}})).toEqual(1);
        expect(ctrl.getFilterOrder({filters: {key: 'height'}})).toEqual(2);
        expect(ctrl.getFilterOrder({filters: {key: 'iq'}})).toEqual(-1);
    });

    it('should get visibility based on showFilters', function() {
        var showFilters = ['year', 'gender'];
        var bindings = {filters: [], showFilters: showFilters};
        var ctrl = $componentController('owhSideFilter', {$scope: $scope}, bindings);
        var filter = {filters: {key: 'year'}};
        expect(ctrl.isVisible(filter)).toEqual(true);
    });

    it('filterGroup should properly toggle group keys in value array', function() {
        var bindings = {filters: [], onFilter: angular.noop};
        var ctrl = $componentController('owhSideFilter', {$scope: $scope}, bindings);
        var option = {
            key: 'hispanic',
            options: [
                {
                    key: 'Cuban'
                },
                {
                    key: 'Dominican'
                }
            ]
        };

        var group = {
            value: []
        };

        group.value.push('hispanic');
        ctrl.filterGroup(option, group);

        expect(group.value).toContain('Cuban');
        expect(group.value).toContain('Dominican');

        group.value.splice(0, 1);
        ctrl.filterGroup(option, group);

        expect(group.value.length).toEqual(0);

        group.value.push('hispanic');
        group.value.push('Cuban');
        ctrl.filterGroup(option, group);

        expect(group.value).toContain('Cuban');
        expect(group.value).toContain('Dominican');
    });

    it('isSubOptionSelected should check if group child option is included in value', function() {
        var bindings = {filters: []};
        var ctrl = $componentController('owhSideFilter', {$scope: $scope}, bindings);

        var option = {
            options: [
                {
                    key: 'Cuban'
                },
                {
                    key: 'Dominican'
                }
            ]
        };

        var group = {
            value: []
        };

        expect(ctrl.isSubOptionSelected(group, option)).toBeFalsy();

        group.value.push('Cuban');

        expect(ctrl.isSubOptionSelected(group, option)).toBeTruthy();

        group.value = ['Non-Hispanic'];

        expect(ctrl.isSubOptionSelected(group, option)).toBeFalsy();
    });

    it('isOptionDisabled should make sure Unknown and other ethnicity options are mutually exclusive', function() {
        var bindings = {filters: []};
        var ctrl = $componentController('owhSideFilter', {$scope: $scope}, bindings);

        var hispanicOption = {
            key: 'Hispanic'
        };

        var unknownOption = {
            key: 'Unknown'
        };

        var nonHispanicOption = {
            key: 'Non-Hispanic'
        };

        var group = {
            key: 'hispanicOrigin',
            value: []
        };

        expect(ctrl.isOptionDisabled(group, unknownOption)).toBeFalsy();
        expect(ctrl.isOptionDisabled(group, hispanicOption)).toBeFalsy();
        expect(ctrl.isOptionDisabled(group, nonHispanicOption)).toBeFalsy();

        group.value.push('Cuban');

        expect(ctrl.isOptionDisabled(group, unknownOption)).toBeTruthy();

        group.value = ['Unknown'];

        expect(ctrl.isOptionDisabled(group, hispanicOption)).toBeTruthy();
    });
});
