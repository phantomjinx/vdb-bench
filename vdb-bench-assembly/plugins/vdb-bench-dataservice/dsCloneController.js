(function () {
    'use strict';

    var pluginName = 'vdb-bench.dataservice';
    var pluginDirName = 'vdb-bench-dataservice';

    angular
        .module(pluginName)
        .controller('DSCloneController', DSCloneController);

    DSCloneController.$inject = ['$translate', 'RepoRestService', 'DSSelectionService',
                                 'DSPageService', 'DialogService'];

    function DSCloneController($translate, RepoRestService, DSSelectionService,
                               DSPageService, DialogService) {
        var vm = this;
        vm.serviceName = '';
        vm.nameErrorMsg = '';

        /*
         * Set a custom title to the page including the data service's id
         */
        var page = DSPageService.page(DSPageService.CLONE_DATASERVICE_PAGE);
        DSPageService.setCustomTitle(page.id, page.title + " '" + DSSelectionService.selectedDataService().keng__id + "'");

        /**
         * Indicates if the data service name is invalid.
         */
        vm.hasInvalidName = function() {
            return !_.isEmpty( vm.nameErrorMsg );
        };

        /**
         * Handler for changes to the data service name.
         */
        vm.serviceNameChanged = function() {
            if ( _.isEmpty( vm.serviceName ) ) {
                vm.nameErrorMsg = $translate.instant( 'editWizardService.nameRequired' );
            } else {
                try {
                    var name = encodeURIComponent( vm.serviceName );

                    RepoRestService.validateDataServiceName( name ).then(
                        function ( result ) {
                            vm.nameErrorMsg = result;
                        },
                        function ( response ) {
                            var errorMsg = $translate.instant( 'editWizardService.validateDataServiceNameError' );
                            DialogService.basicInfoMsg( errorMsg + "\n" + RepoRestService.responseMessage( response ) ,
                                                        "Failure to validate service name");
                        }
                    );
                } catch ( error ) {
                    var errorMsg = $translate.instant( 'editWizardService.validateDataServiceNameError' );
                    DialogService.basicInfoMsg( errorMsg + "\n" + error ,
                                                "Failure to validate service name");
                }
            }
        };

        /**
         * Event handler for clicking the clone button
         */
        vm.onCloneDataServiceClicked = function ( dataserviceName, newDataserviceName ) {
            try {
                RepoRestService.cloneDataService( dataserviceName, newDataserviceName ).then(
                    function () {
                        // Reinitialise the list of data services
                        DSSelectionService.refresh('dataservice-summary');
                    },
                    function (response) {
                	   DialogService.basicInfoMsg($translate.instant('dsCloneController.cloneFailedMsg',
                                                    {response: RepoRestService.responseMessage(response)}),
                                                    "Failure to clone data service");
                    });
            } catch (error) {
                DialogService.basicInfoMsg($translate.instant('dsCloneController.cloneFailedMsg',
                                             {response: RepoRestService.responseMessage(error)}),
                                             "Failure to clone data service");
            }
        };

        vm.serviceNameChanged();
    }

})();
