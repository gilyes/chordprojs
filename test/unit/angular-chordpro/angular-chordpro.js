'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('angular-chordpro', function() {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function(module) {
        return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function() {

        // Get module
        module = angular.module('angular-chordpro');
        dependencies = module.requires;
    });

    it('should load config module', function() {
        expect(hasModule('angular-chordpro.config')).toBeTruthy();
    });

    
    it('should load filters module', function() {
        expect(hasModule('angular-chordpro.filters')).toBeTruthy();
    });
    

    
    it('should load directives module', function() {
        expect(hasModule('angular-chordpro.directives')).toBeTruthy();
    });
    

    
    it('should load services module', function() {
        expect(hasModule('angular-chordpro.services')).toBeTruthy();
    });
    

});
