// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap

preview = function(ID) {
  console.log('preview("' + ID + '")')
  main.loadPreview(ID)
}

$(document).ready(function(){

  assetMap.forEach(function(asset) {
    if (asset.objectType == "ImageObject") {
      $('#imageList').append(
        $('<li/>').append(
          $('<a/>')
            .attr('onclick', 'preview("' + asset.assetID + '")')
            .attr('id', asset.assetID)
            .text(asset.assetID)
        )
      )
    } else if (asset.objectType == "ArticleObject") {
      $('#documentList').append(
        $('<li/>').append(
          $('<a/>')
            .attr('onclick', 'preview("' + asset.assetID + '")')
            .attr('id', asset.assetID)
            .text(asset.title)
        )
      )
    } else {
      console.log("unknown objectType: " + asset)
    }
  })
})
