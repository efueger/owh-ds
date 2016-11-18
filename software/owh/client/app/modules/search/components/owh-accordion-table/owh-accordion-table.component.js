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
        oatc.categoryFilter = null;

        var questionDefaults = {
            "Tobacco Use": [/^Currently Used E/, /^Currently Used C/], // SP
            "Unintentional Injuries and Violence": [/^Seriously/, /^Rode with/],
            "Alcohol and Other Drug Use": [/^Currently D/, /^Currently U/],
            "Sexual Behaviors": [/^Were/, /^Did/],
            "Physical Activity": [/^Watched/, /^Did/],
            "Obesity, Overweight, and Weight Control": [/^Had/, /^Were/],
            "Dietary Behaviors": [/^Drank A Can, Bottle, Or Glass Of A/, /^Drank A Can, Bottle, Or Glass Of S/],
            "Other Health Topics": [/^Did Not H/, /^Did Not S/]
        };

        oatc.collapseRow = function(row) {
            row.collapse = true;
        };

        oatc.expandRow = function(row) {
            row.collapse = false;
        };

        oatc.toggleRowCollapse = function(row) {
            if(row.collapse) {
                oatc.expandRow(row);
            } else {
                oatc.collapseRow(row);
            }
        };

        oatc.showMore = function(row) {
            row.hide = false;
        };

        oatc.showLess = function(row) {
            row.hide = true;
        };

        oatc.filterCategory = function(value, index, array) {
            if (oatc.categoryFilter == null) {
                return true;
            } else if (value == oatc.categoryFilter) {
                return true;
            } else {
                return false;
            }
        }

        oatc.showOnly = function(category) {
            oatc.categoryFilter = category;
        };

        oatc.listRows = function(catagory) {
            var rows = [], firstRow = null;

            if (catagory.title in questionDefaults) {


                for (var i = 0; i < catagory.questions.length; i++) {
                    var question = catagory.questions[i],
                        defaults = questionDefaults[catagory.title];

                    if (question[0].title.search(defaults[0]) == 0) {
                        firstRow = question;

                    } else if (question[0].title.search(defaults[1]) == 0) {
                        rows.splice(0, 0, question);

                    } else {
                        rows.push(question);
                    }
                }
            }
            if (firstRow != null) {
                rows.splice(0, 0, firstRow);
            }
            return rows;
        };

    }
}());
