// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('angular-chordpro.config', [])
    .value('angular-chordpro.config', {
        debug: true
    });

// Modules
angular.module('angular-chordpro.directives', []);
angular.module('angular-chordpro.filters', []);
angular.module('angular-chordpro.services',
    [
        'ngSanitize'
    ]);
angular.module('angular-chordpro',
    [
        'angular-chordpro.config',
        'angular-chordpro.directives',
        'angular-chordpro.filters',
        'angular-chordpro.services',
        'ngSanitize'
    ]);
