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
    var promises = [];
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

    function parseData(_tabletop, dest) {
      var data = {};
      _tabletop.model_names.map(function(sheetname) {
        data[sheetname] = _tabletop.sheets(sheetname).all();
      });

      grunt.file.write(dest, JSON.stringify(data, null, '  '));
      grunt.log.ok('Saved ' + dest);
    }

    this.files.forEach(function(f) {
        var promise = getSpreadsheet(f.url).then(function(data) {
            parseData(data, f.dest);
        });
        promises.push(promise);
    });

    Q.all(promises).spread(function() {
      grunt.log.ok('All spreadsheets fetched successfully.')
      done();
    });
  });

};
