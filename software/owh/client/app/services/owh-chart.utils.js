(function(){
    'use strict';
    angular
        .module('owh.services')
        .service('chartUtilService', chartUtilService);

    chartUtilService.$inject = ['$dateParser', '$filter', '$translate','utilService', 'ModalService'];

    function chartUtilService( $dateParser, $filter, $translate, utilService, ModalService ) {
        var service = {
            horizontalStack: horizontalStack,
            verticalStack: verticalStack,
            pieChart: pieChart,
            horizontalBar:	horizontalBar,
            verticalBar: verticalBar,
            //bulletBar: bulletBar,
            HorizontalChart : horizontalChart,
            verticalChart : verticalChart,
            showExpandedGraph: showExpandedGraph
        };
        return service;

        function horizontalStack(filter1, filter2, data, primaryFilter, postFixToTooltip) {
            return horizontalChart(filter1, filter2, data, primaryFilter, true, postFixToTooltip);
        }

        function verticalStack(filter1, filter2, data, primaryFilter) {
            return verticalChart(filter1, filter2, data, primaryFilter, true);
        }

        function horizontalBar(filter1, filter2, data, primaryFilter) {
            return horizontalChart(filter1, filter2, data, primaryFilter, false);
        }

        function verticalBar(filter1, filter2, data, primaryFilter) {
            return verticalChart(filter1, filter2, data, primaryFilter, false);
        }

        /*function bulletBar(filter1, filter2, data, primaryFilter) {
            console.log("IN PROGRESS");
        }*/

        /*Multi Bar Horizontal Chart*/
        function horizontalChart(filter1, filter2, data, primaryFilter, stacked, postFixToTooltip) {
            postFixToTooltip = postFixToTooltip ? postFixToTooltip : '';
            var chartData = {
                data: [],
                title: "label.title."+filter1.key+"."+filter2.key,
                options: {
                    "chart": {
                        "type": "multiBarHorizontalChart",
                        "height": 250,
                        "width": 350,
                        "margin": {
                            "top": 5,
                            "right": 5,
                            "bottom": 45,
                            "left": 45
                        },
                        showLegend: false,
                        showControls: false,
                        showValues: false,
                        showXAxis:true,
                        showYAxis:true,
                        stacked: stacked,
                        "duration": 500,
                        x: function(d){return d.label;},
                        y: function(d){return d.value;},
                        "xAxis": {
                            "axisLabelDistance": -20,
                            "axisLabel": $translate.instant(filter2.title),
                            tickFormat:function () {
                                return null;
                            },
                            "showMaxMin": false
                        },
                        "yAxis": {
                            "axisLabel": primaryFilter.chartAxisLabel,
                            tickFormat:function () {
                                return null;
                            }
                        },
                        valueFormat:function (n){
                            if(isNaN(n)){ return n; }
                            return d3.format('d')(n);
                        },
                        useInteractiveGuideline: false,
                        interactive: false,
                        tooltip: {
                            contentGenerator: function(d) {
                                var html = "<div class='usa-grid-full'"+
                                    "<div class='usa-width-one-whole' style='padding: 10px; font-weight: bold'>"+ d.value+"</div>" +
                                    "<div class='usa-width-one-whole nvtooltip-value'>";
                                    d.series.forEach(function(elem){
                                        html += "<i class='fa fa-square' style='color:"+elem.color+"'></i>" +
                                            "&nbsp;&nbsp;&nbsp;"+elem.key+"&nbsp;&nbsp;&nbsp;"+$filter('number')(elem.value) + postFixToTooltip + "</div>";
                                    });
                                    html += "</div>";
                                return html;
                            }
                        }
                    }
                }
            };

            var multiChartBarData = [];
            if(data && data[filter1.key]){
                angular.forEach(utilService.getSelectedAutoCompleteOptions(filter1), function (primaryOption,index) {
                    var primaryDataObj = {};
                    var eachPrimaryData = utilService.findByKeyAndValue(data[filter1.key], 'name', primaryOption.key);

                    primaryDataObj["key"] = primaryOption.title;
                    if(filter1.key === 'gender') {
                        primaryDataObj["color"] = primaryOption.key === 'Male' ?  "#009aff" : "#fe66ff";
                    }
                    primaryDataObj["values"] = [];
                    primaryDataObj[primaryFilter.key] = eachPrimaryData ? eachPrimaryData[primaryFilter.key]: 0;

                    if(eachPrimaryData && eachPrimaryData[filter2.key]) {
                        angular.forEach(utilService.getSelectedAutoCompleteOptions(filter2) , function (secondaryOption,j) {
                            var eachSecondaryData = utilService.findByKeyAndValue(eachPrimaryData[filter2.key], 'name', secondaryOption.key);
                            primaryDataObj.values.push({"label":secondaryOption.title, "value":
                                (eachSecondaryData &&  eachSecondaryData[primaryFilter.key]) ?
                                    eachSecondaryData[primaryFilter.key] : 0});
                        });
                        multiChartBarData.push(primaryDataObj);
                    }else{
                        angular.forEach(utilService.getSelectedAutoCompleteOptions(filter2), function (secondaryOption,j) {
                            primaryDataObj.values.push(
                                { label : secondaryOption.title, value : 0 }
                            );
                        });
                        multiChartBarData.push(primaryDataObj);
                    }
                });
            }
            chartData.data = multiChartBarData;
            return chartData;
        }

        /*Vertical Stacked Chart*/
        function verticalChart(filter1, filter2, data, primaryFilter, stacked) {
            var chartData = {
                data: [],
                title: "label.title."+filter1.key+"."+filter2.key,
                options: {
                    "chart": {
                        "type": "multiBarChart",
                        "height": 250,
                        "width": 350,
                        "margin": {
                            "top": 5,
                            "right": 5,
                            "bottom": 45,
                            "left": 45
                        },
                        showMaxMin: false,
                        showLegend: false,
                        showControls: false,
                        showValues: false,
                        showXAxis:true,
                        showYAxis:true,
                        reduceXTicks:false,
                        //wrapLabels:true,
                        legend:{
                            width:200,
                            expanded:true
                        },
                        staggerLabels:true,
                        rotateLabels:70,
                        x: function(d){return d.x;},
                        y: function(d){return d.y;},
                        "clipEdge": true,
                        "duration": 500,
                        "stacked": stacked,
                        "xAxis": {
                            "axisLabelDistance": -20,
                            "axisLabel": $translate.instant(filter2.title),
                            margin: {
                                top:60
                            },
                            tickFormat:function () {
                                return null;
                            }
                        },
                        "yAxis": {
                            "axisLabelDistance": -20,
                            "axisLabel": primaryFilter.chartAxisLabel,
                            tickFormat:function () {
                               return null;
                            }
                        },
                        valueFormat:function (n){
                            if(isNaN(n)){ return n; }
                            return d3.format('d')(n);
                        },useInteractiveGuideline: false,
                        interactive: false,
                        tooltip: {
                            contentGenerator: function(d) {
                                var html = "<div class='usa-grid-full'"+
                                    "<div class='usa-width-one-whole' style='padding: 10px; font-weight: bold'>"+ d.value+"</div>" +
                                    "<div class='usa-width-one-whole nvtooltip-value'>";
                                d.series.forEach(function(elem){
                                    html += "<i class='fa fa-square' style='color:"+elem.color+"'></i>" +
                                        "&nbsp;&nbsp;&nbsp;"+elem.key+"&nbsp;&nbsp;&nbsp;"+$filter('number')(elem.value)+"</div>";
                                });
                                html += "</div>";
                                return html;
                            }
                        }
                    }
                }
            };

            var multiBarChartData = [];
            if(data && data[filter1.key]){
                angular.forEach(utilService.getSelectedAutoCompleteOptions(filter1), function (primaryOption,index) {
                    var eachPrimaryData = utilService.findByKeyAndValue(data[filter1.key], 'name', primaryOption.key);
                    var primaryObj = {};
                    primaryObj["key"] = primaryOption.title;
                    primaryObj["values"] = [];
                    if(filter1.key === 'gender') {
                        primaryObj["color"] = primaryOption.key === 'Male' ?  "#009aff" : "#fe66ff";
                    }

                    if(eachPrimaryData && eachPrimaryData[filter2.key]) {
                        var secondaryArrayData = utilService.sortByKey(eachPrimaryData[filter2.key], 'name');
                        angular.forEach(utilService.getSelectedAutoCompleteOptions(filter2), function (secondaryOption,j) {
                            var eachSecondaryData = utilService.findByKeyAndValue(secondaryArrayData, 'name', secondaryOption.key);
                            primaryObj.values.push(
                                { x : secondaryOption.title, y : (eachSecondaryData &&  eachSecondaryData[primaryFilter.key]) ?
                                    eachSecondaryData[primaryFilter.key] :0 }
                            );
                        });
                        multiBarChartData.push(primaryObj);
                    }else{
                        angular.forEach(utilService.getSelectedAutoCompleteOptions(filter2), function (secondaryOption,j) {
                            primaryObj.values.push(
                                { x : secondaryOption.title, y : 0 }
                            );
                        });
                        multiBarChartData.push(primaryObj);
                    }
                });
            }
            chartData.data = multiBarChartData;
            return chartData;
        }

        /*Prepare pie chart for single filter*/
        function pieChart( data, filter, primaryFilter, postFixToTooltip ) {
            postFixToTooltip = postFixToTooltip ? postFixToTooltip : '';
            var color = d3.scale.category20();
            var chartData = {
                data: [],
                title: "label.graph."+filter.key,
                options: {
                    chart: {
                        type: 'pieChart',
                        "height": 250,
                        "width": 250,
                        "margin": {
                            "top": 5,
                            "right": 5,
                            "bottom": 5,
                            "left": 5
                        },
                        x: function(d){ return d.label; },
                        y: function(d){ return d.value; },
                        showValues: false,
                        showLabels: false,
                        transitionDuration: 250,
                        showLegend: false,
                        legend: {
                            margin:{}
                        },
                        labelThreshold: 0.01,
                        labelSunbeamLayout: true,
                        styles: {
                            classes: {
                                'with-3d-shadow': true,
                                'with-transitions': true,
                                gallery: false

                            }
                        },
                        color:function (d, i) {
                            if(filter.key==='gender') {
                                return d.label === 'Male' ?  "#009aff" : "#fe66ff";
                            }else {
                                return color(i);
                            }
                        },useInteractiveGuideline: false,
                        interactive: false,
                        tooltip: {
                            contentGenerator: function(d) {
                                var html = "<div class='usa-grid-full'"+
                                    "<div class='usa-width-one-whole nvtooltip-value'>";
                                d.series.forEach(function(elem){
                                    html += "<i class='fa fa-square' style='color:"+elem.color+"'></i>" +
                                        "&nbsp;&nbsp;&nbsp;"+elem.key+"&nbsp;&nbsp;&nbsp;"+$filter('number')(elem.value) + postFixToTooltip + "</div>";
                                });
                                html += "</div>";
                                return html;
                            }
                        }
                    }}
            };
            angular.forEach(utilService.getSelectedAutoCompleteOptions(filter), function(eachOption) {
                var eachRow = utilService.findByKeyAndValue(data, 'name', eachOption.key);
                chartData.data.push({label: eachOption.title, value: eachRow ? eachRow[primaryFilter.key] : 0});
            });
            return chartData;
        }

        /*Show expanded graphs with whole set of features*/
        function showExpandedGraph(chartData, graphTitle, graphSubTitle) {
            var allExpandedChartDatas = [];
            graphTitle = graphTitle ? graphTitle : (chartData.length > 1? 'label.graph.expanded': chartData[0].title);
            angular.forEach(chartData, function(eachChartData) {
                var expandedChartData = angular.copy(eachChartData);
                /*Update chartData options*/
                expandedChartData.options.chart.height = 500;
                expandedChartData.options.chart.width = 720;
                expandedChartData.options.chart.showLegend = true;
                expandedChartData.options.chart.showControls = true;
                expandedChartData.options.chart.showValues = true;
                expandedChartData.options.chart.showXAxis = true;
                expandedChartData.options.chart.showYAxis = true;

                if (eachChartData.options.chart.type !== 'pieChart') {
                    expandedChartData.options.chart.xAxis.tickFormat = function (d) {
                        if (isNaN(d)) {
                            return d;
                        }
                        return d3.format(',f')(d);
                    };
                    expandedChartData.options.chart.yAxis.tickFormat = function (d) {
                        if (isNaN(d)) {
                            return d;
                        }
                        return d3.format(',f')(d);
                    };
                    expandedChartData.options.chart.yAxis.axisLabelDistance = 10;
                    expandedChartData.options.chart.xAxis.axisLabelDistance = 120;
                }
                if(eachChartData.options.chart.type === 'multiBarHorizontalChart') {
                    expandedChartData.options.chart.margin.top = 20;
                    expandedChartData.options.chart.margin.right = 40;
                    expandedChartData.options.chart.margin.bottom = 120;
                    if(expandedChartData.title === 'label.title.agegroup.autopsy' ||
                        expandedChartData.title === 'label.title.race.hispanicOrigin') {
                        expandedChartData.options.chart.margin.left =
                            (expandedChartData.title === 'label.title.race.hispanicOrigin')?160:100;
                        expandedChartData.options.chart.height = 550;
                        expandedChartData.options.chart.showValues = false;
                    } if(expandedChartData.title === 'label.title.yrbsSex.yrbsRace' ) {
                        expandedChartData.options.chart.margin.left = 210;
                    } else {
                        expandedChartData.options.chart.margin.left = 200;
                    }
                } else if(eachChartData.options.chart.type === 'multiBarChart') {
                    expandedChartData.options.chart.xAxis.axisLabelDistance = 70;
                    expandedChartData.options.chart.margin.top = 20;
                    expandedChartData.options.chart.margin.right = 20;
                    expandedChartData.options.chart.margin.bottom = 120;
                    expandedChartData.options.chart.margin.left = 120;
                    if(expandedChartData.title === 'label.title.gender.placeofdeath') {
                        expandedChartData.options.chart.wrapLabels=true;
                        expandedChartData.options.chart.rotateLabels=0;
                        expandedChartData.options.chart.margin.bottom = 110;
                        expandedChartData.options.chart.staggerLabels = false;
                    }else if (expandedChartData.title==='label.title.gender.hispanicOrigin' ||
                        expandedChartData.title==='label.title.agegroup.hispanicOrigin' ) {
                        expandedChartData.options.chart.yAxis.axisLabelDistance = 30;
                        expandedChartData.options.chart.height = 600;
                        expandedChartData.options.chart.margin.bottom = 200;
                    }
                } else if (eachChartData.options.chart.type === 'pieChart') {
                    if(expandedChartData.title === 'label.graph.yrbsGrade') {
                        expandedChartData.options.chart.legend.margin.right = 130;
                        expandedChartData.options.chart.legend.margin.top = 30;
                    }
                }
                allExpandedChartDatas.push(expandedChartData);
            });

            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: "app/partials/expandedGraphModal.html",
                controllerAs: 'eg',
                controller: function ($scope, close, shareUtilService) {
                    var eg = this;
                    eg.chartData = allExpandedChartDatas;
                    eg.graphTitle = graphTitle;
                    eg.graphSubTitle = graphSubTitle;
                    eg.close = close;
                    eg.showFbDialog = function(svgIndex, title, section, description) {
                        shareUtilService.shareOnFb(svgIndex, title, section, description);
                    }
                }
            }).then(function (modal) {
                // The modal object has the element built, if this is a bootstrap modal
                // you can call 'modal' to show it, if it's a custom modal just show or hide
                // it as you need to.
                modal.element.show();
                modal.close.then(function (result) {
                    modal.element.hide();
                });
            });
        }
    }
}());
