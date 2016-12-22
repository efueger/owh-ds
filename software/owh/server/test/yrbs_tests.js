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
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000},{"key":"yrbsRace","queryKey":"race7","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=sex,race7','q=qn2&v=sex,race7','q=qn3&v=sex,race7']);

    });

    it("buildYRBSQueries with all grouping params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsGrade","queryKey":"grade","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000},{"key":"yrbsRace","queryKey":"race7","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=sex,grade,race7','q=qn2&v=sex,grade,race7','q=qn3&v=sex,grade,race7']);

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
                    "sex": "Female",
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
                    "sex": "Male",
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
                "sex": {
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
                "sex"
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
                        "sex": "Female",
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
                        "sex": "Male",
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
                    "sex": {
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
                    "sex"
                ]
            }]
        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql({
            "table":{
                "question":[
                    {
                        "name":"qn41",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.8)</nobr><br/>15049",
                        "sex":[
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
                        "sex":[
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
        var yrbsresp = [{"q":"qn41","results":[{"mean":0.6325,"level":0,"se":0.013,"ci_u":0.6584,"count":15049.0,"ci_l":0.6058},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.073,"race7":"Am Indian \/ Alaska Native","mean":0.6174,"ci_l":0.4551,"count":63.0,"ci_u":0.7572},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0678,"race7":"Am Indian \/ Alaska Native","mean":0.7752,"ci_l":0.6081,"count":92.0,"ci_u":0.8846},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0372,"race7":"Asian","mean":0.4449,"ci_l":0.3704,"count":302.0,"ci_u":0.522},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0371,"race7":"Asian","mean":0.4212,"ci_l":0.3477,"count":308.0,"ci_u":0.4984},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0326,"race7":"Black or African American","mean":0.579,"ci_l":0.5115,"count":776.0,"ci_u":0.6436},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0308,"race7":"Black or African American","mean":0.5103,"ci_l":0.4479,"count":776.0,"ci_u":0.5723},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0177,"race7":"Hispanic \/ Latino","mean":0.6521,"ci_l":0.6149,"count":1150.0,"ci_u":0.6875},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0257,"race7":"Hispanic \/ Latino","mean":0.6087,"ci_l":0.5553,"count":1134.0,"ci_u":0.6597},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0182,"race7":"Multiple - Hispanic","mean":0.7141,"ci_l":0.6759,"count":1323.0,"ci_u":0.7495},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0157,"race7":"Multiple - Hispanic","mean":0.6546,"ci_l":0.6223,"count":1296.0,"ci_u":0.6856},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0333,"race7":"Multiple - Non-Hispanic","mean":0.7523,"ci_l":0.6788,"count":376.0,"ci_u":0.8135},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0356,"race7":"Multiple - Non-Hispanic","mean":0.6618,"ci_l":0.5863,"count":331.0,"ci_u":0.7298},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.1282,"race7":"Native Hawaiian\/other PI","mean":0.3912,"ci_l":0.1525,"count":22.0,"ci_u":0.6965},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0587,"race7":"Native Hawaiian\/other PI","mean":0.73,"ci_l":0.5927,"count":71.0,"ci_u":0.834},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0295,"race7":"White","mean":0.6672,"ci_l":0.6051,"count":3386.0,"ci_u":0.7239},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0151,"race7":"White","mean":0.6402,"ci_l":0.6092,"count":3266.0,"ci_u":0.67}],"response":true,"question":"Ever drank alcohol","var_levels":{"sex":{"question":"What is your sex","responses":[["1","Female"],["2","Male"]]},"race7":{"question":"Race\/Ethnicity","responses":[["1","Am Indian \/ Alaska Native"],["2","Asian"],["3","Black or African American"],["4","Native Hawaiian\/other PI"],["5","White"],["6","Hispanic \/ Latino"],["7","Multiple - Hispanic"],["8","Multiple - Non-Hispanic"]]}},"vars":["race7","sex"]}];
        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql( {
            "table":{
                "question":[
                    {
                        "name":"qn41",
                        "mental_health":"63.2<br><br/><nobr>(60.6-65.8)</nobr><br/>15049",
                        "sex":[
                            {
                                "name":"Female",
                                "race7":[
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
                                "race7":[
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
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race7","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn10']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":"87.4<br><br/><nobr>(86.5-88.3)</nobr><br/>121103","sex":[{"name":"Female","race7":[{"name":"Am Indian / Alaska Native","mental_health":"88.4<br><br/><nobr>(83.1-92.2)</nobr><br/>519"},{"name":"Asian","mental_health":"76.8<br><br/><nobr>(72.9-80.2)</nobr><br/>1541"},{"name":"Black or African American","mental_health":"92.9<br><br/><nobr>(91.5-94.0)</nobr><br/>11670"},{"name":"Hispanic/Latino","mental_health":"89.6<br><br/><nobr>(88.5-90.6)</nobr><br/>14016"},{"name":"Multiple - Non-Hispanic","mental_health":"82.1<br><br/><nobr>(77.5-85.9)</nobr><br/>1370"},{"name":"Native Hawaiian/other PI","mental_health":"81.3<br><br/><nobr>(72.0-88.1)</nobr><br/>274"},{"name":"White","mental_health":"84.8<br><br/><nobr>(83.4-86.1)</nobr><br/>23714"}]},{"name":"Male","race7":[{"name":"Am Indian / Alaska Native","mental_health":"91.5<br><br/><nobr>(87.3-94.3)</nobr><br/>832"},{"name":"Asian","mental_health":"81.3<br><br/><nobr>(78.1-84.1)</nobr><br/>2115"},{"name":"Black or African American","mental_health":"94.4<br><br/><nobr>(93.7-95.1)</nobr><br/>13866"},{"name":"Hispanic/Latino","mental_health":"91.5<br><br/><nobr>(90.6-92.3)</nobr><br/>17566"},{"name":"Multiple - Non-Hispanic","mental_health":"83.9<br><br/><nobr>(78.7-88.0)</nobr><br/>1509"},{"name":"Native Hawaiian/other PI","mental_health":"81.2<br><br/><nobr>(73.2-87.3)</nobr><br/>417"},{"name":"White","mental_health":"86.8<br><br/><nobr>(85.7-87.9)</nobr><br/>28769"}]}]},{"name":"qn9","mental_health":"14.2<br><br/><nobr>(13.4-15.1)</nobr><br/>186154","sex":[{"name":"Female","race7":[{"name":"Am Indian / Alaska Native","mental_health":"15.7<br><br/><nobr>(12.3-20.0)</nobr><br/>942"},{"name":"Asian","mental_health":"9.1<br><br/><nobr>(7.7-10.8)</nobr><br/>3065"},{"name":"Black or African American","mental_health":"15.8<br><br/><nobr>(14.5-17.3)</nobr><br/>21819"},{"name":"Hispanic/Latino","mental_health":"11.2<br><br/><nobr>(10.1-12.3)</nobr><br/>25577"},{"name":"Multiple - Non-Hispanic","mental_health":"7.3<br><br/><nobr>(5.7-9.5)</nobr><br/>2472"},{"name":"Native Hawaiian/other PI","mental_health":"11.1<br><br/><nobr>(7.5-16.2)</nobr><br/>492"},{"name":"White","mental_health":"9.8<br><br/><nobr>(8.9-10.8)</nobr><br/>37544"}]},{"name":"Male","race7":[{"name":"Am Indian / Alaska Native","mental_health":"22.4<br><br/><nobr>(18.4-27.0)</nobr><br/>1158"},{"name":"Asian","mental_health":"11.3<br><br/><nobr>(9.7-13.2)</nobr><br/>3219"},{"name":"Black or African American","mental_health":"22.7<br><br/><nobr>(21.0-24.3)</nobr><br/>19484"},{"name":"Hispanic/Latino","mental_health":"15.3<br><br/><nobr>(13.9-16.8)</nobr><br/>24735"},{"name":"Multiple - Non-Hispanic","mental_health":"14.0<br><br/><nobr>(11.3-17.1)</nobr><br/>2074"},{"name":"Native Hawaiian/other PI","mental_health":"21.9<br><br/><nobr>(16.4-28.7)</nobr><br/>605"},{"name":"White","mental_health":"16.7<br><br/><nobr>(15.4-18.1)</nobr><br/>38390"}]}]},{"name":"qn10","mental_health":"30.3<br><br/><nobr>(29.6-31.0)</nobr><br/>187101","sex":[{"name":"Female","race7":[{"name":"Am Indian / Alaska Native","mental_health":"31.1<br><br/><nobr>(27.2-35.3)</nobr><br/>944"},{"name":"Asian","mental_health":"19.1<br><br/><nobr>(17.3-21.0)</nobr><br/>3083"},{"name":"Black or African American","mental_health":"28.7<br><br/><nobr>(27.4-30.0)</nobr><br/>21781"},{"name":"Hispanic/Latino","mental_health":"35.5<br><br/><nobr>(34.3-36.7)</nobr><br/>25532"},{"name":"Multiple - Non-Hispanic","mental_health":"25.8<br><br/><nobr>(22.6-29.3)</nobr><br/>2512"},{"name":"Native Hawaiian/other PI","mental_health":"31.5<br><br/><nobr>(26.1-37.5)</nobr><br/>499"},{"name":"White","mental_health":"29.6<br><br/><nobr>(28.6-30.7)</nobr><br/>38052"}]},{"name":"Male","race7":[{"name":"Am Indian / Alaska Native","mental_health":"36.8<br><br/><nobr>(32.9-40.9)</nobr><br/>1154"},{"name":"Asian","mental_health":"21.3<br><br/><nobr>(19.1-23.6)</nobr><br/>3213"},{"name":"Black or African American","mental_health":"30.5<br><br/><nobr>(29.1-31.9)</nobr><br/>19434"},{"name":"Hispanic/Latino","mental_health":"35.3<br><br/><nobr>(34.0-36.6)</nobr><br/>24631"},{"name":"Multiple - Non-Hispanic","mental_health":"29.4<br><br/><nobr>(26.2-32.7)</nobr><br/>2109"},{"name":"Native Hawaiian/other PI","mental_health":"31.7<br><br/><nobr>(26.1-37.8)</nobr><br/>606"},{"name":"White","mental_health":"29.7<br><br/><nobr>(28.6-30.8)</nobr><br/>38931"}]}]}]}});
        });
    });

    it("invokeYRBS returns response even when there are errors with some questions", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race7","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn100000']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql(   {"table":{"question":[{"name":"qn8","mental_health":"87.4<br><br/><nobr>(86.5-88.3)</nobr><br/>121103","sex":[{"name":"Female","race7":[{"name":"Am Indian / Alaska Native","mental_health":"88.4<br><br/><nobr>(83.1-92.2)</nobr><br/>519"},{"name":"Asian","mental_health":"76.8<br><br/><nobr>(72.9-80.2)</nobr><br/>1541"},{"name":"Black or African American","mental_health":"92.9<br><br/><nobr>(91.5-94.0)</nobr><br/>11670"},{"name":"Hispanic/Latino","mental_health":"89.6<br><br/><nobr>(88.5-90.6)</nobr><br/>14016"},{"name":"Multiple - Non-Hispanic","mental_health":"82.1<br><br/><nobr>(77.5-85.9)</nobr><br/>1370"},{"name":"Native Hawaiian/other PI","mental_health":"81.3<br><br/><nobr>(72.0-88.1)</nobr><br/>274"},{"name":"White","mental_health":"84.8<br><br/><nobr>(83.4-86.1)</nobr><br/>23714"}]},{"name":"Male","race7":[{"name":"Am Indian / Alaska Native","mental_health":"91.5<br><br/><nobr>(87.3-94.3)</nobr><br/>832"},{"name":"Asian","mental_health":"81.3<br><br/><nobr>(78.1-84.1)</nobr><br/>2115"},{"name":"Black or African American","mental_health":"94.4<br><br/><nobr>(93.7-95.1)</nobr><br/>13866"},{"name":"Hispanic/Latino","mental_health":"91.5<br><br/><nobr>(90.6-92.3)</nobr><br/>17566"},{"name":"Multiple - Non-Hispanic","mental_health":"83.9<br><br/><nobr>(78.7-88.0)</nobr><br/>1509"},{"name":"Native Hawaiian/other PI","mental_health":"81.2<br><br/><nobr>(73.2-87.3)</nobr><br/>417"},{"name":"White","mental_health":"86.8<br><br/><nobr>(85.7-87.9)</nobr><br/>28769"}]}]},{"name":"qn9","mental_health":"14.2<br><br/><nobr>(13.4-15.1)</nobr><br/>186154","sex":[{"name":"Female","race7":[{"name":"Am Indian / Alaska Native","mental_health":"15.7<br><br/><nobr>(12.3-20.0)</nobr><br/>942"},{"name":"Asian","mental_health":"9.1<br><br/><nobr>(7.7-10.8)</nobr><br/>3065"},{"name":"Black or African American","mental_health":"15.8<br><br/><nobr>(14.5-17.3)</nobr><br/>21819"},{"name":"Hispanic/Latino","mental_health":"11.2<br><br/><nobr>(10.1-12.3)</nobr><br/>25577"},{"name":"Multiple - Non-Hispanic","mental_health":"7.3<br><br/><nobr>(5.7-9.5)</nobr><br/>2472"},{"name":"Native Hawaiian/other PI","mental_health":"11.1<br><br/><nobr>(7.5-16.2)</nobr><br/>492"},{"name":"White","mental_health":"9.8<br><br/><nobr>(8.9-10.8)</nobr><br/>37544"}]},{"name":"Male","race7":[{"name":"Am Indian / Alaska Native","mental_health":"22.4<br><br/><nobr>(18.4-27.0)</nobr><br/>1158"},{"name":"Asian","mental_health":"11.3<br><br/><nobr>(9.7-13.2)</nobr><br/>3219"},{"name":"Black or African American","mental_health":"22.7<br><br/><nobr>(21.0-24.3)</nobr><br/>19484"},{"name":"Hispanic/Latino","mental_health":"15.3<br><br/><nobr>(13.9-16.8)</nobr><br/>24735"},{"name":"Multiple - Non-Hispanic","mental_health":"14.0<br><br/><nobr>(11.3-17.1)</nobr><br/>2074"},{"name":"Native Hawaiian/other PI","mental_health":"21.9<br><br/><nobr>(16.4-28.7)</nobr><br/>605"},{"name":"White","mental_health":"16.7<br><br/><nobr>(15.4-18.1)</nobr><br/>38390"}]}]}]}});
        });
    });

    // The YRBS service is not returning results when no question
    xit("invokeYRBS service with no grouping", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":"81.4<br><br/><nobr>(77.0-85.1)</nobr><br/>8757"}]}} );
        });
    });

    it("getQuestionsTreeByYears from yrbs service using 'All'", function (){
        return yrbs.getQuestionsTreeByYears(["All"]).then(function (response) {
            expect(response.questionTree[0].text).to.eql("Unintentional Injuries and Violence");
            //Childrens are in alphabetical order
            expect(response.questionTree[0].children[0].text).to.eql("Attempted suicide that resulted in an injury, poisoning, or overdose that had to be treated by a doctor or nurse(during the 12 months before the survey)");
            expect(response.questionTree[0].children[1].text).to.eql("Attempted suicide(one or more times during the 12 months before the survey)");
            expect(response.questionTree[0].children[2].text).to.eql("Carried a gun(on at least 1 day during the 30 days before the survey)");
            expect(response.questionTree[1].text).to.eql("Tobacco Use");
            expect(response.questionTree[2].text).to.eql("Alcohol and Other Drug Use");
            expect(response.questionTree[3].text).to.eql("Sexual Behaviors");
            expect(response.questionTree[4].text).to.eql("Obesity, Overweight, and Weight Control");
            expect(response.questionTree[5].text).to.eql("Dietary Behaviors");
            expect(response.questionTree[6].text).to.eql("Physical Activity");
            expect(response.questionTree[7].text).to.eql("Other Health Topics");
        });
    });

    it("getQuestionsTreeByYears from yrbs service by year", function (){
        return yrbs.getQuestionsTreeByYears(["2015"]).then(function (response) {
            expect(response.questionTree[0].text).to.eql("Unintentional Injuries and Violence");
            //Childrens are in alphabetical order
            expect(response.questionTree[0].children[0].text).to.eql("Attempted suicide that resulted in an injury, poisoning, or overdose that had to be treated by a doctor or nurse(during the 12 months before the survey)");
            expect(response.questionTree[0].children[1].text).to.eql("Attempted suicide(one or more times during the 12 months before the survey)");
            expect(response.questionTree[0].children[2].text).to.eql("Carried a gun(on at least 1 day during the 30 days before the survey)");
            expect(response.questionTree[1].text).to.eql("Tobacco Use");
            expect(response.questionTree[2].text).to.eql("Alcohol and Other Drug Use");
            expect(response.questionTree[3].text).to.eql("Sexual Behaviors");
            expect(response.questionTree[4].text).to.eql("Obesity, Overweight, and Weight Control");
            expect(response.questionTree[5].text).to.eql("Dietary Behaviors");
            expect(response.questionTree[6].text).to.eql("Physical Activity");
            expect(response.questionTree[7].text).to.eql("Other Health Topics");
        });
    });
});
