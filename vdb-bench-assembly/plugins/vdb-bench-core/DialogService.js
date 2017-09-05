/**
 * Dialog Service
 *
 * Provides standard dialog windows for display of information
 */
(function () {

    'use strict';

    var pluginName = 'vdb-bench.core';
    var pluginDirName = 'vdb-bench-core';

    angular
        .module(pluginName)
        .controller('ModalDialogCtrl', ModalDialogCtrl)
        .factory('DialogService', DialogService);

    ModalDialogCtrl.$inject = ['$scope','$uibModalInstance'];

    DialogService.$inject = ['SYNTAX', 'CONFIG', '$uibModal'];

    function ModalDialogCtrl($scope, $uibModalInstance) {
    	$scope.close = function(){
    		$uibModalInstance.close();
    		$scope.$destroy();
    	}; // end close

        $scope.isCollapsed = true;
    }

    function DialogService(SYNTAX, CONFIG, $uibModal) {

        /*
         * Service instance to be returned
         */
        var service = {};

        service.basicInfoMsg = function(message, title) {
            var modalTemplate = '<div class="modal-header">';

            if (title)
                modalTemplate = modalTemplate + '<h3 class="modal-title">' + title + '</h3>';

            modalTemplate = modalTemplate + '</div>';

            var detail = null;
            if (message.includes("-----")) {
                var components = message.split("-----");
                message = components[0];
                detail = components[1];
            }

            modalTemplate = modalTemplate + '<div class="modal-body" style="height: 200px; overflow-y: auto;">';

            modalTemplate = modalTemplate + '<div>';
            modalTemplate = modalTemplate + '<h4 style="padding: 0 1em;">' + message + '</h4>';
            modalTemplate = modalTemplate + "</div>";

            if (detail != null) {
                modalTemplate = modalTemplate + '<button type="button" class="btn btn-default" ng-click="isCollapsed = !isCollapsed">Details >>></button>';
                modalTemplate = modalTemplate + '<hr>';
                modalTemplate = modalTemplate + '<div uib-collapse="isCollapsed">';
                modalTemplate = modalTemplate + '<div class="well well-lg" style="margin-right: 0.5em;">';
                modalTemplate = modalTemplate + '<div style="overflow-x: auto;">' + detail + '</div>';
                modalTemplate = modalTemplate + '</div>';
                modalTemplate = modalTemplate + '</div>';
            }

            modalTemplate = modalTemplate + '</div>';
            modalTemplate = modalTemplate + '<div class="modal-footer">';
            modalTemplate = modalTemplate + '<button class="btn btn-warning" ng-click="$dismiss()">OK</button>';
            modalTemplate = modalTemplate + '</div>';

            var modal = $uibModal.open({
				controller : 'ModalDialogCtrl',
                animation: 'true',
                backdrop: 'false',
                template: modalTemplate
            });
        };

        return service;
    }
})();
