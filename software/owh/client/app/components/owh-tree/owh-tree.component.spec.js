'use strict';

describe('owhTree component: ', function() {
    var $rootScope, $injector, $templateCache, $scope;
    var $httpBackend, $compile, $http, $componentController;


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
        });
        $templateCache.put('app/partials/marker-template.html', 'app/partials/marker-template.html');
        $templateCache.put('app/partials/home/home.html', 'app/partials/home/home.html');
        $templateCache.put('app/partials/owhTree.html', 'app/partials/owhTree.html');

        $httpBackend.whenGET('app/i18n/messages-en.json').respond({ hello: 'World' });
        $httpBackend.whenGET('app/partials/marker-template.html').respond( $templateCache.get('app/partials/marker-template.html'));
        $httpBackend.whenGET('app/partials/owhTree.html').respond( $templateCache.get('app/partials/owhTree.html'));


    });


    it('Should render the tree ', inject(function(){
        var element = angular.element('<owh-tree code-key="codeKey" option-values="optionValues"></owh-tree>');
        element = $compile(element)($scope);
        $scope.optionValue = [{"key": "Y455", "title": "4-Aminophenol derivatives (Y45.5)"},
            {"key": "Q991", "title": "46,XX true hermaphrodite (Q99.1)"}
        ];
        $scope.codeKey = "ucd-chapter-10";
        $scope.$apply();
        var ucd_tree = element.find("div#ucd-chapter-10");
        expect(ucd_tree).toBeDefined();
    }));

    it('Should have controller', inject(function ($httpBackend, $location) {
        var bindings = {};
        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);
        expect(ctrl).toBeDefined();
    }));

    it('Should call ac function', inject(function ($httpBackend, $location) {
        var bindings = {};
        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);
        expect(ctrl.ac()).toBe(true);
    }));

    it('Should call error function', inject(function ($httpBackend, $location) {
        var ctrl = $componentController('owhTree', {$scope: $scope}, null);
        expect(ctrl.treeEventsObj).toBeDefined();
        ctrl.treeConfig.core.error({});
    }));


    it('Should call JSTREE call back functions', inject(function ($httpBackend, $location) {
        var optionValues = [{"key": "Y455", "title": "4-Aminophenol derivatives (Y45.5)"},
            {"key": "Q991", "title": "46,XX true hermaphrodite (Q99.1)"}
        ];
        var codeKey = 'ucd-chapter-10';
        var bindings = {optionValues: optionValues, codeKey: codeKey};

        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);
        expect(ctrl.treeEventsObj).toBeDefined();
        ctrl.treeInstance = {jstree:function(){}};
        ctrl.treeEventsObj.ready();
    }));

    it('Should call select call back functions', inject(function ($timeout) {
        var optionValues = [
            {"id": "Y455", "text": "4-Aminophenol derivatives (Y45.5)"}
        ];
        var codeKey = 'ucd-chapter-10';
        var bindings = {optionValues: optionValues, codeKey: codeKey};
        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);
        expect(ctrl.treeEventsObj).toBeDefined();

        /*Dummy jstree object*/
        ctrl.treeInstance = {jstree:function(){
            return  {
                get_selected:function() {
                    return [{"id": "Q991", "text": "46,XX true hermaphrodite (Q99.1)"}]
                }
            }
        }};
        ctrl.treeEventsObj.select_node({});
        ctrl.treeEventsObj.deselect_node({});

        // flush timeout(s) for all code under test.
        $timeout.flush();
        expect(ctrl.selectedNodesText).toEqual("46,XX true hermaphrodite (Q99.1)");
    }));

    it('Should call search function', inject(function ($timeout) {
        var optionValues = [
            {"id": "Y455", "text": "4-Aminophenol derivatives (Y45.5)"}
        ];
        var codeKey = 'ucd-chapter-10';
        var bindings = {optionValues: optionValues, codeKey: codeKey};

        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);

        var element = angular.element('<input id="search_text" type="text" value="abc"/>');
        element.appendTo(document.body);
        $compile(element)($scope);
        $scope.$digest();

        expect(ctrl.treeEventsObj).toBeDefined();

        /*Dummy jstree object*/
        ctrl.treeInstance = {jstree:function(){
            return  {
                search:function() {
                    return [{"id": "Q991", "text": "46,XX true hermaphrodite (Q99.1)"}]
                },
                clear_search:function () {}
            }
        }};
        ctrl.searchTree({});
        $timeout.flush();
        element.remove();
    }));


    it('Should call jstree clear function', inject(function ($timeout) {
        var optionValues = [
            {"id": "Y455", "text": "4-Aminophenol derivatives (Y45.5)"}
        ];
        var codeKey = 'ucd-chapter-10';
        var bindings = {optionValues: optionValues, codeKey: codeKey};

        var ctrl = $componentController('owhTree', {$scope: $scope}, bindings);

        var element = angular.element('<input id="search_text" type="text"  value="a"/>');
        element.appendTo(document.body);
        $compile(element)($scope);
        $scope.$digest();


        expect(ctrl.treeEventsObj).toBeDefined();

        /*Dummy jstree object*/
        ctrl.treeInstance = {jstree:function(){
            return  {
                search:function() {
                    return [{"id": "Q991", "text": "46,XX true hermaphrodite (Q99.1)"}]
                },
                clear_search:function () {}
            }
        }};

        ctrl.searchTree({});
        $timeout.flush();
    }));

});