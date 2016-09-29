'use strict';
(function() {
    angular
        .module('owh')
        .component('owhToggleSwitch', {
            templateUrl: 'app/components/owh-toggle-switch/owhToggleSwitch.html',
            controller: OWHToggleSwitchController,
            controllerAs: 'otsc',
            transclude: true,
            bindings: {
                options: '<',
                model: '=',
                tooltip: '@',
                onChange: '&'
            }
        });

    OWHToggleSwitchController.$inject = ['$scope'];

    function OWHToggleSwitchController($scope) {
        var otsc = this;
        $scope.$watch('otsc.model', function (newValue, oldValue) {
            //make sure doesnt trigger on init
            if(newValue !== oldValue) {
                otsc.onChange();
            }

        });
    }

}());
