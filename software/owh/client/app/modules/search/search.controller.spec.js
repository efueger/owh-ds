'use strict';

describe("Search controller: ", function () {
    var searchController, $scope, $controller, $httpBackend, $injector, $templateCache, $rootScope;

    beforeEach(function() {
        module('owh');

        inject(function (_$controller_, _$rootScope_, _$injector_, _$templateCache_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $injector   = _$injector_;
            $scope= _$rootScope_.$new();
            $httpBackend = $injector.get('$httpBackend');
            $templateCache = _$templateCache_;


            searchController= $controller('SearchController',{$scope:$scope});
            $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
            $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
            $httpBackend.whenGET('app/partials/home/home.html').respond( $templateCache.get('app/partials/home/home.html'));
            $httpBackend.whenPOST('/search').respond( $templateCache.get('app/partials/marker-template.html'))
        });
    });

    it("Should execute showFbDialog",function() {
        var shareUtilService= {
            shareOnFb: function(){}
        };
        var searchController= $controller('SearchController',{$scope:$scope, shareUtilService:shareUtilService});
        searchController.showFbDialog([],"graphTitle","graph subtitle");
    });

    it("Should execute showExpandedGraph",function() {
        var chartUtilService= {
            showExpandedGraph: function(){}
        };
        var searchController= $controller('SearchController',{$scope:$scope, chartUtilService:chartUtilService});
        searchController.showExpandedGraph([]);
    });

    it("With selectedPrimaryfilter as disease ",function(){

        var stateparams = { primaryFilterKey: "deaths" };
        var primaryFilterChangedFn, searchResultThenFn;
        var allFilters = [
            /*Demographics*/
            {key: 'race', title: 'label.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'row',
                type:"label.filter.group.demographics", showChart: true, defaultGroup:"column",
                autoCompleteOptions: []},
            {key: 'gender', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], groupBy: 'column',
                type:"label.filter.group.demographics", groupByDefault: 'column', showChart: true,
                autoCompleteOptions: [], defaultGroup:"column"},


            /*Year and Month*/
            {key: 'year', title: 'label.filter.year', queryKey:"current_year",primary: false, value: ['2014'],
                groupBy: false,type:"label.filter.group.year.month", defaultGroup:"row",autoCompleteOptions:[
                    { "key": "2014", "title": "2014" },
                    { "key": "2013", "title": "2013" },
                    { "key": "2012", "title": "2012" }
                ]}
        ];

        function searchResultFn() {
            return {then:function(func){
                searchResultThenFn = func;
            }}
        }
        var maps = {"states":[
            {"name":"NY","deaths":53107,"sex":[{"name":"M","deaths":27003},{"name":"F","deaths":26104}]},
            {"name":"MT","deaths":53060,"sex":[{"name":"M","deaths":26800},{"name":"F","deaths":26260}]},
            {"name":"WA","deaths":53057,"sex":[{"name":"M","deaths":26955},{"name":"F","deaths":26102}]}
        ]};


        //mock searchFactory object
        var searchFactory= {
            updateFilterValues: function(){

            },
            addCountsToAutoCompleteOptions: function(){
                return {then: function(func) {
                    primaryFilterChangedFn= func;
                }};
            },
            getAllFilters:function () {
                return {search:[{
                    key: 'deaths', title: 'label.filter.mortality', primary: true, value: [], header:"Mortality",
                    allFilters: allFilters, searchResults: searchResultFn, showMap:true,
                    countLabel: 'Number of Deaths', mapData:{}, searchCount:30032, maps: maps,
                    sideFilters:[
                        {
                            filterGroup: false, collapse: false, allowGrouping: true,
                            filters: allFilters[0]
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: allFilters[1]
                        }
                    ]
                },
                    {
                        key: 'mental_health',title: 'label.risk.behavior',primary: true,value: [],
                        header: "Youth risk behavior",allFilters: [],searchResults: searchResultFn,
                        dontShowInlineCharting: true,additionalHeaders: [], countLabel: 'Total',
                        sideFilters: [
                            {
                                filterGroup: false, collapse: false, allowGrouping: false, dontShowCounts: true,
                                filters: allFilters[2]
                            }
                        ]
                    }
                ]}
            },
            showPhaseTwoModal:function (text) {
                return text;
            }
        };

        var searchController= $controller('SearchController',{$scope: $scope, searchFactory:searchFactory, $stateParams:stateparams});
        expect(searchController.filters).toBeDefined();
        expect(searchController.selectedMapSize).toEqual("small");

        //change map size to big
        searchController.selectedMapSize = "big";

        //Call primaryFilterChanged
        primaryFilterChangedFn();
        primaryFilterChangedFn();

        //Call SearchResultFn
        searchResultThenFn();

        //show phase two graphs
        searchController.showPhaseTwoGraphs("show next graph modal");


        var dummyFeatureObj = {
            properties: {
                totalCount:53100
            }
        };
        //call map style method of map to get the legend colors
        var styleObj = searchController.filters.selectedPrimaryFilter.mapData.geojson.style(dummyFeatureObj);
        expect(styleObj.weight).toBe(2);
        expect(styleObj.color).toEqual("white");


        /*getSelectedYears */
        //getSelectedYears
        var selectedYear = searchController.getSelectedYears();
        expect(selectedYear.length).toEqual(1);

        //If selected year has no value
        searchController.filters.selectedPrimaryFilter.allFilters[2].value="";
        selectedYear = searchController.getSelectedYears();
        expect(selectedYear.length).toEqual(3);


        //yearFilter is empty
        searchController.filters.selectedPrimaryFilter.allFilters=[];
        searchController.getSelectedYears();
        /*getSelectedYears */


        ////Changes the key values from deaths to yrbs
        //// make an initial selection
        //$scope.$apply('sc.filters.selectedPrimaryFilter.key="deaths"');
        //
        //// make another one
        //$scope.$apply('sc.filters.selectedPrimaryFilter.key="mental_health"');



        //on event
        //var args = {leafletEvent:{leafEvent:{latlng:{lat:3434,lng:42234}, target:{feature: {properties:{}}}, _map:{}}}}
        //$rootScope.$broadcast('leafletDirectiveGeoJson.click',event, args);
    });

    it("downloadCSV should prepare mixedTable and call out to xlsService",inject(function(utilService, xlsService) {
        spyOn(utilService, 'prepareMixedTableData').and.returnValue({});
        spyOn(xlsService, 'exportCSVFromMixedTable');
        var searchController= $controller('SearchController',{$scope:$scope});
        searchController.filters = {selectedPrimaryFilter: {data: {}, value: []} };
        searchController.downloadCSV();

        expect(xlsService.exportCSVFromMixedTable).toHaveBeenCalled();
        expect(utilService.prepareMixedTableData).toHaveBeenCalled();
    }));

    it('downloadXLS should prepare mixedTable and call out to xlsService', inject(function(utilService, xlsService) {
        spyOn(utilService, 'prepareMixedTableData').and.returnValue({});
        spyOn(xlsService, 'exportXLSFromMixedTable');
        var searchController= $controller('SearchController',{$scope:$scope});
        searchController.filters = {selectedPrimaryFilter: {data: {}} };
        searchController.downloadXLS();

        expect(xlsService.exportXLSFromMixedTable).toHaveBeenCalled();
        expect(utilService.prepareMixedTableData).toHaveBeenCalled();
    }));

});
