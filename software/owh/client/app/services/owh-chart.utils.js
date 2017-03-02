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
            lineChart : lineChart,
            showExpandedGraph: showExpandedGraph
        };
        return service;

        function horizontalStack(filter1, filter2, data, primaryFilter, postFixToTooltip) {
            var height = (filter1.key == 'state' || filter2.key == 'state')? 600 : 350
            var horizontalStackCss = {
                cssClassName: 'usa-width-two-thirds horizontalStack',
                top: 50,
                height: height
            };
            return horizontalChart(filter1, filter2, data, primaryFilter, true, postFixToTooltip, horizontalStackCss);
        }

        function verticalStack(filter1, filter2, data, primaryFilter) {
            var verticalStackCss = {
                cssClassName: 'usa-width-one-whole verticalStack',
                top: 100,
                height: 600,
                bottom: 150
            };
            return verticalChart(filter1, filter2, data, primaryFilter, true, verticalStackCss);
        }

        function horizontalBar(filter1, filter2, data, primaryFilter, postFixToTooltip) {
            var horizontalBarCss = {
                cssClassName: 'usa-width-one-whole horizontalBar',
                top: 50,
                height: 500,
                bottom: 150
            };

            return horizontalChart(filter1, filter2, data, primaryFilter, false, postFixToTooltip, horizontalBarCss);
        }

        function verticalBar(filter1, filter2, data, primaryFilter) {
            var cssClassName = (filter1.key == 'state' || filter2.key == 'state') ? 'usa-width-one-hole verticalBar': 'usa-width-two-thirds verticalBar'
            var verticalBarCss = {
                cssClassName: cssClassName,
                height: 500,
                top: 50,
                bottom: 150
            };
            return verticalChart(filter1, filter2, data, primaryFilter, false, verticalBarCss);
        }

        /*function bulletBar(filter1, filter2, data, primaryFilter) {
            console.log("IN PROGRESS");
        }*/

        /*Multi Bar Horizontal Chart*/
        function horizontalChart(filter1, filter2, data, primaryFilter, stacked, postFixToTooltip, cssDetails) {
            postFixToTooltip = postFixToTooltip ? postFixToTooltip : '';
            var chartData = {
                data: [],
                title: "label.title."+filter1.key+"."+filter2.key,
                cssClass: cssDetails.cssClassName,
                options: {
                    "chart": {
                        "type": "multiBarHorizontalChart",
                        "height": cssDetails.height?cssDetails.height:350,
                        "margin": {
                            "top": cssDetails.top?cssDetails.top:5,
                            "right": 50,
                            "bottom": cssDetails.bottom?cssDetails.bottom:45,
                            "left": 150
                        },
                        showLegend: true,
                        showControls: true,
                        showValues: false,
                        showXAxis:true,
                        showYAxis:true,
                        stacked: stacked,
                        "duration": 500,
                        x: function(d){return d.label;},
                        y: function(d){return d.value;},
                        "xAxis": {
                            "axisLabelDistance": 80,
                            "axisLabel": $translate.instant(filter2.title),
                            "showMaxMin": false
                        },
                        "yAxis": {
                            "axisLabel": primaryFilter.chartAxisLabel,
                            "showMaxMin": false
                        },
                        valueFormat:function (n){
                            if(isNaN(n)){ return n; }
                            else if (primaryFilter.key == 'mental_health') {
                                return d3.format(',.1f')(n);(n);
                            } else {
                                return d3.format('d')(n);
                            }
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

            if (primaryFilter.key == 'mental_health') {

                var getBarValues = function (barData, filter) {
                    var barValues = [];
                    angular.forEach(utilService.getSelectedAutoCompleteOptions(filter), function (option,index) {
                        //get data for series
                        var eachPrimaryData = utilService.findByKeyAndValue(barData, 'name', option.key);
                        //set data to series values
                        barValues.push({"label":option.title, "value":
                            (eachPrimaryData &&  eachPrimaryData[primaryFilter.key]) ?
                                parseFloat(eachPrimaryData[primaryFilter.key].mean) : 0});

                    });
                    return barValues;
                };
                //if primary and secondary filters are same i.e. Single filter
                if (filter1.queryKey == filter2.queryKey) {
                    var seriesDataObj = {};
                    //series name
                    seriesDataObj["key"] = primaryFilter.chartAxisLabel;
                    //collect series values
                    seriesDataObj["values"] = getBarValues(data.question[0][filter1.queryKey], filter1);
                    multiChartBarData.push(seriesDataObj);
                } else {//for two filters
                    angular.forEach(utilService.getSelectedAutoCompleteOptions(filter1), function (primaryOption,index) {
                        var seriesDataObj = {};
                        var eachPrimaryData = utilService.findByKeyAndValue(data.question[0][filter1.queryKey], 'name', primaryOption.key);
                        //Set name to series
                        seriesDataObj["key"] = primaryOption.title;
                        if(filter1.queryKey === 'sex') {
                            seriesDataObj["color"] = primaryOption.key === 'Male' ?  "#009aff" : "#fe66ff";
                        }

                        //collect series values
                        seriesDataObj["values"] = getBarValues(eachPrimaryData[filter2.queryKey], filter2);
                        multiChartBarData.push(seriesDataObj);
                    });
                }

            } else if(data && data[filter1.key]) {
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
        function verticalChart(filter1, filter2, data, primaryFilter, stacked, cssDetails) {
            var chartData = {
                data: [],
                title: "label.title."+filter1.key+"."+filter2.key,
                cssClass: cssDetails.cssClassName,
                options: {
                    "chart": {
                        "type": "multiBarChart",
                        "height": cssDetails.height?cssDetails.height:350,
                        "margin": {
                            "top": cssDetails.top?cssDetails.top:5,
                            "right": 50,
                            "bottom": cssDetails.bottom?cssDetails.bottom:45,
                            "left": 150
                        },
                        showMaxMin: true,
                        showLegend: true,
                        showControls: true,
                        showValues: true,
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
                            "axisLabelDistance": 50,
                            "showMaxMin": false,
                            "axisLabel": $translate.instant(filter2.title),
                            margin: {
                                top:60
                            }
                        },
                        "yAxis": {
                            "axisLabelDistance": 50,
                            "showMaxMin": false,
                            "axisLabel": primaryFilter.chartAxisLabel
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

        function lineChart(data, filter, primaryFilter) {
            var chartData = {
                data: [],
                title: "label.graph."+filter.key,
                cssClass: "usa-width-one-third",
                options: {
                    "chart": {
                        "type": "lineChart",
                        "height": 250,
                        "width": 300,
                        "margin": {
                            "top": 5,
                            "right": 5,
                            "bottom": 16,
                            "left": 50
                        },
                        showMaxMin: false,
                        showLegend: false,
                        showControls: false,
                        showValues: false,
                        showXAxis:true,
                        showYAxis:true,
                        reduceXTicks:false,
                        legend:{
                            width:200,
                            expanded:true
                        },
                        staggerLabels:true,
                        rotateLabels:70,
                        styles: {
                            classes: {
                                'with-3d-shadow': true,
                                'with-transitions': true,
                                gallery: false

                            }
                        },
                        interactive: true,
                        x: function(d){return d.x;},
                        y: function(d){return d.y;},
                        "xAxis": {
                            "axisLabelDistance": -20,
                            "axisLabel": "Year"
                        },
                        "yAxis": {
                            "axisLabelDistance": -20,
                            "axisLabel": "Population"
                        },
                        tooltip: {
                            contentGenerator: function(d) {
                                var html = "<div class='usa-grid-full'"+
                                    "<div class='usa-width-one-whole' style='padding: 10px; font-weight: bold'>"+ d.value+"</div>" +
                                    "<div class='usa-width-one-whole nvtooltip-value'>";
                                d.series.forEach(function(elem){
                                    html += "<i class='fa fa-square' style='color:"+elem.color+"'></i>" +
                                        "&nbsp;&nbsp;&nbsp;"+elem.key+"&nbsp;&nbsp;&nbsp;"+$filter('number')(elem.value) + "</div>";
                                });
                                html += "</div>";
                                return html;
                            }
                        }
                    }
                }
            };

            chartData.data = function () {
                var lineData = [];
                angular.forEach(utilService.getSelectedAutoCompleteOptions(filter), function(eachOption) {
                    var eachRow = utilService.findByKeyAndValue(data, 'name', eachOption.key);
                    lineData.push({x: eachOption.title, y: eachRow ? eachRow[primaryFilter.key] : 0});
                });

                //Line chart data should be sent as an array of series objects.
                return [
                    {
                        values: lineData,      //values - represents the array of {x,y} data points
                        key: 'Population', //key  - the name of the series.
                        color: '#ff7f0e',  //color - optional: choose your own line color.
                        strokeWidth: 2,
                        classed: 'nvd3-dashed-line'
                    }
                ];
            };

            return chartData;
        }

        /*Prepare pie chart for single filter*/
        function pieChart( data, filter, primaryFilter, postFixToTooltip ) {
            postFixToTooltip = postFixToTooltip ? postFixToTooltip : '';
            var color = d3.scale.category20();
            var chartData = {
                data: [],
                title: "label.graph."+filter.key,
                cssClass: "usa-width-one-third",
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
                        showValues: true,
                        showLabels: true,
                        transitionDuration: 250,
                        showLegend: true,
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
        function showExpandedGraph(chartData, graphTitle, graphSubTitle,
                                   chartTypes, primaryFilters, selectedQuestion) {

            /**
             * Update chart dimensions and data
             */
            var updateChart = function (chartData) {
                var allExpandedChartDatas = [];
                graphTitle = graphTitle ? graphTitle : (chartData.length > 1? 'label.graph.expanded': chartData[0].title);
                angular.forEach(chartData, function(eachChartData) {
                    var expandedChartData = angular.copy(eachChartData);
                    /*Update chartData options*/
                    expandedChartData.options.chart.height = 500;
                    expandedChartData.options.chart.width = 750;
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
                    } else if (eachChartData.options.chart.type === 'lineChart') {
                        expandedChartData.options.chart.margin.left = 85;
                        expandedChartData.options.chart.margin.bottom = 50;
                        expandedChartData.options.chart.xAxis.axisLabelDistance = 5;
                        expandedChartData.options.chart.yAxis.axisLabelDistance = 20;
                    }
                    allExpandedChartDatas.push(expandedChartData);
                });
                return allExpandedChartDatas;
            };

            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: "app/partials/expandedGraphModal.html",
                controllerAs: 'eg',
                controller: function ($scope, close, shareUtilService, searchFactory) {
                    var eg = this;
                    eg.chartData = updateChart(chartData);
                    eg.graphTitle = graphTitle;
                    eg.graphSubTitle = graphSubTitle;
                    eg.chartTypes = chartTypes;
                    eg.primaryFilters = primaryFilters;
                    eg.selectedQuestion = selectedQuestion;
                    eg.close = close;
                    eg.showFbDialog = function(svgIndex, title, section, description) {
                        shareUtilService.shareOnFb(svgIndex, title, section, description);
                    };

                    /**
                     * get the display name for chart
                     * @param chartType
                     * @returns {*}
                     */
                    eg.getChartName = function (chartType) {
                        var chartNames = {'yrbsSex&yrbsRace':'Sex and Race',
                            'yrbsSex&yrbsGrade':'Sex and Grade',
                            'yrbsGrade&yrbsRace': 'Grade and Race',
                            'yrbsRace': 'Race',
                            'yrbsSex': 'Sex',
                            'yrbsGrade': 'Grade'};

                        if (chartType.length == 1) {
                            return chartNames[chartType[0]];
                        } else {
                            return chartNames[chartType[0]+'&'+chartType[1]];
                        }
                    };

                    /**
                     * Get data for specified chart and update it
                     * @param chartType
                     */
                    eg.getYrbsChartData = function (chartType) {
                        searchFactory.prepareQuestionChart(eg.primaryFilters,
                            eg.selectedQuestion, chartType).then(function (response) {
                            eg.chartData = updateChart([response.chartData]);
                            eg.activeTab = eg.getChartName(chartType);
                        });
                    }
                },
                size:650
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
