(function () {
    'use strict';

    var pluginName = 'vdb-bench.widgets';
    var pluginDirName = 'vdb-bench-widgets';

    angular
        .module(pluginName)
        .directive('vdbList', VdbList);

    VdbList.$inject = ['CONFIG', 'SYNTAX'];
    VdbListController.$inject = ['VdbSelectionService', 'RepoRestService',
                                 'REST_URI', 'SYNTAX', 'VDB_KEYS',
                                 'DownloadService', '$scope', 'DialogService'];

    function VdbList(config, syntax) {
        var directive = {
            restrict: 'E',
            scope: {},
            bindToController: {
                open: '=',
                vdbType: '@',
                showButtons: '=',
            },
            controller: VdbListController,
            controllerAs: 'vm',
            templateUrl: config.pluginDir + syntax.FORWARD_SLASH +
                pluginDirName + syntax.FORWARD_SLASH +
                'vdbList.html'
        };

        return directive;
    }

    function VdbListController(VdbSelectionService, RepoRestService,
                               REST_URI, SYNTAX, VDB_KEYS,
                               DownloadService, $scope, DialogService) {
        var vm = this;

        vm.vdbs = [];
        vm.init = false;
        vm.showImport = false;

        vm.accOpen = vm.open;
        if (angular.isUndefined(vm.accOpen))
            vm.accOpen = false;

        /**
         * Fetch the list of vdbs from the selected repository
         */
        function initVdbs() {
            vm.init = true;

            try {
                var type = vm.vdbType;
                if (angular.isUndefined(vm.vdbType))
                    type = REST_URI.WKSP_SERVICE;

                RepoRestService.getVdbs(type).then(
                    function (newVdbs) {
                        RepoRestService.copy(newVdbs, vm.vdbs);
                        vm.init = false;
                    },
                    function (response) {
                        // Some kind of error has occurred
                        vm.vdbs = [];
                        vm.init = false;
                        DialogService.basicInfoMsg("Failed to load vdbs from teiid.\n" + RepoRestService.responseMessage(response),
                                                    "Vdb retrieval failure");
                    });
            } catch (error) {
                vm.vdbs = [];
                vm.init = false;
                DialogService.basicInfoMsg("Failed to load vdbs from teiid.\n" + RepoRestService.responseMessage(error),
                                            "Vdb retrieval failure");
            }

            // Removes any outdated vdb
            VdbSelectionService.setSelected(null);
        }

        vm.hasButtons = function() {
            if (angular.isUndefined(vm.showButtons))
                return true;

            return vm.showButtons;
        };

        /*
         * Select the given vdb
         */
        vm.selectVdb = function (vdb) {
            //
            // Set the selected vdb
            //
            VdbSelectionService.setSelected(vdb);
        };

        /*
         * return selected vdb
         */
        vm.vdbSelected = function () {
            return VdbSelectionService.selected();
        };

        /**
         * Event handler for clicking the add button
         */
        vm.onAddClicked = function (event) {
            try {
                $window.alert("To be implemented");
            } catch (error) {

            } finally {
                // Essential to stop the accordion closing
                event.stopPropagation();
            }
        };

        /**
         * Event handler for clicking the remove button
         */
        vm.onRemoveClicked = function (event) {
            var selected = VdbSelectionService.selected();
            try {
                RepoRestService.removeVdb(selected).then(
                    function () {
                        // Reinitialise the list of vdbs
                        initVdbs();
                    },
                    function (response) {
                        DialogService.basicInfoMsg("Failed to remove the vdb " + selected[VDB_KEYS.ID] + "from teiid.\n" + RepoRestService.responseMessage(response),
                                                    "Vdb removal failure");
                    });
            } catch (error) {} finally {
                // Essential to stop the accordion closing
                event.stopPropagation();
            }
        };

        /**
         * Event handler for importing a vdb
         */
        vm.onImportClicked = function(event) {
            try {
                vm.showImport = true;
            } finally {
                // Essential to stop the accordion closing
                event.stopPropagation();
            }
        };

        /*
         * Callback called if the import has been cancelled
         */
        vm.onImportCancel = function() {
            vm.showImport = false;
        };

        /*
         * Callback called after the file has been imported
         */
        vm.onImportDone = function(result) {
            // Hide the import dialog
            vm.showImport = false;

            // Reinitialise the list of vdbs
            initVdbs();
        };
        
        /**
         * Event handler for exporting the vdb
         */
        vm.onExportClicked = function(event) {
            var selected = VdbSelectionService.selected();
            try {
                DownloadService.download(selected);
            } catch (error) {} finally {
                // Essential to stop the accordion closing
                event.stopPropagation();
            }
        };

        // Initialise vdb collection on loading
        initVdbs();
    }
})();
