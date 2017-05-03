main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

showingSource = false;

$(document).ready(function(){
  $('#flip_controls').hide();
  $('#source_code').hide();
})

flipPage = function() {
  if (showingSource) {
    $('#preview').hide();
    $('#source_code').show();
  } else {
    $('#source_code').hide();
    $('#preview').show();
  }
  showingSource = !showingSource;
}

setPreviewAssetID = function(ID) {
  if (!ID) {
    $('#preview').html("<center><h2>No asset selected</h2></center>")
    return;
  }

  showingSource = false;
  $('#source_code').hide();
  $('#preview').show();
  $('#image_asset').remove();

  var asset = assetMap.get(ID)

  // Enable controls if we're an html document
  if (asset.document) {
    $('#flip_controls').show();
    $('#source_code_content').text(asset.document).html();
  } else {
    $('#flip_controls').hide();
  }

  $('#preview').html(asset.document || "")
  if (asset.document) {
    $('#preview img').each(function() {
      var imgID = $(this).attr("data-soma-job-id")
      $(this).attr("src", hatchFolder + "/" + imgID + ".data")
    })
  } else if (asset.objectType == "ImageObject") {
    image_asset = $('<img />', { id: 'image_asset',
                                 src: asset.path,
                                 class: 'centered mx-auto' });
    $('#preview').append(
        image_asset
    )
  } else {
    $('#preview').html("<center><h2>Unsupported asset type (" + asset.objectType + ")!</h2></center>")
  }
}

setPreviewAssetID(null)
