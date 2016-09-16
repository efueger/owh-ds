'use strict';

describe('xlsService', function(){
    var xlsService;

    beforeEach(module('owh'));

    beforeEach(inject(function ($injector) {
        xlsService = $injector.get('xlsService');
    }));

    describe('getSheetFromArray', function() {
        it('should return proper xls worksheet object', function () {
            var sheetArray = [[{title: 1}, {title: 2}, {title: 3}], [{title: 'data1'}, null, {title: 'data3'}], [{title: 'data4'}, {title: 'data5'}, {title: 'data6'}]];
            var ws = xlsService.getSheetFromArray(sheetArray);

            expect(ws['A1'].v).toEqual(1);
            expect(ws['B2']).toBeUndefined();
            expect(ws['C3'].v).toEqual('data6');
        });

        it('should properly account for horizontally merged cells', function () {
            /*
            [   1   ]
            [2][3][4]
             */
            var sheetArray = [[{title: 1, colspan: 3, rowspan: 1}], [{title: 2, colspan: 1, rowspan: 1}, {title: 3, colspan: 1, rowspan: 1}, {title: 4, colspan: 1, rowspan: 1}]];
            var ws = xlsService.getSheetFromArray(sheetArray);

            var mergedCell = {s: {c: 0, r: 0}, e: {c: 2, r: 0}};
            expect(ws['!merges']).toContain(mergedCell);
        });

        it('should properly account for vertically merged cells', function () {
           /*
            |  |[2]
            | 1|[3]
            |  |[4]
             */
            var sheetArray = [[{title: 1, colspan: 1, rowspan: 3}, {title: 2, colspan: 1, rowspan: 1}], [{title: 3, colspan: 1, rowspan: 1}], [{title: 4, colspan: 1, rowspan: 1}]];
            var ws = xlsService.getSheetFromArray(sheetArray);

            var mergedCell = {s: {c: 0, r: 0}, e: {c: 0, r: 2}};
            expect(ws['!merges']).toContain(mergedCell);
        });
    });

    it('getSheetArrayFromMixedTable should return the proper sheet json from a mixed table object', function () {
        var mixedTable = {
            headers: [[{title: 'header1', colspan: 1, rowspan: 1}, {title: 'header2', colspan: 1, rowspan: 1}]],
            data: [
              [{title: 'data1', colspan: 1, rowspan: 1}, {title: 'data2', colspan: 1, rowspan: 1}],
              [{title: 'data3', colspan: 1, rowspan: 1}, {title: 'data4', colspan: 1, rowspan: 1}]
            ]
        };
        var sheetArray = xlsService.getSheetArrayFromMixedTable(mixedTable);

        expect(sheetArray[0]).toEqual([{title: 'header1', colspan: 1, rowspan: 1}, {title: 'header2', colspan: 1, rowspan: 1}]);
        expect(sheetArray[2]).toEqual([{title: 'data3', colspan: 1, rowspan: 1}, {title: 'data4', colspan: 1, rowspan: 1}]);
    });

    describe('getCSVFromSheet', function () {
        it('should return the proper csv string from xls worksheet object', function () {
            var ws = {'A1': {v: 1, t: 'n'}, 'A2': {v: 'test', t: 's'}, '!ref': 'A1:A2'};
            var csv = xlsService.getCSVFromSheet(ws);

            expect(csv).toEqual('1\ntest\n');
        });

        it('should repeat horizontally merged cells in the csv', function () {
            /*
              [   1   ]
              [2][3][4]
             */
            var ws = {'A1': {v: 1, t: 'n'}, 'A2': {v: 2, t: 'n'}, 'B2': {v: 3, t: 'n'}, 'C2': {v: 4, t: 'n'}, '!ref': 'A1:C2', '!merges': [{s: {c: 0, r: 0}, e: {c: 2, r: 0}}]};
            var csv = xlsService.getCSVFromSheet(ws, [[]]);

            expect(csv).toEqual('1,1,1\n2,3,4\n');
        });

        it('should repeat vertically merged cells in the csv', function () {
            /*
             |  |[2]
             | 1|[3]
             |  |[4]
             */
            var ws = {'A1': {v: 1, t: 'n'}, 'B1': {v: 2, t: 'n'}, 'B2': {v: 3, t: 'n'}, 'B3': {v: 4, t: 'n'}, '!ref': 'A1:B3', '!merges': [{s: {c: 0, r: 0}, e: {c: 0, r: 2}}]};
            var csv = xlsService.getCSVFromSheet(ws, [[], [], []]);

            expect(csv).toEqual('1,2\n1,3\n1,4\n');
        });

        it('should repeat merged cells marked as row headers without repeating data cells', function () {
            /*
            [1][2][3][ 9]
            | |[4][5][10]
            |a|[6][7][11]
            | |[  8 ][12]
             */
            var ws = {
                'A1': {v: 1, t: 'n'},
                'B1': {v: 2, t: 'n'},
                'C1': {v: 3, t: 'n'},
                'D1': {v: 9, t: 'n'},
                'A2': {v: 'a', t: 's'},
                'B2': {v: 4, t: 'n'},
                'C2': {v: 5, t: 'n'},
                'D2': {v: 10, t: 'n'},
                'B3': {v: 6, t: 'n'},
                'C3': {v: 7, t: 'n'},
                'D3': {v: 11, t: 'n'},
                'B4': {v: 8, t: 'n'},
                'D4': {v: 12, t: 'n'},
                '!ref': 'A1:D4',
                '!merges': [{s: {c: 0, r: 1}, e: {c: 0, r: 3}}, {s: {c: 1, r: 3}, e: {c: 2, r: 3}}]
            }
            var csv = xlsService.getCSVFromSheet(ws, [[]], [{}, {}]);

            expect(csv).toEqual('1,2,3,9\na,4,5,10\na,6,7,11\na,8,,12\n');
        })
    });

    it('exportCSVFromMixedTable should call out to saveAs with the proper filename', function () {
        spyOn(window, 'saveAs');
        var mixedTable = {
            headers: [[{title: 'header1', colspan: 1, rowspan: 1}, {title: 'header2', colspan: 1, rowspan: 1}]],
            data: [
                [{title: 'data1', colspan: 1, rowspan: 1}, {title: 'data2', colspan: 1, rowspan: 1}],
                [{title: 'data3', colspan: 1, rowspan: 1}, {title: 'data4', colspan: 1, rowspan: 1}]
            ]
        };
        var filename = 'testname';
        xlsService.exportCSVFromMixedTable(mixedTable, filename);

        expect(window.saveAs).toHaveBeenCalled();
        expect(window.saveAs.calls.argsFor(0)[1]).toEqual(filename + '.csv');
    });

    it('exportXLSFromMixedTable should call out to saveAs with the proper filename', function () {
        spyOn(window, 'saveAs');
        var mixedTable = {
            headers: [[{title: 'header1', colspan: 1, rowspan: 1}, {title: 'header2', colspan: 1, rowspan: 1}]],
            data: [
                [{title: 'data1', colspan: 1, rowspan: 1}, {title: 'data2', colspan: 1, rowspan: 1}],
                [{title: 'data3', colspan: 1, rowspan: 1}, {title: 'data4', colspan: 1, rowspan: 1}]
            ]
        };
        var filename = 'testnameXLS';
        xlsService.exportXLSFromMixedTable(mixedTable, filename);

        expect(window.saveAs).toHaveBeenCalled();
        expect(window.saveAs.calls.argsFor(0)[1]).toEqual(filename + '.xlsx');
    });

});
