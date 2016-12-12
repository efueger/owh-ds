'use strict';
(function(){
    angular
        .module('owh')
        .component("owhTree",{
            templateUrl: 'app/components/owh-tree/owhTree.html',
            controller: TreeController,
            controllerAs: 'tc',
            bindings:{
                codeKey : "=",
                optionValues : "=",
                entityName : "=",
                submitClose : '&'
            }
        });

    TreeController.$inject=['$scope','$compile','$timeout','utilService'];

    function TreeController($scope, $compile, $timeout, utilService){
        var tc = this;
        tc.ac = function(){
            return true;
        };

        tc.treeConfig = {
            core : {
                error: function(error) {
                    console.log('sideFilterController: error from js tree - ' + angular.toJson(error));
                },
                'themes':{
                    "theme" : "expand_collapse",
                    "icons":false
                },
                expand_selected_onload:true,
                multiple:true,
                get_selected:true
            },
            "search": {
                "show_only_matches" : true
            },
            plugins : [ "search", "themes" ]

        };

        tc.treeEventsObj = {
            'select_node': selectedNodeCB,
            'ready': readyCB,
            'deselect_node': deSelectedNodeCB
        };

        /*onReady select the default selected causes*/
        function readyCB() {
            angular.forEach(tc.optionValues,function(value, index){
                tc.treeInstance.jstree('select_node', value.id);
            });
        }

        /*onSelecting causes update the values with selected causes*/
        function selectedNodeCB(obj) {
            selectCodes(obj);
        }

        /*onDeselecting causes update the values with selected causes*/
        function deSelectedNodeCB(obj) {
            selectCodes(obj);
        }

        /*Search js tree */
        tc.searchTree = function(elem) {
            //var to = false;
            //if (to) {
            //    clearTimeout(to);
            //}
            //to =
                $timeout(function () {
                var searchString = jQuery('#search_text').val();
                if(searchString.length>1) {
                    getTreeInstance().search(searchString);
                } else {
                    getTreeInstance().clear_search();
                }
            }, 250);
        };

        /*Helper functions starts*/
        function getTreeInstance() {
            return tc.treeInstance.jstree(true);
        }

        function selectCodes(obj) {
            $timeout(function() {
                tc.selectedNodes =  getTreeInstance().get_selected(true);
                tc.optionValues=[];
                angular.forEach(tc.selectedNodes,function(selectedNode, index){
                    //For YRBS Questions
                    if (tc.entityName == 'Question') {
                        //If user selects leaf node
                        if (selectedNode.children.length == 0 ) {
                            tc.optionValues.push({id:selectedNode.id, text:selectedNode.text});
                        } else {//If user selects parent node
                            //get the node with it's child nodes
                            var parentNode = getTreeInstance().get_json(selectedNode.id);
                            //get all child nodes of a selected node
                            angular.forEach(parentNode.children, function (childNode, index) {
                                tc.optionValues.push({id:childNode.id, text:childNode.text});
                            });
                        }
                    } else {// for mortality MCD/UCD codes
                        var causeObj = {id:selectedNode.id, text:selectedNode.text};
                        tc.optionValues.push(causeObj);
                    }
                });
                tc.selectedNodesText = utilService.getValuesByKey(tc.optionValues, 'text').join(", ");
            },250);
        }
        /*Helper functions Ends*/

    }
}());
