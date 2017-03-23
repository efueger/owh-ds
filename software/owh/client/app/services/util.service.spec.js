'use strict';

/*group of common test goes here as describe*/
describe('utilService', function(){
    var utils, list, tableData, multipleColumnsTableData, noColumnsTableData, noRowsTableData,
        multipleColumnsTableDataWithUnmatchedColumns, singleValuedTableData, $q, $scope;

    beforeEach(module('owh'));

    beforeEach(inject(function ($injector,_$rootScope_, _$state_, _$q_) {
        utils = $injector.get('utilService');
        $q = _$q_;
        $scope= _$rootScope_.$new();
        var $httpBackend = $injector.get('$httpBackend');
        list = [
            {key: '1', title: 'Sunday', show: true},
            {key: '2', title: 'Monday', show: true},
            {key: '3', title: 'Tuesday', show: true},
            {key: '4', title: 'Wednesday'},
            {key: '5', title: 'Thursday'},
            {key: '6', title: 'Friday'},
            {key: '7', title: 'Saturday'},
            {key: '9', title: 'Unknown'}
        ];
        tableData = __fixtures__['app/services/fixtures/util.service/tableData'];

        multipleColumnsTableData = __fixtures__['app/services/fixtures/util.service/multipleColumnsTableData'];

        multipleColumnsTableDataWithUnmatchedColumns = __fixtures__['app/services/fixtures/util.service/multipleColumnsTableDataWithUnmatchedColumns'];

        noColumnsTableData = __fixtures__['app/services/fixtures/util.service/noColumnsTableData'];

        noRowsTableData = __fixtures__['app/services/fixtures/util.service/noRowsTableData'];

        singleValuedTableData = __fixtures__['app/services/fixtures/util.service/noRowsTableData'];

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({});
        $httpBackend.whenGET('app/partials/marker-template.html').respond( {});
        $httpBackend.whenGET('/getFBAppID').respond({});
        $httpBackend.whenGET('/yrbsQuestionsTree/2015').respond({data: { }});
        $httpBackend.whenGET('/pramsQuestionsTree').respond({data: { }});
        $httpBackend.whenGET('app/modules/home/home.html').respond({data: { }});
    }));

    it('test utils isValueNotEmpty for undefined', function () {
        expect(utils.isValueNotEmpty(undefined)).toBeFalsy();
    });

    it('test utils isValueNotEmpty for null', function () {
        expect(utils.isValueNotEmpty(null)).toBeFalsy();
    });

    it('test utils isValueNotEmpty for object', function () {
        expect(utils.isValueNotEmpty({a: 1})).toBeTruthy();
        expect(utils.isValueNotEmpty({})).toBeFalsy();
    });

    it('test utils isValueNotEmpty for array', function () {
        expect(utils.isValueNotEmpty(['1', '2'])).toBeTruthy();
        expect(utils.isValueNotEmpty([])).toBeFalsy();
    });

    it('test utils isValueNotEmpty for string', function () {
        expect(utils.isValueNotEmpty('1')).toBeTruthy();
        expect(utils.isValueNotEmpty('')).toBeFalsy();
    });

    it('test utils isValuesNotEmptyInArray', function () {
        expect(utils.isValuesNotEmptyInArray(['1'])).toBeTruthy();
        expect(utils.isValuesNotEmptyInArray(['1', ''])).toBeTruthy();
        expect(utils.isValuesNotEmptyInArray([])).toBeFalsy();
        expect(utils.isValuesNotEmptyInArray([''])).toBeFalsy();
    });

    it('test utils isDateString', function () {
        expect(utils.isDateString("11/12/2016")).toBeTruthy();
        expect(utils.isDateString("Invalid date")).toBeFalsy();
    });

    it('test utils convertDateToString', function () {
        var result = utils.convertDateToString(new Date('12/12/2015'), 'yyyy-MM-dd');
        expect(result).toEqual('2015-12-12');
    });

    it('test utils formatDateString', function () {
        expect(utils.formatDateString('11/12/2016', 'MM/dd/yyyy', 'yyyy-MM-dd')).toEqual('2016-11-12');
    });

    it('test utils findByKeyAndValue', function () {
        var result = utils.findByKeyAndValue(list, 'title', 'Sunday');
        expect(result).toEqual({key: '1', title: 'Sunday', show: true});
    });

    it('test utils findByKeyAndValue to return null', function () {
        var result = utils.findByKeyAndValue(list, 'title', 'Sunday1');
        expect(result).toEqual(null);
    });

    it('test utils findIndexByKeyAndValue', function () {
        var result = utils.findIndexByKeyAndValue(list, 'title', 'Sunday');
        expect(result).toEqual(0);
    });

    it('test utils findIndexByKeyAndValue to return -1', function () {
        var result = utils.findIndexByKeyAndValue(list, 'title', 'Sunday1');
        expect(result).toEqual(-1);
    });

    it('test utils sortByKey', function () {
        var result = utils.sortByKey(list, 'title');
        expect(result[0].title).toEqual('Friday');
    });

    it('test utils sortByKey asc', function () {
        var result = utils.sortByKey(list, 'title', true);
        expect(result[0].title).toEqual('Friday');
    });

    it('test utils sortByKey desc', function () {
        var result = utils.sortByKey(list, 'title', false);
        expect(result[0].title).toEqual('Wednesday');
    });

    it('test utils sortByKey with key as function', function () {
        var result = utils.sortByKey(list, function(obj) {return obj.title});
        expect(result[0].title).toEqual('Friday');
    });

    it('test utils sortByKey with duplicates in list', function () {
        list.push(list[list.length - 1]);
        var result = utils.sortByKey(list, 'title');
        expect(result[0].title).toEqual('Friday');
    });

    it('test utils sortByKey desc with duplicates in list', function () {
        list.push(list[list.length - 1]);
        var result = utils.sortByKey(list, 'title', false);
        expect(result[0].title).toEqual('Wednesday');
    });

    it('test utils findByKey', function () {
        var result = utils.findByKey(list, 'show');
        expect(result).toEqual({key: '1', title: 'Sunday', show: true});
    });

    it('test utils findByKey to return null', function () {
        var result = utils.findByKey(list, 'title1');
        expect(result).toEqual(null);
    });

    it('test utils findAllByKeyAndValue expecting multiple results', function () {
        var result = utils.findAllByKeyAndValue(list, 'show', true);
        expect(result.length).toEqual(3);
        expect(result[0].key).toEqual('1');
    });

    it('test utils findAllByKeyAndValue expecting single results', function () {
        var result = utils.findAllByKeyAndValue(list, 'title', 'Sunday');
        expect(result).toEqual([{key: '1', title: 'Sunday', show: true}]);
    });

    it('test utils findAllNotContainsKeyAndValue', function () {
        var result = utils.findAllNotContainsKeyAndValue(list, 'show', true);
        expect(result.length).toEqual(5);
        expect(result[0].key).toEqual('4');
    });

    it('test utils findAllByKeyAndValuesArray', function () {
        var result = utils.findAllByKeyAndValuesArray(list, 'key', ['1', '2']);
        expect(result.length).toEqual(2);
        expect(result[0].key).toEqual('1');
    });

    it('test utils updateAllByKeyAndValue', function () {
        var result = utils.findAllByKeyAndValue(list, 'show', true);
        expect(result.length).toEqual(3);

        utils.updateAllByKeyAndValue(list, 'show', true);

        result = utils.findAllByKeyAndValue(list, 'show', true);
        expect(result.length).toEqual(8);
    });

    it('test utils numberWithCommas', function () {
        expect(utils.numberWithCommas(121212)).toEqual("121,212");
    });

    it('test utils getValueFromOptions', function () {
        expect(utils.getValueFromOptions(list, 'key', '1', 'title')).toEqual('Sunday');
        expect(utils.getValueFromOptions(list, 'key', '10', 'title')).toEqual('10');
        expect(utils.getValueFromOptions(list, 'key', '10', 'title', 'Not Specified')).toEqual('Not Specified');
        expect(utils.getValueFromOptions(undefined, 'key', '10', 'title', 'Not Specified')).toEqual('Not Specified');
    });

    it('test utils prepareMixedTableData', function () {
        var result = utils.prepareMixedTableData(tableData.headers, tableData.data, tableData.countKey, tableData.totalCount, tableData.countLabel, tableData.calculatePercentage, tableData.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(tableData.expectedResult));
    });

    it('test utils prepareMixedTableData for multiple column headers', function () {
        var result = utils.prepareMixedTableData(multipleColumnsTableData.headers, multipleColumnsTableData.data, multipleColumnsTableData.countKey, multipleColumnsTableData.totalCount, multipleColumnsTableData.countLabel, multipleColumnsTableData.calculatePercentage, multipleColumnsTableData.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(multipleColumnsTableData.expectedResult));
    });

    it('test utils prepareMixedTableData for multiple column headers with unmatched columns', function () {
        var result = utils.prepareMixedTableData(multipleColumnsTableDataWithUnmatchedColumns.headers,
            multipleColumnsTableDataWithUnmatchedColumns.data, multipleColumnsTableDataWithUnmatchedColumns.countKey,
            multipleColumnsTableDataWithUnmatchedColumns.totalCount, multipleColumnsTableDataWithUnmatchedColumns.countLabel,
            multipleColumnsTableDataWithUnmatchedColumns.calculatePercentage, multipleColumnsTableDataWithUnmatchedColumns.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(multipleColumnsTableDataWithUnmatchedColumns.expectedResult));
    });

    it('test utils prepareMixedTableData for no column headers', function () {
        var result = utils.prepareMixedTableData(noColumnsTableData.headers, noColumnsTableData.data, noColumnsTableData.countKey, noColumnsTableData.totalCount, noColumnsTableData.countLabel, noColumnsTableData.calculatePercentage, noColumnsTableData.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(noColumnsTableData.expectedResult));
    });

    it('test utils prepareMixedTableData for no row headers and with calculatePercentage', function () {
        var result = utils.prepareMixedTableData(noRowsTableData.headers, noRowsTableData.data, noRowsTableData.countKey, noRowsTableData.totalCount, noRowsTableData.countLabel, noRowsTableData.calculatePercentage, noRowsTableData.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(noRowsTableData.expectedResult));
    });

    it('test utils prepareMixedTableData for no row headers and without calculatePercentage', function () {
        var result = utils.prepareMixedTableData(singleValuedTableData.headers, singleValuedTableData.data, singleValuedTableData.countKey, singleValuedTableData.totalCount, singleValuedTableData.countLabel, singleValuedTableData.calculatePercentage, singleValuedTableData.calculateRowTotal);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(singleValuedTableData.expectedResult));
    });

    it('test utils prepareMixedTableData for numbers and percentages', function () {
        //Implementation pending
        var result = utils.prepareMixedTableData(tableData.headers, tableData.data, tableData.countKey,
            tableData.totalCount, tableData.countLabel, tableData.calculatePercentage, tableData.calculateRowTotal);
        expect(result).not.toBe(null);
        expect(JSON.stringify(result)).toEqual(JSON.stringify(tableData.expectedResult));
    });

    it('should not calculate percentages for suppressed counts', function () {
        var tableData = __fixtures__['app/services/fixtures/util.service/mortalitySuppressedCountTable'];
        var result = utils.prepareMixedTableData(tableData.headers, tableData.data,
            'deaths', "suppressed", tableData.countLabel, true, tableData.calculateRowTotal);
        var row = result.data[0];
        expect(row[1].percentage).toEqual(undefined);
        expect(row[2].percentage).toEqual(undefined);
    });

    it('test utils concatenateByKey', function () {
        expect(utils.concatenateByKey(list, 'title', ',')).toEqual("Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Unknown");
        expect(utils.concatenateByKey(list, 'key')).toEqual("1, 2, 3, 4, 5, 6, 7, 9");
    });

    it('test utils getValuesByKeyIncludingKeyAndValue', function () {
        expect(utils.getValuesByKeyIncludingKeyAndValue(list, 'title', 'show', true)).toEqual([ 'Sunday', 'Monday', 'Tuesday' ]);
    });

    it('test utils getValuesByKeyExcludingKeyAndValue', function () {
        expect(utils.getValuesByKeyExcludingKeyAndValue(list, 'title', 'show', true)).toEqual([ 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Unknown' ]);
    });

    it('test utils getMinAndMaxValue', function () {
        expect(utils.getMinAndMaxValue([3, 1, 7, 2, 9, 5])).toEqual({ minValue: 1, maxValue: 9 });
    });

    it('test utils generateMapLegendLabels', function () {
        expect(utils.generateMapLegendLabels(10000, 70000)).toEqual([ '> 64,000', '> 58,000', '> 52,000', '> 46,000', '> 40,000', '> 34,000', '> 28,000', '> 22,000', '> 16,000', '> 10,000', '< 10,000' ]);
        expect(utils.generateMapLegendLabels(10000, 10490)).toEqual([ '> 10,900', '> 10,800', '> 10,700', '> 10,600', '> 10,500', '> 10,400', '> 10,300', '> 10,200', '> 10,100', '> 10,000', '< 10,000' ]);
    });

    it('refreshFilterAndOptions options should set filter option correctly ', inject(function(SearchService) {
        var deferred = $q.defer();
        var filters= [
            {
                filterGroup: false, collapse: false, allowGrouping: true, groupBy:"row",
                filters: {key: 'year', title: 'label.filter.year', queryKey:"year", primary: false, value: [2000, 2014], groupBy: 'row',
                    type:"label.filter.group.year", showChart: true, defaultGroup:"column",
                    autoCompleteOptions: []}
            },
            {
                filterGroup: false, collapse: false, allowGrouping: true, groupBy:false,
                filters: {key: 'race', title: 'label.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'row',
                    type:"label.filter.group.demographics", showChart: true, defaultGroup:"column",
                    autoCompleteOptions: [{key:'White','title':'White'}]}
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
            },
            {
                filterGroup: false, collapse: false, allowGrouping: true, groupBy:false,
                filters: {key: 'ethnicity', title: 'label.filter.ethnicity', queryKey:"ethnicity", primary: false, value: ['Hispanic'], groupBy: 'row',
                    type:"label.filter.group.ethnicity", showChart: true, defaultGroup:"column",
                    autoCompleteOptions: [{key:'Hispanic','title':'Hispanic'},{key:'Non-Hispanic','title':'Non-Hispanic'}]}
            }
        ];

        spyOn(SearchService, 'getDsMetadata').and.returnValue(deferred.promise);

        utils.refreshFilterAndOptions({ queryKey: "year", value: ["2000"]}, filters, 'deaths');
        expect(SearchService.getDsMetadata).toHaveBeenCalledWith("deaths","2000");
        deferred.resolve({"status":"OK","data":{"sex":["M"],"ethnicity":[]}});
        $scope.$apply();
        expect(filters[0].disabled).toBeFalsy();
        expect(filters[0].groupBy).toEqual("row");
        expect(filters[1].disabled).toBeTruthy();
        expect(filters[1].groupBy).toBeFalsy();
        expect(filters[2].disabled).toBeFalsy();
        expect(filters[2].filters.autoCompleteOptions[0].disabled).toBeTruthy();
        expect(filters[2].filters.autoCompleteOptions[1].disabled).toBeFalsy();
        expect(filters[3].disabled).toBeFalsy();
    }));
});
