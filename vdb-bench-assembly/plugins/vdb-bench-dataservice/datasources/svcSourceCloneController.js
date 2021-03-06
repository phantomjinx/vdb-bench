(function () {
    'use strict';

    var pluginName = 'vdb-bench.dataservice';
    var pluginDirName = 'vdb-bench-dataservice';

    angular
        .module(pluginName)
        .controller('SvcSourceCloneController', SvcSourceCloneController);

    SvcSourceCloneController.$inject = ['$scope', '$rootScope', '$translate', 'RepoRestService',
                                        'SvcSourceSelectionService', 'CredentialService', 'DSPageService',
                                        'DialogService'];

    function SvcSourceCloneController($scope, $rootScope, $translate, RepoRestService,
                                      SvcSourceSelectionService, CredentialService, DSPageService,
                                      DialogService) {
        var vm = this;
        vm.cloneVdbInProgress = false;
        vm.sourceName = '';
        vm.nameErrorMsg = '';

        /*
         * Set a custom title to the page including the service source's id
         */
        var page = DSPageService.page(DSPageService.SERVICESOURCE_CLONE_PAGE);
        DSPageService.setCustomTitle(page.id, page.title + " '" + SvcSourceSelectionService.selectedServiceSource().keng__id + "'");

        /**
         * Indicates if the data source name is invalid.
         */
        vm.hasInvalidName = function() {
            return !_.isEmpty( vm.nameErrorMsg );
        };

        /**
         * Handler for changes to the data source name.
         */
        vm.sourceNameChanged = function() {
            if ( _.isEmpty( vm.sourceName ) ) {
                vm.nameErrorMsg = $translate.instant( 'datasourceWizardService.nameRequired' );
            } else {
                try {
                    var name = encodeURIComponent( vm.sourceName );

                    RepoRestService.validateDataSourceName( name ).then(
                        function ( result ) {
                            vm.nameErrorMsg = result;

                            // since a data source is really a VDB, replace VDB with Data Source so 
                            // user will not be confused (see DatasourceWizardService.js for same code)
                            if ( !_.isEmpty( vm.nameErrorMsg ) ) {
                                vm.nameErrorMsg = vm.nameErrorMsg.replace( "VDB", $translate.instant( 'shared.Source' ) );
                            }
                        },
                        function ( response ) {
                            var errorMsg = $translate.instant( 'datasourceWizardService.validateDataSourceNameError' );
                            DialogService.basicInfoMsg( errorMsg + "\n" + RepoRestService.responseMessage( response ) ,
                                                        "Failure validating data source name");
                        }
                    );
                } catch ( error ) {
                    var errorMsg = $translate.instant( 'datasourceWizardService.validateDataSourceNameError' );
                    DialogService.basicInfoMsg( errorMsg + "\n" + error ,
                                                "Failure validating data source name");
                }
            }
        };

        /*
         * When loading finishes on copy / deploy
         */
        $scope.$on('loadingServiceSourcesChanged', function (event, loadingState) {
            if(loadingState === false) {
                vm.cloneVdbInProgress = false;
            }
        });

        /**
         * Event handler for clicking the clone button
         */
        vm.onCloneSvcSourceClicked = function ( svcSourceName, newSvcSourceName ) {
            // Set loading true for modal popup
           vm.cloneVdbInProgress = true;
           SvcSourceSelectionService.setLoading(true);
           var svcSource = SvcSourceSelectionService.selectedServiceSource();

           try {
                RepoRestService.cloneVdb( svcSourceName, newSvcSourceName ).then(
                    function () {
                        if( !ownerIsCurrentUser( svcSource ) ) {
                            updateVdbOwner( newSvcSourceName );	
                        } else {
                            deployVdb(newSvcSourceName);
                        }
                    },
                    function (response) {
                        var copyFailedMsg = $translate.instant('svcSourceCloneController.copyFailedMsg');
                        DialogService.basicInfoMsg(copyFailedMsg + "\n" + RepoRestService.responseMessage(response),
                                                    "Error clone failure");
                    });
            } catch (error) {
                var copyFailedMsg = $translate.instant('svcSourceCloneController.copyFailedMsg');
                DialogService.basicInfoMsg(copyFailedMsg + "\n" + error,
                                            "Error clone failure");
            }
        };

        /**
         * Determine if owner of the datasource is the currently logged in user
         */
        function ownerIsCurrentUser( datasource ) {
            var owner = SvcSourceSelectionService.getServiceSourceOwner(datasource);
            if( owner === CredentialService.credentials().username ) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Updates the VDB owner to the current user then deploys the VDB
         */
        function updateVdbOwner( svcSourceName ) {
            try {
                var description = SvcSourceSelectionService.selectedServiceSource().vdb__description;
                RepoRestService.updateVdb( svcSourceName, description, true ).then(
                    function (theModel) {
                        deployVdb(svcSourceName);
                    },
                    function (response) {
                        var copyFailedMsg = $translate.instant('svcSourceCloneController.copyFailedMsg');
                        DialogService.basicInfoMsg(copyFailedMsg + "\n" + RepoRestService.responseMessage(response),
                                                    "Error updating data source owner");
                    });
            } catch (error) {
                var copyFailedMsg = $translate.instant('svcSourceCloneController.copyFailedMsg');
                DialogService.basicInfoMsg(copyFailedMsg + "\n" + error,
                                            "Error updating data source owner");
            }
        }

        /**
         * Deploys the specified VDB to the server
         */
        function deployVdb(vdbName) {
            // Deploy the VDB to the server.  At the end, fire notification to go to summary page
            try {
                SvcSourceSelectionService.setDeploying(true, vdbName, false, null);
                RepoRestService.deployVdb( vdbName ).then(
                    function ( result ) {
                        vm.deploymentSuccess = (result.Information.deploymentSuccess === "true");
                        if(vm.deploymentSuccess === true) {
                            SvcSourceSelectionService.setDeploying(false, vdbName, true, null);
                        } else {
                            SvcSourceSelectionService.setDeploying(false, vdbName, false, result.Information.ErrorMessage1);
                        }
                        // Reinitialise the list of service sources
                        SvcSourceSelectionService.refresh('datasource-summary');
                   },
                    function (response) {
                        SvcSourceSelectionService.setDeploying(false, vdbName, false, RepoRestService.responseMessage(response));
                        var deployFailedMsg = $translate.instant('svcSourceCloneController.deployFailedMsg');
                        DialogService.basicInfoMsg(deployFailedMsg + "\n" + RepoRestService.responseMessage(response),
                                                    "Failure to deploy");
                    });
            } catch (error) {} finally {
            }
        }

        vm.sourceNameChanged();

    }

})();
