'use strict';

/*group of common test goes here as describe*/
describe('search factory ', function(){
    var searchFactory, utils, $rootScope, $scope, controllerProvider, searchService, deferred, $q,
        primaryFilter, $httpBackend, $templateCache, filters, countsMortalityAutoCompletes,
        searchResponse, groupGenderResponse, genderGroupHeaders, fourGroupsResponse,
        ModalService, givenModalDefaults, elementVisible, thenFunction, closeDeferred, uploadImageDeferred, $timeout;
    module.sharedInjector();

    beforeAll(module('owh'));

    beforeAll(module('app/partials/expandedGraphModal.html'));

    beforeAll(inject(function ($injector, _$rootScope_, $controller, _$q_, _$templateCache_, _SearchService_, _ModalService_, _$timeout_) {
        controllerProvider = $controller;
        $rootScope  = _$rootScope_;
        $scope = $rootScope.$new();
        $templateCache = _$templateCache_;
        searchFactory = $injector.get('searchFactory');
        utils = $injector.get('utilService');
        $httpBackend = $injector.get('$httpBackend');
        searchService = _SearchService_;
        ModalService = _ModalService_;
        $timeout = _$timeout_;

        $q = _$q_;
        closeDeferred = _$q_.defer();
        uploadImageDeferred = _$q_.defer();

        $templateCache.put('app/partials/marker-template.html', 'app/partials/marker-template.html');
        $templateCache.put('app/modules/home/home.html', 'app/modules/home/home.html');
        //$templateCache.put('app/partials/expandedGraphModal.html', 'app/partials/expandedGraphModal.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));

        filters = searchFactory.getAllFilters();

        countsMortalityAutoCompletes = __fixtures__['app/modules/search/fixtures/search.factory/countsMortalityAutoCompletes'];

        searchResponse = __fixtures__['app/modules/search/fixtures/search.factory/searchResponse'];
        groupGenderResponse = __fixtures__['app/modules/search/fixtures/search.factory/groupGenderResponse'];
        fourGroupsResponse = __fixtures__['app/modules/search/fixtures/search.factory/fourGroupsResponse'];

        genderGroupHeaders = __fixtures__['app/modules/search/fixtures/search.factory/genderGroupHeaders'];
        spyOn(ModalService, 'showModal').and.callFake(function(modalDefaults){
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
        });
        spyOn(searchService, 'uploadImage').and.returnValue(uploadImageDeferred.promise);
    }));

    it('showPhaseTwoModal', function () {
        searchFactory.showPhaseTwoModal('Sample message');
        var ctrl = controllerProvider(givenModalDefaults.controller, { $scope: $scope, close: closeDeferred.promise});
        expect(ctrl.message).toEqual('Sample message');
        ctrl.element = givenModalDefaults.element;
        thenFunction(ctrl);
        expect(elementVisible).toBeTruthy();
        closeDeferred.resolve({});
        $scope.$apply();
        expect(elementVisible).toBeFalsy();
    });

    it('uploadImage', function () {
        searchFactory.uploadImage('Sample data').then(function(data) {
            expect(data).toEqual('Response data')
        });
        uploadImageDeferred.resolve({data: 'Response data'});
        $scope.$apply();
    });

    it('updateFilterValues should add proper values to the value array on primaryFilter', function () {
        var primaryFilter = angular.copy(filters.search[0]);
        var yearFilter = primaryFilter.sideFilters[0];
        yearFilter.filters.groupBy = 'row';
        yearFilter.filters.value.push('2013');
        searchFactory.updateFilterValues(primaryFilter);

        expect(primaryFilter.value[0].key).toEqual('year');
        expect(primaryFilter.value[0].value.length).toEqual(2);
        expect(primaryFilter.value[0].value[0]).toEqual('2014');
    });

    it('updateFilterValues should work with filterGroups', function () {
        var primaryFilter = angular.copy(filters.search[0]);
        var yearFilter = primaryFilter.sideFilters[0];
        yearFilter.groupBy = 'row';
        yearFilter.filters.value.push('2013');
        yearFilter.filterGroup = true;
        yearFilter.filters = [angular.copy(yearFilter.filters)];
        searchFactory.updateFilterValues(primaryFilter);

        expect(primaryFilter.value[0].key).toEqual('year');
        expect(primaryFilter.value[0].value.length).toEqual(2);
        expect(primaryFilter.value[0].value[0]).toEqual('2014');
        expect(primaryFilter.value[0].value[1]).toEqual('2013');
    });

    describe('test with mortality data', function () {
        beforeAll(function() {
            primaryFilter = filters.search[0];
            filters.selectedPrimaryFilter = primaryFilter;
        });
        beforeEach(function() {
            deferred = $q.defer();
        });

        it('searchMortalityResults without year autocompleters', function () {
            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.data)).toEqual(JSON.stringify(searchResponse.data.resultData.nested.table));
            });
            deferred.resolve(searchResponse);
            $scope.$apply();
        });

        it('getAllFilters', function () {
            expect(primaryFilter.key).toEqual('deaths');
        });

        it('addCountsToAutoCompleteOptions', function () {
            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            searchFactory.addCountsToAutoCompleteOptions(primaryFilter);
            deferred.resolve(countsMortalityAutoCompletes);
            $scope.$apply();
            var yearFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
            expect(yearFilter.autoCompleteOptions.length).toEqual(5);
            expect(yearFilter.autoCompleteOptions[0].count).toEqual(2630800);
        });

        it('searchMortalityResults', function () {
            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.data)).toEqual(JSON.stringify(searchResponse.data.resultData.nested.table));
            });
            deferred.resolve(searchResponse);
            $scope.$apply();
        });

        it('searchMortalityResults with only one row group', function () {
            var genderFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'gender');
            genderFilter.groupBy = false;

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.chartDataFromAPI)).toEqual(JSON.stringify(searchResponse.data.resultData.simple));
            });
            deferred.resolve(searchResponse);
            $scope.$apply();

            genderFilter.groupBy = 'column';
        });

        it('searchMortalityResults with only one column group', function () {
            var raceFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'race');
            raceFilter.groupBy = false;

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.headers)).toEqual(JSON.stringify(genderGroupHeaders));
            });
            deferred.resolve(groupGenderResponse);
            $scope.$apply();

            raceFilter.groupBy = 'row';
        });

        it('searchMortalityResults with no groups', function () {
            var genderFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'gender');
            genderFilter.groupBy = false;
            primaryFilter.showMap = false;
            var raceFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'race');
            raceFilter.groupBy = 'other';

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.maps)).toEqual(JSON.stringify(searchResponse.data.resultData.nested.maps));
            });
            deferred.resolve(searchResponse);
            $scope.$apply();

            primaryFilter.showMap = true;
            genderFilter.groupBy = 'column';
            raceFilter.groupBy = 'row';
        });

        it('searchMortalityResults with four groups', function () {
            var autopsyFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'autopsy');
            autopsyFilter.groupBy = 'row';
            var yearFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
            autopsyFilter.groupBy = 'column';

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(primaryFilter.searchCount).toEqual(fourGroupsResponse.pagination.total);
            });
            deferred.resolve(fourGroupsResponse);
            $scope.$apply();

            autopsyFilter.groupBy = false;
            yearFilter.groupBy = false;
        });

        it('ageSliderOptions onstatechange', function () {
            filters.ageSliderOptions.onstatechange('0;10');
            var agegroupFilter = utils.findByKeyAndValue(filters.allMortalityFilters, 'key', 'agegroup');
            expect(agegroupFilter.value).toEqual([ '01-06', '07-07', '27-27' ]);
        });

        it('ageSliderOptions onstatechange selectedPrimaryFilter initiated', function () {
            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            filters.selectedPrimaryFilter.initiated = true;
            filters.ageSliderOptions.onstatechange('0;104');
            var agegroupFilter = utils.findByKeyAndValue(filters.allMortalityFilters, 'key', 'agegroup');
            $timeout.flush();
            expect(agegroupFilter.timer).toBeUndefined();
            filters.selectedPrimaryFilter.initiated = false;
        });
    });

    describe('test with yrbs data', function () {
        var yrbsResponse, raceNoValueHeaders, yrbsChart1Deferred, yrbsChart2Deferred, yrbsChart3Deferred,
            yrbsGradePieChartResponse, yrbsRacePieChartResponse, yrbsGenderAndRaceBarChartResponse;
        beforeAll(function() {
            primaryFilter = filters.search[1];
            filters.selectedPrimaryFilter = primaryFilter;
            yrbsResponse = __fixtures__['app/modules/search/fixtures/search.factory/yrbsResponse'];
            raceNoValueHeaders = __fixtures__['app/modules/search/fixtures/search.factory/raceNoValueHeaders'];
            yrbsGradePieChartResponse = __fixtures__['app/modules/search/fixtures/search.factory/yrbsGradePieChartResponse'];
            yrbsRacePieChartResponse = __fixtures__['app/modules/search/fixtures/search.factory/yrbsRacePieChartResponse'];
            yrbsGenderAndRaceBarChartResponse = __fixtures__['app/modules/search/fixtures/search.factory/yrbsGenderAndRaceBarChartResponse'];
        });
        beforeEach(function() {
            deferred = $q.defer();
            yrbsChart1Deferred = $q.defer();
            yrbsChart2Deferred = $q.defer();
            yrbsChart3Deferred = $q.defer();
        });
        it('getAllFilters', function () {
            expect(primaryFilter.key).toEqual('mental_health');
        });

        it('searchYRBSResults', function () {
            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.data)).toEqual(JSON.stringify(yrbsResponse.data.table));
            });
            deferred.resolve(yrbsResponse);
            $scope.$apply();
        });

        it('searchYRBSResults with only one row group having no value', function () {
            var raceFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsRace');
            raceFilter.groupBy = 'row';
            raceFilter.value = '';

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(JSON.stringify(primaryFilter.headers)).toEqual(JSON.stringify(raceNoValueHeaders));
            });
            deferred.resolve(yrbsResponse);
            $scope.$apply();

            raceFilter.groupBy = 'column';
            raceFilter.value = 'all-races-ethnicities';
        });

        it('searchYRBSResults with only one row and one column group', function () {
            var genderFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsSex');
            genderFilter.groupBy = 'column';

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(primaryFilter.headers.columnHeaders.length).toEqual(2);
            });
            deferred.resolve(yrbsResponse);
            $scope.$apply();

            genderFilter.groupBy = false;
        });

        it('searchYRBSResults with only one row and one column group with out all value', function () {
            var genderFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsSex');
            genderFilter.groupBy = 'column';

            var raceFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsRace');
            raceFilter.value = 'ai_an';

            var yearFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
            yearFilter.value = ['2015', '2013'];

            spyOn(searchService, 'searchResults').and.returnValue(deferred.promise);
            primaryFilter.searchResults(primaryFilter).then(function() {
                expect(primaryFilter.headers.columnHeaders[0].key).toEqual('yrbsSex');
            });
            deferred.resolve(yrbsResponse);
            $scope.$apply();

            genderFilter.groupBy = false;
            raceFilter.value = 'all-races-ethnicities';
            raceFilter.value = ['2015'];
        });

        it('searchYRBSResults with only one row and one column group with out all value', function () {
            var index = 0;
            spyOn(searchService, 'searchResults').and.callFake(function(){
                index++;
                if(index === 1) {
                    return yrbsChart1Deferred.promise
                } else if(index === 2) {
                    return yrbsChart2Deferred.promise
                } else {
                    return yrbsChart3Deferred.promise
                }
            });

            var questionFilter = utils.findByKeyAndValue(primaryFilter.allFilters, 'key', 'question');
            questionFilter.onIconClick(questionFilter.autoCompleteOptions[0].title);
            yrbsChart1Deferred.resolve(yrbsGradePieChartResponse);
            yrbsChart2Deferred.resolve(yrbsRacePieChartResponse);
            yrbsChart3Deferred.resolve(yrbsGenderAndRaceBarChartResponse);
            $scope.$apply();

        });

    });
});
