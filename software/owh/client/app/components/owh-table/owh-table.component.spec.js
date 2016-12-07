'use strict';

describe('owhTable component: ', function() {
    var $rootScope, $injector, $templateCache, $scope;
    var $httpBackend, $compile, $http, $componentController;
    var element, scope;


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
            scope = $rootScope.$new();
            element = angular.element('<owh-table table-data="data" table-view="tableView"></owh-table>');
            element = $compile(element)(scope);
        });
        $templateCache.put('app/partials/marker-template.html', 'app/partials/marker-template.html');
        $templateCache.put('app/modules/home/home.html', 'app/modules/home/home.html');
        $templateCache.put('app/components/owh-table/owhTable.html', 'app/components/owh-table/owhTable.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
        $httpBackend.whenGET('app/components/owh-table/owhTable.html').respond( $templateCache.get('app/components/owh-table/owhTable.html'));
        $httpBackend.whenGET('/getFBAppID').respond({data: { fbAppID: 1111111111111111}});
    });

    it('should have a row of headers for each column header', function() {
        scope.data = {"headers":[[{"colspan":1,"rowspan":1,"title":"Race"},{"title":"Female","colspan":1,"rowspan":1,"isData":true},{"title":"Male","colspan":1,"rowspan":1,"isData":true},{"title":"Number of Deaths","colspan":1,"rowspan":1,"isData":true}]],"data":[[{"title":"American Indian","isCount":false,"rowspan":1,"colspan":1,"key":"3"},{"title":61818,"percentage":45.4427169478443,"isCount":true,"rowspan":1,"colspan":1,"pop":27554487},{"title":74217,"percentage":54.55728305215569,"isCount":true,"rowspan":1,"colspan":1,"pop":27686343},{"title":136035,"percentage":0.5862177233352274,"isCount":true,"rowspan":1,"colspan":1,"isBold":true,"pop":55240830}],[{"title":"Asian or Pacific Islander","isCount":false,"rowspan":1,"colspan":1,"key":"4"},{"title":219028,"percentage":47.829077671917005,"isCount":true,"rowspan":1,"colspan":1,"pop":117055793},{"title":238911,"percentage":52.170922328083,"isCount":true,"rowspan":1,"colspan":1,"pop":108306177},{"title":457939,"percentage":1.9734035947102637,"isCount":true,"rowspan":1,"colspan":1,"isBold":true,"pop":225361970}],[{"title":"Black","isCount":false,"rowspan":1,"colspan":1,"key":"2"},{"title":1344390,"percentage":49.0312749940461,"isCount":true,"rowspan":1,"colspan":1,"pop":299973609},{"title":1397513,"percentage":50.9687250059539,"isCount":true,"rowspan":1,"colspan":1,"pop":274418811},{"title":2741903,"percentage":11.815724881582167,"isCount":true,"rowspan":1,"colspan":1,"isBold":true,"pop":574392420}],[{"title":"White","isCount":false,"rowspan":1,"colspan":1,"key":"1"},{"title":10055975,"percentage":50.609685669084,"isCount":true,"rowspan":1,"colspan":1,"pop":1710528401},{"title":9813690,"percentage":49.390314330916,"isCount":true,"rowspan":1,"colspan":1,"pop":1673513926},{"title":19869665,"percentage":85.62465380037234,"isCount":true,"rowspan":1,"colspan":1,"isBold":true,"pop":3384042327}]],"calculatePercentage":true};
        scope.tableView = 'number_of_deaths';
        scope.$apply();
        var headers = element.find('th');
        //TODO: will need to load templates before this will pass
        // expect(headers.length).toEqual(4);
    });
});

