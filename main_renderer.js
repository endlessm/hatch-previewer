// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

preview = function(ID) {
  console.log('preview("' + ID + '")')
  setPreviewAssetID(ID);
  setMetadataAssetID(ID);
}

getShortenedID = function(ID) {
  if (ID.length <= 18) {
    return;
  }

  // Front 6
  let assetPrefix = ID.substring(0, 8);
  let assetSuffix = ID.slice(-8);

  return assetPrefix + '..' + assetSuffix;
}

$(document).ready(function(){
  assetMap.forEach(function(asset) {
    if (asset.objectType == "ImageObject") {
      $('#imageList').append(
        $('<tr/>')
          .attr('onclick', 'preview("' + asset.assetID + '")')
          .append(
            $('<td/>')
              .attr('class', 'text-center')
              .append(
                $('<a/>')
                  .attr('id', asset.assetID)
                  .text(getShortenedID(asset.assetID))
              )
        )
      )
    } else if (asset.objectType == "ArticleObject") {
      let thumbnail_img = '';
      if (asset.thumbnail)
        thumbnail_img = $('<img />', { src: hatchFolder + "/" + asset.thumbnail + ".data",
                                       class: 'thumbnail' });
      $('#documentList').append(
        $('<tr/>')
          .attr('onclick', 'preview("' + asset.assetID + '")')
          .append(
            $('<td/>')
              .attr('class', 'text-center')
              .append(thumbnail_img)
              .append(
                $('<a/>')
                  .attr('id', asset.assetID)
                  .text(asset.title)
              )
        )
      )
    } else {
      console.log("unknown objectType: " + asset)
    }
  })
})
