'use strict';

describe("Home Controller: ", function(){

    var $controller, homeController, $scope;

    beforeEach( function() {
        module('owh');
        inject(function (_$controller_, _$rootScope_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching                $
            $controller = _$controller_;
            $scope= _$rootScope_.$new();
            homeController= $controller('HomeController',{$scope:$scope});
        });
    });


    it(" Should execute showPhaseTwoWarningModal", function(){
        homeController.showPhaseTwoWarningModal("message on modal")
    });

    it(" Should execute toggleSlideUp", function(){
        homeController.toggleSlideUp("divId");
    });

    it(" Should execute toggleSlideDown", function(){
        homeController.toggleSlideDown("divId");
    });

});