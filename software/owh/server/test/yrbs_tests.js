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
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=sex,race','q=qn2&v=sex,race','q=qn3&v=sex,race']);

    });

    it("buildYRBSQueries with all grouping params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsGrade","queryKey":"grade","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=sex,grade,race','q=qn2&v=sex,grade,race','q=qn3&v=sex,grade,race']);

    });

    it("buildYRBSQueries with no grouping params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
                        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1','q=qn2','q=qn3']);

    });

    it("buildYRBSQueries with only filtering params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}, 'race':{value:['White', 'Black or African American']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&f=race:White,Black or African American','q=qn2&f=race:White,Black or African American','q=qn3&f=race:White,Black or African American']);

    });


    it("buildYRBSQueries with grouping and filtering params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000}]}},
        'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}, 'race':{value:['White', 'Black or African American']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=race&f=race:White,Black or African American','q=qn2&v=race&f=race:White,Black or African American','q=qn3&v=race&f=race:White,Black or African American']);

    });

    it("buildYRBSQueries with multiple grouping and filtering params", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn1', 'qn2', 'qn3']}, 'race':{value:['White', 'Black or African American']},'sex':{value:['Female']}}};
        var result = yrbs.buildYRBSQueries(apiQuery);
        expect(result).to.eql( ['q=qn1&v=sex,race&f=race:White,Black or African American;sex:Female','q=qn2&v=sex,race&f=race:White,Black or African American;sex:Female','q=qn3&v=sex,race&f=race:White,Black or African American;sex:Female']);

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
                        "mental_health": {
                            "mean": 63.2,
                            "ci_l": 60.6,
                            "ci_u": 65.8,
                            "count": 15049
                        },
                        "sex":[
                            {
                                "name":"Female",
                                "mental_health": {
                                    "mean": 65.3,
                                    "ci_l": 61.5,
                                    "ci_u": 69.0,
                                    "count": 7518
                                }
                            },
                            {
                                "name":"Male",
                                "mental_health": {
                                    "mean": 61.4,
                                    "ci_l": 59.1,
                                    "ci_u": 63.7,
                                    "count": 7424
                                }
                            }
                        ]
                    },
                    {
                        "name":"qn45",
                        "mental_health": {
                            "mean": 63.2,
                            "ci_l": 60.6,
                            "ci_u": 65.8,
                            "count": 15049
                        },
                        "sex":[
                            {
                                "name":"Female",
                                "mental_health": {
                                    "mean": 65.3,
                                    "ci_l": 61.5,
                                    "ci_u": 69.0,
                                    "count": 7518
                                }
                            },
                            {
                                "name":"Male",
                                "mental_health": {
                                    "mean": 61.4,
                                    "ci_l": 59.1,
                                    "ci_u": 63.7,
                                    "count": 7424
                                }
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
                        "mental_health": {
                            "mean": 63.3,
                            "ci_l": 60.6,
                            "ci_u": 65.8,
                            "count": 15049
                        }
                    },
                    {
                        "name":"qn46",
                        "mental_health": {
                            "mean": 63.2,
                            "ci_l": 60.6,
                            "ci_u": 65.0,
                            "count": 15049
                        }
                    }
                ]
            }
        });
    });

    it("processYRBSReponses with multiple groupings result nested in order Sex, race", function (){
        var yrbsresp = [{"q":"qn41","results":[{"mean":0.6325,"level":0,"se":0.013,"ci_u":0.6584,"count":15049.0,"ci_l":0.6058},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.073,"race":"Am Indian \/ Alaska Native","mean":0.6174,"ci_l":0.4551,"count":63.0,"ci_u":0.7572},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0678,"race":"Am Indian \/ Alaska Native","mean":0.7752,"ci_l":0.6081,"count":92.0,"ci_u":0.8846},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0372,"race":"Asian","mean":0.4449,"ci_l":0.3704,"count":302.0,"ci_u":0.522},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0371,"race":"Asian","mean":0.4212,"ci_l":0.3477,"count":308.0,"ci_u":0.4984},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0326,"race":"Black or African American","mean":0.579,"ci_l":0.5115,"count":776.0,"ci_u":0.6436},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0308,"race":"Black or African American","mean":0.5103,"ci_l":0.4479,"count":776.0,"ci_u":0.5723},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0177,"race":"Hispanic \/ Latino","mean":0.6521,"ci_l":0.6149,"count":1150.0,"ci_u":0.6875},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0257,"race":"Hispanic \/ Latino","mean":0.6087,"ci_l":0.5553,"count":1134.0,"ci_u":0.6597},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0182,"race":"Multiple - Hispanic","mean":0.7141,"ci_l":0.6759,"count":1323.0,"ci_u":0.7495},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0157,"race":"Multiple - Hispanic","mean":0.6546,"ci_l":0.6223,"count":1296.0,"ci_u":0.6856},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0333,"race":"Multiple - Non-Hispanic","mean":0.7523,"ci_l":0.6788,"count":376.0,"ci_u":0.8135},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0356,"race":"Multiple - Non-Hispanic","mean":0.6618,"ci_l":0.5863,"count":331.0,"ci_u":0.7298},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.1282,"race":"Native Hawaiian\/other PI","mean":0.3912,"ci_l":0.1525,"count":22.0,"ci_u":0.6965},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0587,"race":"Native Hawaiian\/other PI","mean":0.73,"ci_l":0.5927,"count":71.0,"ci_u":0.834},{"sex":"Female","q_resp":true,"level":2,"q":"qn41","se":0.0295,"race":"White","mean":0.6672,"ci_l":0.6051,"count":3386.0,"ci_u":0.7239},{"sex":"Male","q_resp":true,"level":2,"q":"qn41","se":0.0151,"race":"White","mean":0.6402,"ci_l":0.6092,"count":3266.0,"ci_u":0.67}],"response":true,"question":"Ever drank alcohol","var_levels":{"sex":{"question":"What is your sex","responses":[["1","Female"],["2","Male"]]},"race":{"question":"Race\/Ethnicity","responses":[["1","Am Indian \/ Alaska Native"],["2","Asian"],["3","Black or African American"],["4","Native Hawaiian\/other PI"],["5","White"],["6","Hispanic \/ Latino"],["7","Multiple - Hispanic"],["8","Multiple - Non-Hispanic"]]}},"vars":["race","sex"]}];
        var result = yrbs.processYRBSReponses(yrbsresp);
        expect(result).to.eql( {
            "table":{
                "question":[
                    {
                        "name":"qn41",
                        "mental_health": {
                            "mean": "63.2",
                            "ci_l": "60.6",
                            "ci_u": "65.8",
                            "count": 15049
                        },
                        "sex":[
                            {
                                "name":"Female",
                                "race":[
                                    {
                                        "name":"Am Indian / Alaska Native",
                                        "mental_health": {
                                            "mean": "61.7",
                                            "ci_l": "45.5",
                                            "ci_u": "75.7",
                                            "count": 63
                                        }
                                    },
                                    {
                                        "name":"Asian",
                                        "mental_health": {
                                            "mean": "44.5",
                                            "ci_l": "37.0",
                                            "ci_u": "52.2",
                                            "count": 302
                                        }
                                    },
                                    {
                                        "name":"Black or African American",
                                        "mental_health": {
                                            "mean": "57.9",
                                            "ci_l": "51.1",
                                            "ci_u": "64.4",
                                            "count": 776
                                        }
                                    },
                                    {
                                        "name":"Hispanic / Latino",
                                        "mental_health": {
                                            "mean": "65.2",
                                            "ci_l": "61.5",
                                            "ci_u": "68.8",
                                            "count": 1150
                                        }
                                    },
                                    {
                                        "name":"Multiple - Hispanic",
                                        "mental_health": {
                                            "mean": "71.4",
                                            "ci_l": "67.6",
                                            "ci_u": "75.0",
                                            "count": 1323
                                        }
                                    },
                                    {
                                        "name":"Multiple - Non-Hispanic",
                                        "mental_health": {
                                            "mean": "75.2",
                                            "ci_l": "67.9",
                                            "ci_u": "81.3",
                                            "count": 376
                                        }
                                    },
                                    {
                                        "name":"Native Hawaiian/other PI",
                                        "mental_health": {
                                            "mean": "39.1",
                                            "ci_l": "15.3",
                                            "ci_u": "69.7",
                                            "count": 22
                                        }
                                    },
                                    {
                                        "name":"White",
                                        "mental_health": {
                                            "mean": "66.7",
                                            "ci_l": "60.5",
                                            "ci_u": "72.4",
                                            "count": 3386
                                        }
                                    }
                                ]
                            },
                            {
                                "name":"Male",
                                "race":[
                                    {
                                        "name":"Am Indian / Alaska Native",
                                        "mental_health": {
                                            "mean": "77.5",
                                            "ci_l": "60.8",
                                            "ci_u": "88.5",
                                            "count": 92
                                        }
                                    },
                                    {
                                        "name":"Asian",
                                        "mental_health": {
                                            "mean": "42.1",
                                            "ci_l": "34.8",
                                            "ci_u": "49.8",
                                            "count": 308
                                        }
                                    },
                                    {
                                        "name":"Black or African American",
                                        "mental_health": {
                                            "mean": "51.0",
                                            "ci_l": "44.8",
                                            "ci_u": "57.2",
                                            "count": 776
                                        }
                                    },
                                    {
                                        "name":"Hispanic / Latino",
                                        "mental_health": {
                                            "mean": "60.9",
                                            "ci_l": "55.5",
                                            "ci_u": "66.0",
                                            "count": 1134
                                        }
                                    },
                                    {
                                        "name":"Multiple - Hispanic",
                                        "mental_health": {
                                            "mean": "65.5",
                                            "ci_l": "62.2",
                                            "ci_u": "68.6",
                                            "count": 1296
                                        }
                                    },
                                    {
                                        "name":"Multiple - Non-Hispanic",
                                        "mental_health": {
                                            "mean": "66.2",
                                            "ci_l": "58.6",
                                            "ci_u": "73.0",
                                            "count": 331
                                        }
                                    },
                                    {
                                        "name":"Native Hawaiian/other PI",
                                        "mental_health": {
                                            "mean": "73.0",
                                            "ci_l": "59.3",
                                            "ci_u": "83.4",
                                            "count": 71
                                        }
                                    },
                                    {
                                        "name":"White",
                                        "mental_health": {
                                            "mean": "64.0",
                                            "ci_l": "60.9",
                                            "ci_u": "67.0",
                                            "count": 3266
                                        }
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
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn10']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":{"mean":"87.4","ci_l":"86.5","ci_u":"88.3","count":121103},"sex":[{"name":"Female","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"88.4","ci_l":"83.1","ci_u":"92.2","count":519}},{"name":"Asian","mental_health":{"mean":"76.8","ci_l":"72.9","ci_u":"80.2","count":1541}},{"name":"Black or African American","mental_health":{"mean":"92.9","ci_l":"91.5","ci_u":"94.0","count":11670}},{"name":"Hispanic/Latino","mental_health":{"mean":"89.6","ci_l":"88.5","ci_u":"90.6","count":14016}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"82.1","ci_l":"77.5","ci_u":"85.9","count":1370}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"81.3","ci_l":"72.0","ci_u":"88.1","count":274}},{"name":"White","mental_health":{"mean":"84.8","ci_l":"83.4","ci_u":"86.1","count":23714}}]},{"name":"Male","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"91.5","ci_l":"87.3","ci_u":"94.3","count":832}},{"name":"Asian","mental_health":{"mean":"81.3","ci_l":"78.1","ci_u":"84.1","count":2115}},{"name":"Black or African American","mental_health":{"mean":"94.4","ci_l":"93.7","ci_u":"95.1","count":13866}},{"name":"Hispanic/Latino","mental_health":{"mean":"91.5","ci_l":"90.6","ci_u":"92.3","count":17566}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"83.9","ci_l":"78.7","ci_u":"88.0","count":1509}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"81.2","ci_l":"73.2","ci_u":"87.3","count":417}},{"name":"White","mental_health":{"mean":"86.8","ci_l":"85.7","ci_u":"87.9","count":28769}}]}]},{"name":"qn9","mental_health":{"mean":"14.2","ci_l":"13.4","ci_u":"15.1","count":186154},"sex":[{"name":"Female","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"15.7","ci_l":"12.3","ci_u":"20.0","count":942}},{"name":"Asian","mental_health":{"mean":"9.1","ci_l":"7.7","ci_u":"10.8","count":3065}},{"name":"Black or African American","mental_health":{"mean":"15.8","ci_l":"14.5","ci_u":"17.3","count":21819}},{"name":"Hispanic/Latino","mental_health":{"mean":"11.2","ci_l":"10.1","ci_u":"12.3","count":25577}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"7.3","ci_l":"5.7","ci_u":"9.5","count":2472}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"11.1","ci_l":"7.5","ci_u":"16.2","count":492}},{"name":"White","mental_health":{"mean":"9.8","ci_l":"8.9","ci_u":"10.8","count":37544}}]},{"name":"Male","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"22.4","ci_l":"18.4","ci_u":"27.0","count":1158}},{"name":"Asian","mental_health":{"mean":"11.3","ci_l":"9.7","ci_u":"13.2","count":3219}},{"name":"Black or African American","mental_health":{"mean":"22.7","ci_l":"21.0","ci_u":"24.3","count":19484}},{"name":"Hispanic/Latino","mental_health":{"mean":"15.3","ci_l":"13.9","ci_u":"16.8","count":24735}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"14.0","ci_l":"11.3","ci_u":"17.1","count":2074}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"21.9","ci_l":"16.4","ci_u":"28.7","count":605}},{"name":"White","mental_health":{"mean":"16.7","ci_l":"15.4","ci_u":"18.1","count":38390}}]}]},{"name":"qn10","mental_health":{"mean":"30.3","ci_l":"29.6","ci_u":"31.0","count":187101},"sex":[{"name":"Female","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"31.1","ci_l":"27.2","ci_u":"35.3","count":944}},{"name":"Asian","mental_health":{"mean":"19.1","ci_l":"17.3","ci_u":"21.0","count":3083}},{"name":"Black or African American","mental_health":{"mean":"28.7","ci_l":"27.4","ci_u":"30.0","count":21781}},{"name":"Hispanic/Latino","mental_health":{"mean":"35.5","ci_l":"34.3","ci_u":"36.7","count":25532}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"25.8","ci_l":"22.6","ci_u":"29.3","count":2512}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"31.5","ci_l":"26.1","ci_u":"37.5","count":499}},{"name":"White","mental_health":{"mean":"29.6","ci_l":"28.6","ci_u":"30.7","count":38052}}]},{"name":"Male","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"36.8","ci_l":"32.9","ci_u":"40.9","count":1154}},{"name":"Asian","mental_health":{"mean":"21.3","ci_l":"19.1","ci_u":"23.6","count":3213}},{"name":"Black or African American","mental_health":{"mean":"30.5","ci_l":"29.1","ci_u":"31.9","count":19434}},{"name":"Hispanic/Latino","mental_health":{"mean":"35.3","ci_l":"34.0","ci_u":"36.6","count":24631}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"29.4","ci_l":"26.2","ci_u":"32.7","count":2109}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"31.7","ci_l":"26.1","ci_u":"37.8","count":606}},{"name":"White","mental_health":{"mean":"29.7","ci_l":"28.6","ci_u":"30.8","count":38931}}]}]}]}} );
        });
    });

    xit("invokeYRBS returns response even when there are errors with some questions", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8', 'qn9', 'qn100000']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql(   {"table":{"question":[{"name":"qn8","mental_health":{"mean":"87.4","ci_l":"86.5","ci_u":"88.3","count":121103},"sex":[{"name":"Female","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"88.4","ci_l":"83.1","ci_u":"92.2","count":519}},{"name":"Asian","mental_health":{"mean":"76.8","ci_l":"72.9","ci_u":"80.2","count":1541}},{"name":"Black or African American","mental_health":{"mean":"92.9","ci_l":"91.5","ci_u":"94.0","count":11670}},{"name":"Hispanic/Latino","mental_health":{"mean":"89.6","ci_l":"88.5","ci_u":"90.6","count":14016}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"82.1","ci_l":"77.5","ci_u":"85.9","count":1370}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"81.3","ci_l":"72.0","ci_u":"88.1","count":274}},{"name":"White","mental_health":{"mean":"84.8","ci_l":"83.4","ci_u":"86.1","count":23714}}]},{"name":"Male","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"91.5","ci_l":"87.3","ci_u":"94.3","count":832}},{"name":"Asian","mental_health":{"mean":"81.3","ci_l":"78.1","ci_u":"84.1","count":2115}},{"name":"Black or African American","mental_health":{"mean":"94.4","ci_l":"93.7","ci_u":"95.1","count":13866}},{"name":"Hispanic/Latino","mental_health":{"mean":"91.5","ci_l":"90.6","ci_u":"92.3","count":17566}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"83.9","ci_l":"78.7","ci_u":"88.0","count":1509}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"81.2","ci_l":"73.2","ci_u":"87.3","count":417}},{"name":"White","mental_health":{"mean":"86.8","ci_l":"85.7","ci_u":"87.9","count":28769}}]}]},{"name":"qn9","mental_health":{"mean":"14.2","ci_l":"13.4","ci_u":"15.1","count":186154},"sex":[{"name":"Female","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"15.7","ci_l":"12.3","ci_u":"20.0","count":942}},{"name":"Asian","mental_health":{"mean":"9.1","ci_l":"7.7","ci_u":"10.8","count":3065}},{"name":"Black or African American","mental_health":{"mean":"15.8","ci_l":"14.5","ci_u":"17.3","count":21819}},{"name":"Hispanic/Latino","mental_health":{"mean":"11.2","ci_l":"10.1","ci_u":"12.3","count":25577}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"7.3","ci_l":"5.7","ci_u":"9.5","count":2472}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"11.1","ci_l":"7.5","ci_u":"16.2","count":492}},{"name":"White","mental_health":{"mean":"9.8","ci_l":"8.9","ci_u":"10.8","count":37544}}]},{"name":"Male","race":[{"name":"Am Indian / Alaska Native","mental_health":{"mean":"22.4","ci_l":"18.4","ci_u":"27.0","count":1158}},{"name":"Asian","mental_health":{"mean":"11.3","ci_l":"9.7","ci_u":"13.2","count":3219}},{"name":"Black or African American","mental_health":{"mean":"22.7","ci_l":"21.0","ci_u":"24.3","count":19484}},{"name":"Hispanic/Latino","mental_health":{"mean":"15.3","ci_l":"13.9","ci_u":"16.8","count":24735}},{"name":"Multiple - Non-Hispanic","mental_health":{"mean":"14.0","ci_l":"11.3","ci_u":"17.1","count":2074}},{"name":"Native Hawaiian/other PI","mental_health":{"mean":"21.9","ci_l":"16.4","ci_u":"28.7","count":605}},{"name":"White","mental_health":{"mean":"16.7","ci_l":"15.4","ci_u":"18.1","count":38390}}]}]}]}} );
        });
    });

    it("invokeYRBS service with no grouping", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":{"mean":"87.4","ci_l":"86.5","ci_u":"88.3","count":121103}}]}} );
        });
    });

    it("invokeYRBS service with grouping and filtering", function (){
        var apiQuery = {'aggregations':{'nested':{'table':[{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000},{"key":"yrbsSex","queryKey":"sex","size":100000}]}},
            'query': {'question.path':{ 'value': ['qn8']}, 'race':{value:['White', 'Black or African American']},'sex':{value:['Female']}}};

        return yrbs.invokeYRBSService(apiQuery).then( function (resp) {
            expect(resp).to.eql( {"table":{"question":[{"name":"qn8","mental_health":{"mean":"86.1","ci_l":"84.9","ci_u":"87.3","count":35384},"sex":[{"name":"Female","race":[{"name":"Black or African American","mental_health":{"mean":"92.9","ci_l":"91.5","ci_u":"94.0","count":11670}},{"name":"White","mental_health":{"mean":"84.8","ci_l":"83.4","ci_u":"86.1","count":23714}}]}]}]}} );
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
            //Verify questionsList
            expect(response.questionsList[0].qkey).to.eql("qn11");
            expect(response.questionsList[0].title).to.eql("Drove when drinking alcohol(in a car or other vehicle one or more times during the 30 days before the survey, among students who had driven a car or other vehicle during the 30 days before the survey)");
            expect(response.questionsList[1].qkey).to.eql("qn12");
            expect(response.questionsList[1].title).to.eql("Texted or e-mailed while driving a car or other vehicle(on at least 1 day during the 30 days before the survey, among students who had driven a car or other vehicle during the 30 days before the survey)");
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
            //Verify questionsList
            expect(response.questionsList[0].qkey).to.eql("qn11");
            expect(response.questionsList[0].title).to.eql("Drove when drinking alcohol(in a car or other vehicle one or more times during the 30 days before the survey, among students who had driven a car or other vehicle during the 30 days before the survey)");
            expect(response.questionsList[1].qkey).to.eql("qn12");
            expect(response.questionsList[1].title).to.eql("Texted or e-mailed while driving a car or other vehicle(on at least 1 day during the 30 days before the survey, among students who had driven a car or other vehicle during the 30 days before the survey)");

        });
    });
});
