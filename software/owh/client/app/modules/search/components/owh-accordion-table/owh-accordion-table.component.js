'use strict';
(function() {
    angular
        .module('owh.search')
        .component('owhAccordionTable', {
            templateUrl: 'app/modules/search/components/owh-accordion-table/owhAccordionTable.html',
            controller: OWHAccordionTableController,
            controllerAs: 'oatc',
            bindings: {
                data: '<',
                headers: '<'
            }
        });
    OWHAccordionTableController.$inject = ['$scope', 'utilService', '$rootScope'];
    function OWHAccordionTableController($scope, utilService, $rootScope) {
        var oatc = this;

        oatc.headers = [[{"colspan":1,"rowspan":1,"title":"Question"},{"title":"American Indian or Alaska Native","colspan":1,"rowspan":1,"isData":true},{"title":"Asian","colspan":1,"rowspan":1,"isData":true},{"title":"Black or African American","colspan":1,"rowspan":1,"isData":true},{"title":"Hispanic or Latino","colspan":1,"rowspan":1,"isData":true},{"title":"Native Hawaiian or Other Pacific Islander","colspan":1,"rowspan":1,"isData":true},{"title":"White","colspan":1,"rowspan":1,"isData":true},{"title":"Multiple Race","colspan":1,"rowspan":1,"isData":true},{"title":"Total","colspan":1,"rowspan":1,"isData":true}]];

        oatc.data = [];
        var categories = 5;
        var questions = 6;
        for(var i = 0; i < categories; i++) {
            var category = {title: 'Test category ' + i, questions: [], hide: true};

            for(var j = 0; j < questions; j++) {
                var question = [];
                question.push({title: "Test question " + i + '' + j, colspan: 1, rowspan: 1});
                for(var k = 0; k < oatc.headers[oatc.headers.length - 1].length - 1; k++) {
                    question.push({title: Math.random().toString(), colspan: 1, rowspan: 1});
                }
                category.questions.push(question);
            }
            oatc.data.push(category);
        }

        oatc.collapseRow = function(row) {
            row.collapse = true;
        };

        oatc.expandRow = function(row) {
            row.collapse = false;
        };

        oatc.showMore = function(row) {
            row.hide = false;
        };

        oatc.showLess = function(row) {
            row.hide = true;
        };

    }
}());
