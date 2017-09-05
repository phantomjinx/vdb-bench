/**
 * Translator Service
 *
 * Provides simple API for managing translators
 */
(function () {

    'use strict';

    angular
        .module('vdb-bench.core')
        .factory('TranslatorSelectionService', TranslatorSelectionService);

    TranslatorSelectionService.$inject = ['SYNTAX', 'REST_URI', 'RepoRestService', '$rootScope', 'DialogService'];

    function TranslatorSelectionService(SYNTAX, REST_URI, RepoRestService, $rootScope, DialogService) {

        var tran = {};
        tran.loading = false;
        tran.translators = [];
        tran.translator = null;
        tran.deploymentInProgress = false;
        tran.deploymentTranslatorName = null;
        tran.deploymentSuccess = false;
        tran.deploymentMessage = null;
        
        // Translator image mappings
        var imageLinkMap = {
            "accumulo" : "plugins/vdb-bench-core/content/img/Accumulo_dv_logos_70x40.png",
            "file" : "plugins/vdb-bench-core/content/img/FileSystem_dv_logos_70x40.png",
            "google-spreadsheet" : "plugins/vdb-bench-core/content/img/Google_dv_logos_70x40.png",
            "h2" : "plugins/vdb-bench-core/content/img/H2_dv_logos_70x40.png",
            "infinispan" : "plugins/vdb-bench-core/content/img/Infinispan_dv_logos_70x40.png",
            "ldap" : "plugins/vdb-bench-core/content/img/LDAP_dv_logos_70x40.png",
            "modeshape" : "plugins/vdb-bench-core/content/img/ModeShape_dv_logos_70x40.png",
            "mongodb" : "plugins/vdb-bench-core/content/img/MongoDB_dv_logos_70x40.png",
            "mysql" : "plugins/vdb-bench-core/content/img/MySQL_dv_logos_70x40.png",
            "mysql5" : "plugins/vdb-bench-core/content/img/MySQL_dv_logos_70x40.png",
            "postgresql" : "plugins/vdb-bench-core/content/img/PostgresSql_dv_logos_70x40.png",
            "salesforce" : "plugins/vdb-bench-core/content/img/Salesforce_dv_logos_70x40.png",
            "salesforce-34" : "plugins/vdb-bench-core/content/img/Salesforce_dv_logos_70x40.png",
            "teiid" : "plugins/vdb-bench-core/content/img/Teiid_dv_logos_70x40.png",
            "ws" : "plugins/vdb-bench-core/content/img/WebService_dv_logos_70x40.png",
            "access" : "plugins/vdb-bench-core/content/img/access.png",
            "actian-vector" : "plugins/vdb-bench-core/content/img/actian.png",
            "db2" : "plugins/vdb-bench-core/content/img/db2.png",
            "derby" : "plugins/vdb-bench-core/content/img/derby.png",
            "greenplum" : "plugins/vdb-bench-core/content/img/greenplum.png",
            "hana" : "plugins/vdb-bench-core/content/img/hana.png",
            "hbase" : "plugins/vdb-bench-core/content/img/hbase.png",
            "hive" : "plugins/vdb-bench-core/content/img/hive.png",
            "hsql" : "plugins/vdb-bench-core/content/img/hsql.png",
            "impala" : "plugins/vdb-bench-core/content/img/impala.png",
            "informix" : "plugins/vdb-bench-core/content/img/informix.png",
            "ingres" : "plugins/vdb-bench-core/content/img/ingress.png",
            "ingres93" : "plugins/vdb-bench-core/content/img/ingress-93.png",
            "intersystems-cache" : "plugins/vdb-bench-core/content/img/intersystems-cache.png",
            "netezza" : "plugins/vdb-bench-core/content/img/netezza.png",
            "oracle" : "plugins/vdb-bench-core/content/img/oracle.png",
            "osisoft-pi" : "plugins/vdb-bench-core/content/img/osisoft.png",
            "prestodb" : "plugins/vdb-bench-core/content/img/presto.png",
            "redshift" : "plugins/vdb-bench-core/content/img/redshift.png",
            "sqlserver" : "plugins/vdb-bench-core/content/img/sqlserver.png",
            "sybase" : "plugins/vdb-bench-core/content/img/sybase.png",
            "sybaseiq" : "plugins/vdb-bench-core/content/img/sybaseiq.png",
            "teradata" : "plugins/vdb-bench-core/content/img/teradata.png",
            "ucanaccess" : "plugins/vdb-bench-core/content/img/ucanaccess.png",
            "vertica" : "plugins/vdb-bench-core/content/img/vertica.png"
        };

        var raTranslators = ["simpledb", 
                             "accumulo", 
                             "solr",
                             "cassandra",
                             "file",
                             "google-spreadsheet",
                             "infinispan-cache-dsl",
                             "infinispan-cache",
                             "jpa2",
                             "ldap",
                             "loopback",
                             "excel",
                             "mongodb",
                             "map-cache",
                             "odata",
                             "odata4",
                             "olap",
                             "salesforce",
                             "salesforce-34",
                             "ws",
                             "sap-gateway",
                             "sap-nw-gateway"];

        /*
         * Service instance to be returned
         */
        var service = {};

        function setLoading(loading) {
            tran.loading = loading;

            // Broadcast the loading value for any interested clients
            $rootScope.$broadcast("loadingTranslatorsChanged", tran.loading);
        }

        /**
         * Fetch the translators from CachedTeiid
         */
        function initTranslators(resetSelection) {
            setLoading(true);

            try {
                RepoRestService.getTranslators(REST_URI.TEIID_SERVICE, null).then(
                    function (newTranslators) {
                        RepoRestService.copy(newTranslators, tran.translators);
                        tran.translators = sortByKey(tran.translators, 'keng__id');
                        
                        // Add translator image location for the UI
                        var transLength = tran.translators.length;
                        for (var i = 0; i < transLength; i++) {
                            setTranslatorImageLink(tran.translators[i]);
                        }
                        setLoading(false);
                    },
                    function (response) {
                        // Some kind of error has occurred
                        tran.translators = [];
                        setLoading(false);
                        DialogService.basicInfoMsg(RepoRestService.responseMessage(response),
                                                    "Error Loading Translators");
                    });
            } catch (error) {
                tran.translators = [];
                setLoading(false);
                DialogService.basicInfoMsg(RepoRestService.responseMessage(error),
                                            "Error Loading Translators");
            }

            // reset selected translator if desired
            if(resetSelection) {
                service.selectTranslator(null);
            }
        }

        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        function setTranslatorImageLink(translator) {
            var imageLink = service.getImageLink(translator.keng__id);
            // Use image link found in map.  If not found, use transparent image.
            if(imageLink !== null) {
                translator.keng__properties = [{ "name": "dsbImageLink", "value": imageLink}];
            } else {
                translator.keng__properties = [{ "name": "dsbImageLink", "value": "plugins/vdb-bench-core/content/img/Transparent_70x40.png"}];
            }
        }

        /*
         * Get the image link for a translator
         */
        service.getImageLink = function(translatorName) {
            var imageLink = imageLinkMap[translatorName];
            if(angular.isDefined(imageLink) && imageLink!==null) {
                return imageLink;
            }
            return "plugins/vdb-bench-core/content/img/Transparent_70x40.png";
        };

        /*
         * Are the translators currently loading
         */
        service.isLoading = function() {
            return tran.loading;
        };

        /*
         * Is the translators deployment flag set
         */
        service.isDeploying = function() {
            return tran.deploymentInProgress;
        };
        
        /*
         * Returns deployment translator name
         */
        service.deploymentTranslatorName = function() {
            return tran.deploymentTranslatorName;
        };
        
        /*
         * Returns translator deployment success state
         */
        service.deploymentSuccess = function() {
            return tran.deploymentSuccess;
        };
        
        /*
         * Returns translator deployment message
         */
        service.deploymentMessage = function() {
            return tran.deploymentMessage;
        };

        /*
         * Set the deployment flag
         */
        service.setDeploying = function(deploying, translatorName, deploymentSuccess, message) {
            tran.deploymentInProgress = deploying;
            tran.deploymentTranslatorName = translatorName;
            tran.deploymentSuccess = deploymentSuccess;
            tran.deploymentMessage = message;

            $rootScope.$broadcast("deployTranslatorChanged", tran.deploymentInProgress);
        };

        /*
         * Get the translators
         * includeRA : 'true' to include ResourceAdapter translators, 'false' to exclude.
         */
        service.getTranslators = function(includeRA) {
            if(includeRA) {
                return tran.translators;
            }
            // JDBC only
            var transJdbcOnly = [];
            for( var i = 0; i < tran.translators.length; i++) {
                if( raTranslators.indexOf(tran.translators[i].keng__id) < 0 ) {
                    transJdbcOnly.push(tran.translators[i]);
                }
            }
            return transJdbcOnly;
        };

        /*
         * Get the translator statue
         */
        service.getTranslatorState = function(translator) {
            return "New";
        };

        /*
         * Select the given translator
         */
        service.selectTranslator = function(translator) {
            //
            // Set the selected translator
            //
            tran.translator = translator;
        };

        /*
         * Select the translator by name
         */
        service.selectTranslatorName = function(translatorName) {
            var translatorsLength = tran.translators.length;
            for (var i = 0; i < translatorsLength; i++) {
                if(tran.translators[i].keng__id==translatorName) {
                    tran.translator = tran.translators[i];
                    break;
                }
            } 
        };

        /*
         * return selected translator
         */
        service.selectedTranslator = function() {
            return tran.translator;
        };

        /*
         * return selected translator
         */
        service.hasSelectedTranslator = function() {
            if (! angular.isDefined(tran.translator))
                return false;

            if (_.isEmpty(tran.translator))
                return false;

            if (tran.translator === null)
                return false;

            return true;
        };

        /*
         * Refresh the collection of translators
         */
        service.refresh = function(resetSelection) {
            initTranslators(resetSelection);
        };

        // Initialise translator collection on loading
        service.refresh(true);

        return service;
    }

})();
