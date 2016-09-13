'use strict';
(function(){
    angular
        .module('owh')
        .component("owhFooter",{
            templateUrl: 'app/partials/footer.html',
            controller: FooterController,
            controllerAs: 'fc'
        });

    FooterController.$inject = ['$scope', 'searchFactory'];

    function FooterController($scope, searchFactory){
        var fc = this;
        fc.showPhaseTwoWarningModal = showPhaseTwoWarningModal;

        function showPhaseTwoWarningModal(message) {
            searchFactory.showPhaseTwoModal(message);
        }
    }
}());