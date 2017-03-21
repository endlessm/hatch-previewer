main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

$(document).ready(function(){
})

setAssetID = function(ID) {
  if (ID != null) {
    var asset = assetMap.get(ID)
    console.log(asset)
    $('#preview').html(asset.document)
    $('#preview img').each(function() {
      var imgID = $(this).attr("data-soma-job-id")
      $(this).attr("src", hatchFolder + "/" + imgID + ".data")
    })
  } else {
    $('#preview').html("<h2>No asset selected</h2>")
  }
}

setAssetID(null)
