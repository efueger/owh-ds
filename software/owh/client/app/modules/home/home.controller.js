(function(){
    angular
        .module('owh.home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'searchFactory'];

    function HomeController($scope, searchFactory) {
        var hc = this;
        hc.showPhaseTwoWarningModal = showPhaseTwoWarningModal;
        hc.toggleSlideUp = toggleSlideUp;
        hc.toggleSlideDown = toggleSlideDown;
        var root = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
        root.setAttribute( 'class', 'parallax' );

        function showPhaseTwoWarningModal(message) {
            searchFactory.showPhaseTwoModal(message);
        }

        function toggleSlideUp(id) {
            jQuery('#' + id).slideUp();
        }

        function toggleSlideDown(id) {
            jQuery('#' + id).slideDown();
        }
    }
}());