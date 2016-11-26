'use strict';

describe('filterUtils', function(){
    var filterUtils;

    beforeEach(module('owh'));

    beforeEach(inject(function ($injector) {
        filterUtils = $injector.get('filterUtils');
    }));

    describe('test getBridgeDataFilters', function() {
        it('when I call getBridgeDataFilters, I should get bridge race filters', function () {
            var bridgeRaceFilters = filterUtils.getBridgeDataFilters();
            expect(bridgeRaceFilters[0].key).toEqual('current_year');
            expect(bridgeRaceFilters[1].key).toEqual('sex');
            expect(bridgeRaceFilters[2].key).toEqual('agegroup');
            expect(bridgeRaceFilters[3].key).toEqual('race');
        });

        it('should provide me correct slider intervals', function () {

            var bridgeRaceFilters = filterUtils.getBridgeDataFilters();
            filterUtils.ageSliderOptions.callback('5;19');

            var agegroupFilter = utils.findByKeyAndValue(bridgeRaceFilters, 'key', 'agegroup');
            expect(agegroupFilter.value).toEqual([ '5-9 years', '10-14 years', '15-19 years', 'Age not stated' ]);
        });
    });
});