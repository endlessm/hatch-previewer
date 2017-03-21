// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

hatchFolder = '../hatch_aP1Ran';
const fs = require('fs');
main = require('electron').remote.require('./main');
$ = require('jquery');

function loadManifest(path) {
  var manifest = JSON.parse(fs.readFileSync(path + '/hatch_manifest.json', 'utf8'));
  return manifest;
}

function loadMetadata(path, id) {
  var metadata = JSON.parse(fs.readFileSync(path + '/' + id + '.metadata', 'utf8'));
  return metadata;
}
testfuncs = { loadManifest, loadMetadata };

function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value}`);
}

preview = function(ID) {
  console.log('preview("' + ID + '")');
  main.loadPreview(ID);
}

$(document).ready(function(){
  assetMap = new Map();
  loadManifest(hatchFolder).assets.forEach(function(id) {
      assetMap.set(id, loadMetadata(hatchFolder, id));
  });

  assetMap.forEach(function(asset) {
    if (asset.objectType == "ImageObject") {
      $('#imageList').append(
        $('<li/>').append(
          $('<a/>')
            .attr('onclick', 'preview("' + asset.assetID + '")')
            .attr('id', asset.assetID)
            .text(asset.assetID)
        )
      );
    } else if (asset.objectType == "ArticleObject") {
      $('#documentList').append(
        $('<li/>').append(
          $('<a/>')
            .attr('onclick', 'preview("' + asset.assetID + '")')
            .attr('id', asset.assetID)
            .text(asset.assetID)
        )
      );
    } else {
      console.log("unknown objectType: " + asset);
    }
  });
});
