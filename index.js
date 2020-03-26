(function(KMZGeoJSON) {
  KMZGeoJSON.version = '0.1.0';

  // Allow user to specify default parameters
  KMZGeoJSON.defaults = {};

  var request = require("request"),
    togeojson = require('togeojson'),
    unzip = require('node-unzip-2'),
    xmldom = new (require('xmldom').DOMParser)();


  KMZGeoJSON.fetchKML = function(path, callback) {
    request( path )
    .on('entry', function ( entry ) {
      var fileName = entry.path;
      var data = '';
      entry.on('error', function(err) {
        callback(err);
      });

      entry.on('data', function(chunk) {
        data += chunk;
      });

      entry.on('end', function() {
        callback(null, data);
      });
    })
    .on('error', callback);
  }

  KMZGeoJSON.toKML = function(path, callback) {
    request( path )
    .pipe(unzip.Parse())
    .on('entry', function ( entry ) {
      var fileName = entry.path;
      var type = entry.type; // 'Directory' or 'File' 
      if (fileName.indexOf('.kml') === -1) {
        entry.autodrain();
        return;
      }
      
      var data = '';
      entry.on('error', function(err) {
        callback(err);
      });

      entry.on('data', function(chunk) {
        data += chunk;
      });

      entry.on('end', function() {
        callback(null, data);
      });
    })
    .on('error', callback);
  };

  KMZGeoJSON.toGeoJSON = function(path, callback) {
    if (path.split(".").slice(-1)[0] === "kml") {
      KMZGeoJSON.fetchKML(path, function(error, kml) {
        var geojson = togeojson.kml(xmldom.parseFromString(kml));
        callback(null, geojson);
      });
    } else {
      KMZGeoJSON.toKML(path, function(error, kml) {
        var geojson = togeojson.kml(xmldom.parseFromString(kml));
        callback(null, geojson);
      });
    }
    
  };

}(typeof module == 'object' ? module.exports : window.KMZGeoJSON = {}));
