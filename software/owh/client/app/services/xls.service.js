(function(){
    'use strict';
    angular
        .module('owh')
        .service('xlsService', xlsService);

    xlsService.$inject = [];

    function xlsService() {
        var service = {
            getSheetFromArray: getSheetFromArray,
            getCSVFromSheet: getCSVFromSheet
        };
        return service;

        //returns xls worksheet from array of json rows
        //ex: [[1, 2, 3], ['data1', null, 'data3']]
        function getSheetFromArray(data) {
            var ws = {};
	          var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	          for(var R = 0; R != data.length; ++R) {
		            for(var C = 0; C != data[R].length; ++C) {
			              if(range.s.r > R) range.s.r = R;
			              if(range.s.c > C) range.s.c = C;
			              if(range.e.r < R) range.e.r = R;
			              if(range.e.c < C) range.e.c = C;
			              var cell = {v: data[R][C] };
			              if(cell.v == null) continue;
			              var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

                		if(typeof cell.v === 'number') cell.t = 'n';
                		else if(typeof cell.v === 'boolean') cell.t = 'b';
                		else if(cell.v instanceof Date) {
                			cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                			cell.v = datenum(cell.v);
                		}
                		else cell.t = 's';

                		ws[cell_ref] = cell;
                }
            }
          	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
          	return ws;
        }

        function getCSVFromSheet(sheet) {
          return XLSX.utils.sheet_to_csv(sheet);
        }
    }
}());
