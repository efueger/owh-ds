var y = require("../api/yrbs");
var supertest = require("supertest");
var expect = require("expect.js");

describe("YRBS API", function () {
    var yrbs;
    this.timeout(20000);
    beforeEach( function () {
        yrbs = new y();
    });

    it("buildYRBSQueries with grouping param", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsSex","queryKey":"q2","size":100000},{"key":"yrbsRace","queryKey":"raceeth","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=q2,raceeth','q=qn2&v=q2,raceeth','q=qn3&v=q2,raceeth']);

    });

    it("buildYRBSQueries with all grouping params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsGrade","queryKey":"q3","size":100000},{"key":"yrbsSex","queryKey":"q2","size":100000},{"key":"yrbsRace","queryKey":"raceeth","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=q2,q3,raceeth','q=qn2&v=q2,q3,raceeth','q=qn3&v=q2,q3,raceeth']);

    });

    it("buildYRBSQueries with no grouping params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1','q=qn2','q=qn3']);

    });

    it("processYRBSReponses", function (){
        var yrbsresp = [ {
            "q": "qn41",
            "results": [
                {
                    "mean": 0.6325,
                    "level": 0,
                    "se": 0.013,
                    "ci_u": 0.6584,
                    "count": 15049,
                    "ci_l": 0.6058
                },
                {
                    "q2": "Female",
                    "q_resp": true,
                    "q": "qn41",
                    "se": 0.0187,
                    "level": 1,
                    "mean": 0.6534,
                    "ci_u": 0.6901,
                    "count": 7518,
                    "ci_l": 0.6147
                },
                {
                    "q2": "Male",
                    "q_resp": true,
                    "q": "qn41",
                    "se": 0.0115,
                    "level": 1,
                    "mean": 0.6142,
                    "ci_u": 0.6371,
                    "count": 7424,
                    "ci_l": 0.5907
                }
            ],
            "response": true,
            "question": "Ever drank alcohol",
            "var_levels": {
                "q2": {
                    "question": "What is your sex",
                    "responses": [
                        [
                            "1",
                            "Female"
                        ],
                        [
                            "2",
                            "Male"
                        ]
                    ]
                }
            },
            "vars": [
                "q2"
            ]
        }, null,
            {
                "q": "qn45",
                "results": [
                    {
                        "mean": 0.6325,
                        "level": 0,
                        "se": 0.013,
                        "ci_u": 0.6584,
                        "count": 15049,
                        "ci_l": 0.6058
                    },
                    {
                        "q2": "Female",
                        "q_resp": true,
                        "q": "qn41",
                        "se": 0.0187,
                        "level": 1,
                        "mean": 0.6534,
                        "ci_u": 0.6901,
                        "count": 7518,
                        "ci_l": 0.6147
                    },
                    {
                        "q2": "Male",
                        "q_resp": true,
                        "q": "qn41",
                        "se": 0.0115,
                        "level": 1,
                        "mean": 0.6142,
                        "ci_u": 0.6371,
                        "count": 7424,
                        "ci_l": 0.5907
                    }
                ],
                "response": true,
                "question": "Ever drank alcohol",
                "var_levels": {
                    "q2": {
                        "question": "What is your sex",
                        "responses": [
                            [
                                "1",
                                "Female"
                            ],
                            [
                                "2",
                                "Male"
                            ]
                        ]
                    }
                },
                "vars": [
                    "q2"
                ]
            }]
        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql({
            "table":{
                "question":[
                    {
                        "name":"qn41",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.8)</nobr><br/>15049",
                        "q2":[
                            {
                                "name":"Female",
                                "mental_health":"65.3<br><br/><nobr>(61.5-69.0)</nobr><br/>7518"
                            },
                            {
                                "name":"Male",
                                "mental_health":"61.4<br><br/><nobr>(59.1-63.7)</nobr><br/>7424"
                            }
                        ]
                    },
                    {
                        "name":"qn45",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.8)</nobr><br/>15049",
                        "q2":[
                            {
                                "name":"Female",
                                "mental_health":"65.3<br><br/><nobr>(61.5-69.0)</nobr><br/>7518"
                            },
                            {
                                "name":"Male",
                                "mental_health":"61.4<br><br/><nobr>(59.1-63.7)</nobr><br/>7424"
                            }
                        ]
                    }
                ]
            }
        });

    });

    it("processYRBSReponses with no groupings", function (){
        var yrbsresp = [
            {
                "q":"qn45",
                "results":[
                    {
                        "mean":0.6326,
                        "level":0,
                        "se":0.013,
                        "ci_u":0.6584,
                        "count":15049,
                        "ci_l":0.6058
                    }
                ]
            },null,
            {
                "q":"qn46",
                "results":[
                    {
                        "mean":0.6324,
                        "level":0,
                        "se":0.013,
                        "ci_u":0.6500,
                        "count":15049,
                        "ci_l":0.6057
                    }
                ]
            }
        ];

        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql( {
            "table":{
                "question":[
                    {
                        "name":"qn45",
                        "mental_health":"63.3<br><br/><nobr>(60.6-65.8)</nobr><br/>15049"
                    },
                    {
                        "name":"qn46",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.0)</nobr><br/>15049"
                    }
                ]
            }
        });
    });

    it("processYRBSReponses with multiple groupings result nested in order Sex, race", function (){
        var yrbsresp = [{"q":"qn41","results":[{"mean":0.6325,"level":0,"se":0.013,"ci_u":0.6584,"count":15049.0,"ci_l":0.6058},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.073,"raceeth":"Am Indian \/ Alaska Native","mean":0.6174,"ci_l":0.4551,"count":63.0,"ci_u":0.7572},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0678,"raceeth":"Am Indian \/ Alaska Native","mean":0.7752,"ci_l":0.6081,"count":92.0,"ci_u":0.8846},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0372,"raceeth":"Asian","mean":0.4449,"ci_l":0.3704,"count":302.0,"ci_u":0.522},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0371,"raceeth":"Asian","mean":0.4212,"ci_l":0.3477,"count":308.0,"ci_u":0.4984},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0326,"raceeth":"Black or African American","mean":0.579,"ci_l":0.5115,"count":776.0,"ci_u":0.6436},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0308,"raceeth":"Black or African American","mean":0.5103,"ci_l":0.4479,"count":776.0,"ci_u":0.5723},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0177,"raceeth":"Hispanic \/ Latino","mean":0.6521,"ci_l":0.6149,"count":1150.0,"ci_u":0.6875},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0257,"raceeth":"Hispanic \/ Latino","mean":0.6087,"ci_l":0.5553,"count":1134.0,"ci_u":0.6597},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0182,"raceeth":"Multiple - Hispanic","mean":0.7141,"ci_l":0.6759,"count":1323.0,"ci_u":0.7495},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0157,"raceeth":"Multiple - Hispanic","mean":0.6546,"ci_l":0.6223,"count":1296.0,"ci_u":0.6856},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0333,"raceeth":"Multiple - Non-Hispanic","mean":0.7523,"ci_l":0.6788,"count":376.0,"ci_u":0.8135},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0356,"raceeth":"Multiple - Non-Hispanic","mean":0.6618,"ci_l":0.5863,"count":331.0,"ci_u":0.7298},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.1282,"raceeth":"Native Hawaiian\/other PI","mean":0.3912,"ci_l":0.1525,"count":22.0,"ci_u":0.6965},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0587,"raceeth":"Native Hawaiian\/other PI","mean":0.73,"ci_l":0.5927,"count":71.0,"ci_u":0.834},{"q2":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0295,"raceeth":"White","mean":0.6672,"ci_l":0.6051,"count":3386.0,"ci_u":0.7239},{"q2":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0151,"raceeth":"White","mean":0.6402,"ci_l":0.6092,"count":3266.0,"ci_u":0.67}],"response":true,"question":"Ever drank alcohol","var_levels":{"q2":{"question":"What is your sex","responses":[["1","Female"],["2","Male"]]},"raceeth":{"question":"Race\/Ethnicity","responses":[["1","Am Indian \/ Alaska Native"],["2","Asian"],["3","Black or African American"],["4","Native Hawaiian\/other PI"],["5","White"],["6","Hispanic \/ Latino"],["7","Multiple - Hispanic"],["8","Multiple - Non-Hispanic"]]}},"vars":["raceeth","q2"]}];
        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql( {
            "table":{
                "question":[
                    {
                        "name":"qn41",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.8)</nobr><br/>15049",
                        "q2":[
                            {
                                "name":"Female",
                                "raceeth":[
                                    {
                                        "name":"Am Indian / Alaska Native",
                                        "mental_health":"61.7<br><br/><nobr>(45.5-75.7)</nobr><br/>63"
                                    },
                                    {
                                        "name":"Asian",
                                        "mental_health":"44.5<br><br/><nobr>(37.0-52.2)</nobr><br/>302"
                                    },
                                    {
                                        "name":"Black or African American",
                                        "mental_health":"57.9<br><br/><nobr>(51.1-64.4)</nobr><br/>776"
                                    },
                                    {
                                        "name":"Hispanic / Latino",
                                        "mental_health":"65.2<br><br/><nobr>(61.5-68.8)</nobr><br/>1150"
                                    },
                                    {
                                        "name":"Multiple - Hispanic",
                                        "mental_health":"71.4<br><br/><nobr>(67.6-75.0)</nobr><br/>1323"
                                    },
                                    {
                                        "name":"Multiple - Non-Hispanic",
                                        "mental_health":"75.2<br><br/><nobr>(67.9-81.3)</nobr><br/>376"
                                    },
                                    {
                                        "name":"Native Hawaiian/other PI",
                                        "mental_health":"39.1<br><br/><nobr>(15.3-69.7)</nobr><br/>22"
                                    },
                                    {
                                        "name":"White",
                                        "mental_health":"66.7<br><br/><nobr>(60.5-72.4)</nobr><br/>3386"
                                    }
                                ]
                            },
                            {
                                "name":"Male",
                                "raceeth":[
                                    {
                                        "name":"Am Indian / Alaska Native",
                                        "mental_health":"77.5<br><br/><nobr>(60.8-88.5)</nobr><br/>92"
                                    },
                                    {
                                        "name":"Asian",
                                        "mental_health":"42.1<br><br/><nobr>(34.8-49.8)</nobr><br/>308"
                                    },
                                    {
                                        "name":"Black or African American",
                                        "mental_health":"51.0<br><br/><nobr>(44.8-57.2)</nobr><br/>776"
                                    },
                                    {
                                        "name":"Hispanic / Latino",
                                        "mental_health":"60.9<br><br/><nobr>(55.5-66.0)</nobr><br/>1134"
                                    },
                                    {
                                        "name":"Multiple - Hispanic",
                                        "mental_health":"65.5<br><br/><nobr>(62.2-68.6)</nobr><br/>1296"
                                    },
                                    {
                                        "name":"Multiple - Non-Hispanic",
                                        "mental_health":"66.2<br><br/><nobr>(58.6-73.0)</nobr><br/>331"
                                    },
                                    {
                                        "name":"Native Hawaiian/other PI",
                                        "mental_health":"73.0<br><br/><nobr>(59.3-83.4)</nobr><br/>71"
                                    },
                                    {
                                        "name":"White",
                                        "mental_health":"64.0<br><br/><nobr>(60.9-67.0)</nobr><br/>3266"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });
    });

    it("invokeYRBS service group by race and sex", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"raceeth","size":100000},{"key":"yrbsSex","queryKey":"q2","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn10']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":"81.4<br><br/><nobr>(77.0-85.1)</nobr><br/>8757","q2":[{"name":"Female","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"86.4<br><br/><nobr>(72.9-93.8)</nobr><br/>35"},{"name":"Asian","mental_health":"82.2<br><br/><nobr>(71.2-89.5)</nobr><br/>138"},{"name":"Black or African American","mental_health":"82.6<br><br/><nobr>(67.9-91.4)</nobr><br/>337"},{"name":"Hispanic / Latino","mental_health":"91.4<br><br/><nobr>(88.1-93.9)</nobr><br/>636"},{"name":"Multiple - Hispanic","mental_health":"89.5<br><br/><nobr>(85.4-92.6)</nobr><br/>740"},{"name":"Multiple - Non-Hispanic","mental_health":"87.5<br><br/><nobr>(79.2-92.7)</nobr><br/>196"},{"name":"Native Hawaiian/other PI","mental_health":"76.1<br><br/><nobr>(20.2-97.5)</nobr><br/>14"},{"name":"White","mental_health":"75.3<br><br/><nobr>(69.3-80.4)</nobr><br/>1798"}],"mental_health":"80.1<br><br/><nobr>(75.2-84.3)</nobr><br/>3951"},{"name":"Male","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"73.1<br><br/><nobr>(34.6-93.3)</nobr><br/>66"},{"name":"Asian","mental_health":"78.7<br><br/><nobr>(71.7-84.4)</nobr><br/>211"},{"name":"Black or African American","mental_health":"91.6<br><br/><nobr>(86.9-94.7)</nobr><br/>496"},{"name":"Hispanic / Latino","mental_health":"92.8<br><br/><nobr>(90.4-94.6)</nobr><br/>790"},{"name":"Multiple - Hispanic","mental_health":"87.8<br><br/><nobr>(83.1-91.3)</nobr><br/>896"},{"name":"Multiple - Non-Hispanic","mental_health":"85.6<br><br/><nobr>(77.6-91.1)</nobr><br/>219"},{"name":"Native Hawaiian/other PI","mental_health":"66.9<br><br/><nobr>(35.3-88.3)</nobr><br/>43"},{"name":"White","mental_health":"77.5<br><br/><nobr>(71.4-82.7)</nobr><br/>1949"}],"mental_health":"82.4<br><br/><nobr>(78.2-86.0)</nobr><br/>4769"}]},{"name":"qn9","mental_health":"6.1<br><br/><nobr>(4.9-7.6)</nobr><br/>14070","q2":[{"name":"Female","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"5.0<br><br/><nobr>(0.8-26.3)</nobr><br/>58"},{"name":"Asian","mental_health":"4.9<br><br/><nobr>(2.3-10.2)</nobr><br/>297"},{"name":"Black or African American","mental_health":"7.6<br><br/><nobr>(4.6-12.1)</nobr><br/>806"},{"name":"Hispanic / Latino","mental_health":"5.0<br><br/><nobr>(3.6-6.8)</nobr><br/>1181"},{"name":"Multiple - Hispanic","mental_health":"7.3<br><br/><nobr>(5.0-10.6)</nobr><br/>1341"},{"name":"Multiple - Non-Hispanic","mental_health":"5.4<br><br/><nobr>(3.3-8.7)</nobr><br/>365"},{"name":"Native Hawaiian/other PI","mental_health":"3.6<br><br/><nobr>(0.5-22.5)</nobr><br/>23"},{"name":"White","mental_health":"3.5<br><br/><nobr>(2.3-5.5)</nobr><br/>2852"}],"mental_health":"4.9<br><br/><nobr>(3.8-6.3)</nobr><br/>7028"},{"name":"Male","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"12.9<br><br/><nobr>(5.5-27.2)</nobr><br/>91"},{"name":"Asian","mental_health":"6.3<br><br/><nobr>(2.9-13.1)</nobr><br/>310"},{"name":"Black or African American","mental_health":"12.4<br><br/><nobr>(8.8-17.2)</nobr><br/>798"},{"name":"Hispanic / Latino","mental_health":"5.9<br><br/><nobr>(4.2-8.2)</nobr><br/>1173"},{"name":"Multiple - Hispanic","mental_health":"7.5<br><br/><nobr>(5.9-9.5)</nobr><br/>1325"},{"name":"Multiple - Non-Hispanic","mental_health":"7.0<br><br/><nobr>(4.3-11.2)</nobr><br/>314"},{"name":"Native Hawaiian/other PI","mental_health":"28.1<br><br/><nobr>(11.8-53.1)</nobr><br/>71"},{"name":"White","mental_health":"5.3<br><br/><nobr>(3.6-7.6)</nobr><br/>2712"}],"mental_health":"7.2<br><br/><nobr>(5.7-9.0)</nobr><br/>6938"}]},{"name":"qn10","mental_health":"20.0<br><br/><nobr>(18.4-21.6)</nobr><br/>15555","q2":[{"name":"Female","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"31.8<br><br/><nobr>(21.7-43.9)</nobr><br/>65"},{"name":"Asian","mental_health":"11.7<br><br/><nobr>(7.9-17.1)</nobr><br/>307"},{"name":"Black or African American","mental_health":"21.3<br><br/><nobr>(15.8-27.9)</nobr><br/>816"},{"name":"Hispanic / Latino","mental_health":"25.6<br><br/><nobr>(22.7-28.6)</nobr><br/>1181"},{"name":"Multiple - Hispanic","mental_health":"28.6<br><br/><nobr>(25.5-32.0)</nobr><br/>1373"},{"name":"Multiple - Non-Hispanic","mental_health":"21.6<br><br/><nobr>(16.9-27.3)</nobr><br/>391"},{"name":"Native Hawaiian/other PI","mental_health":"12.1<br><br/><nobr>(3.0-37.9)</nobr><br/>25"},{"name":"White","mental_health":"17.5<br><br/><nobr>(14.8-20.7)</nobr><br/>3454"}],"mental_health":"20.3<br><br/><nobr>(17.9-22.8)</nobr><br/>7739"},{"name":"Male","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"21.0<br><br/><nobr>(10.8-36.8)</nobr><br/>94"},{"name":"Asian","mental_health":"10.8<br><br/><nobr>(5.9-19.0)</nobr><br/>318"},{"name":"Black or African American","mental_health":"20.6<br><br/><nobr>(16.9-25.0)</nobr><br/>831"},{"name":"Hispanic / Latino","mental_health":"22.1<br><br/><nobr>(18.9-25.7)</nobr><br/>1168"},{"name":"Multiple - Hispanic","mental_health":"27.8<br><br/><nobr>(24.1-31.8)</nobr><br/>1360"},{"name":"Multiple - Non-Hispanic","mental_health":"17.8<br><br/><nobr>(12.0-25.6)</nobr><br/>342"},{"name":"Native Hawaiian/other PI","mental_health":"24.4<br><br/><nobr>(11.9-43.5)</nobr><br/>70"},{"name":"White","mental_health":"17.7<br><br/><nobr>(15.7-19.8)</nobr><br/>3364"}],"mental_health":"19.6<br><br/><nobr>(18.2-21.1)</nobr><br/>7711"}]}]}});
        });
    });

    it("invokeYRBS returns response even when there are errors with some questions", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"raceeth","size":100000},{"key":"yrbsSex","queryKey":"q2","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn100000']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql(  {"table":{"question":[{"name":"qn8","mental_health":"81.4<br><br/><nobr>(77.0-85.1)</nobr><br/>8757","q2":[{"name":"Female","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"86.4<br><br/><nobr>(72.9-93.8)</nobr><br/>35"},{"name":"Asian","mental_health":"82.2<br><br/><nobr>(71.2-89.5)</nobr><br/>138"},{"name":"Black or African American","mental_health":"82.6<br><br/><nobr>(67.9-91.4)</nobr><br/>337"},{"name":"Hispanic / Latino","mental_health":"91.4<br><br/><nobr>(88.1-93.9)</nobr><br/>636"},{"name":"Multiple - Hispanic","mental_health":"89.5<br><br/><nobr>(85.4-92.6)</nobr><br/>740"},{"name":"Multiple - Non-Hispanic","mental_health":"87.5<br><br/><nobr>(79.2-92.7)</nobr><br/>196"},{"name":"Native Hawaiian/other PI","mental_health":"76.1<br><br/><nobr>(20.2-97.5)</nobr><br/>14"},{"name":"White","mental_health":"75.3<br><br/><nobr>(69.3-80.4)</nobr><br/>1798"}],"mental_health":"80.1<br><br/><nobr>(75.2-84.3)</nobr><br/>3951"},{"name":"Male","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"73.1<br><br/><nobr>(34.6-93.3)</nobr><br/>66"},{"name":"Asian","mental_health":"78.7<br><br/><nobr>(71.7-84.4)</nobr><br/>211"},{"name":"Black or African American","mental_health":"91.6<br><br/><nobr>(86.9-94.7)</nobr><br/>496"},{"name":"Hispanic / Latino","mental_health":"92.8<br><br/><nobr>(90.4-94.6)</nobr><br/>790"},{"name":"Multiple - Hispanic","mental_health":"87.8<br><br/><nobr>(83.1-91.3)</nobr><br/>896"},{"name":"Multiple - Non-Hispanic","mental_health":"85.6<br><br/><nobr>(77.6-91.1)</nobr><br/>219"},{"name":"Native Hawaiian/other PI","mental_health":"66.9<br><br/><nobr>(35.3-88.3)</nobr><br/>43"},{"name":"White","mental_health":"77.5<br><br/><nobr>(71.4-82.7)</nobr><br/>1949"}],"mental_health":"82.4<br><br/><nobr>(78.2-86.0)</nobr><br/>4769"}]},{"name":"qn9","mental_health":"6.1<br><br/><nobr>(4.9-7.6)</nobr><br/>14070","q2":[{"name":"Female","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"5.0<br><br/><nobr>(0.8-26.3)</nobr><br/>58"},{"name":"Asian","mental_health":"4.9<br><br/><nobr>(2.3-10.2)</nobr><br/>297"},{"name":"Black or African American","mental_health":"7.6<br><br/><nobr>(4.6-12.1)</nobr><br/>806"},{"name":"Hispanic / Latino","mental_health":"5.0<br><br/><nobr>(3.6-6.8)</nobr><br/>1181"},{"name":"Multiple - Hispanic","mental_health":"7.3<br><br/><nobr>(5.0-10.6)</nobr><br/>1341"},{"name":"Multiple - Non-Hispanic","mental_health":"5.4<br><br/><nobr>(3.3-8.7)</nobr><br/>365"},{"name":"Native Hawaiian/other PI","mental_health":"3.6<br><br/><nobr>(0.5-22.5)</nobr><br/>23"},{"name":"White","mental_health":"3.5<br><br/><nobr>(2.3-5.5)</nobr><br/>2852"}],"mental_health":"4.9<br><br/><nobr>(3.8-6.3)</nobr><br/>7028"},{"name":"Male","raceeth":[{"name":"Am Indian / Alaska Native","mental_health":"12.9<br><br/><nobr>(5.5-27.2)</nobr><br/>91"},{"name":"Asian","mental_health":"6.3<br><br/><nobr>(2.9-13.1)</nobr><br/>310"},{"name":"Black or African American","mental_health":"12.4<br><br/><nobr>(8.8-17.2)</nobr><br/>798"},{"name":"Hispanic / Latino","mental_health":"5.9<br><br/><nobr>(4.2-8.2)</nobr><br/>1173"},{"name":"Multiple - Hispanic","mental_health":"7.5<br><br/><nobr>(5.9-9.5)</nobr><br/>1325"},{"name":"Multiple - Non-Hispanic","mental_health":"7.0<br><br/><nobr>(4.3-11.2)</nobr><br/>314"},{"name":"Native Hawaiian/other PI","mental_health":"28.1<br><br/><nobr>(11.8-53.1)</nobr><br/>71"},{"name":"White","mental_health":"5.3<br><br/><nobr>(3.6-7.6)</nobr><br/>2712"}],"mental_health":"7.2<br><br/><nobr>(5.7-9.0)</nobr><br/>6938"}]}]}});
        });
    });

    it("invokeYRBS service with no grouping", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":"81.4<br><br/><nobr>(77.0-85.1)</nobr><br/>8757"}]}} );
        });
    });
});
