(function () {
    'use strict';

    var pluginName = 'vdb-bench.teiid';
    var pluginDirName = 'vdb-bench-teiid';

    angular
        .module(pluginName)
        .controller('TranslatorsController', TranslatorsController);

    TranslatorsController.$inject = ['RepoRestService', 'REST_URI', 'DialogService'];

    function TranslatorsController(RepoRestService, REST_URI, DialogService) {
        var vm = this;

        vm.translators = [];
        vm.translator = null;
        vm.init = false;

        /**
         * Fetch the list of translators from the selected repository
         */
        function initTranslators() {
            vm.init = true;

            try {
                var type = REST_URI.TEIID_SERVICE;

                RepoRestService.getTranslators(type).then(
                    function (newTranslators) {
                        RepoRestService.copy(newTranslators, vm.translators);
                        vm.init = false;
                    },
                    function (response) {
                        // Some kind of error has occurred
                        vm.translators = [];
                        vm.init = false;
                        DialogService.basicInfoMsg("Failed to load translators from teiid.\n" + RepoRestService.responseMessage(response),
                                                    "Failure to retrieve translators");
                    });
            } catch (error) {
                vm.translators = [];
                vm.init = false;
                DialogService.basicInfoMsg("Failed to load translators from teiid.\n" + RepoRestService.responseMessage(error),
                                            "Failure to retrieve translators");
            }

            // Removes any outdated translator
            vm.translator = null;
        }

        /*
         * Select the given translators
         */
        vm.selectTranslator = function (translator) {
            //
            // Set the selected translator
            //
            vm.translator = translator;
        };

        /*
         * return selected translator
         */
        vm.translatorSelected = function () {
            return vm.translator;
        };

        /*
         * return selected translator
         */
        vm.hasSelectedTranslator = function () {
            if (! angular.isDefined(vm.translator))
                return false;

            if (_.isEmpty(vm.translator))
                return false;

            if (vm.translator === null)
                return false;

            return true;
        };

        // Initialise translator collection on loading
        initTranslators();
    }
})();
