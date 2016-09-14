'use strict';

describe('xlsService', function(){
    var xlsService;

    beforeEach(module('owh'));

    beforeEach(inject(function ($injector) {
        xlsService = $injector.get('xlsService');
    }));

    it('getSheetFromArray should return proper xls worksheet object', function () {
        var sheetArray = [[1, 2, 3], ['data1', null, 'data3'], ['data4', 'data5', 'data6']];
        var ws = xlsService.getSheetFromArray(sheetArray);

        expect(ws['A1'].v).toEqual(1);
        expect(ws['B2']).toBeUndefined();
        expect(ws['C3'].v).toEqual('data6');
    });

    it('getSheetArrayFromMixedTable should return the proper sheet json from a mixed table object', function () {
        var mixedTable = {
            headers: [[{title: 'header1'}, {title: 'header2'}]],
            data: [
              [{title: 'data1'}, {title: 'data2'}],
              [{title: 'data3'}, {title: 'data4'}]
            ]
        };
        var sheetArray = xlsService.getSheetArrayFromMixedTable(mixedTable);

        expect(sheetArray[0]).toEqual(['header1', 'header2']);
        expect(sheetArray[2]).toEqual(['data3', 'data4']);
    });

    it('getCSVFromSheet should return the proper csv string from xls worksheet object', function () {
        var ws = {'A1': {v: 1, t: 'n'}, 'A2': {v: 'test', t: 's'}, '!ref': 'A1:A2'};
        var csv = xlsService.getCSVFromSheet(ws);

        expect(csv).toEqual('1\ntest\n');
    })

});
