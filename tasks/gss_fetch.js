/*
 * grunt-gss-fetch
 * https://github.com/andrew/grunt-gss-fetch
 *
 * Copyright (c) 2014 andymason
 * Licensed under the MIT license.
 */

'use strict';

var Q = require('q');
var Tabletop = require('tabletop');

module.exports = function(grunt) {

  grunt.registerMultiTask('gss_fetch', 'Download Google spreadsheet locally.', function() {
    var done = this.async();
    var data = {};
    var dest = this.data.dest;
    var options = this.options({
    });

    function getSpreadsheet(url, dest) {
      var deferred = Q.defer();
      var tabletop = Tabletop.init({
        key: url,
        simplesheet: false,
        parseNumbers: true,

        callback: function(data, _tabletop) {
            deferred.resolve(_tabletop);
        }
      });
      return deferred.promise;
    }

    function parseData(_tabletop) {
      _tabletop.model_names.map(function(sheetname) {
        data[sheetname] = _tabletop.sheets(sheetname).all();
      });
    }

    getSpreadsheet(this.data.url).then(function(data) {
        parseData(data);
    }).done(function() {
      if (options.process && typeof options.process === 'function') {
            data = options.process(data);
      }

      if (options.amd) {
        grunt.file.write(dest, 'define([], function() {\nreturn ' + JSON.stringify(data, null, '  ') + ';\n});');
      } else {
        grunt.file.write(dest, JSON.stringify(data, null, '  '));
      }
      grunt.log.ok('All spreadsheets fetched successfully.');
      done();
    });
  });

};
