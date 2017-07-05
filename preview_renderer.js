const main = require('electron').remote.require('./main');

const $ = require('jquery');
const nsh = require('node-syntaxhighlighter');
const htmlFormatter = require('js-beautify').html;


const assetMap = main.assetMap
const hatchFolder = main.hatchFolder

let showingSource = false;

$(document).ready(function(){
  $('#flip_controls').hide();
  $('#source_code').hide();
  $('#image_asset').hide();
})

flipPage = function() {
  showingSource = !showingSource;
  if (showingSource) {
    $('#preview_frame').hide();
    $('#image_preview').hide();
    $('#source_code').show();
  } else {
    $('#preview_frame').show();
    $('#image_preview').show();
    $('#source_code').hide();
  }
}

setPreviewAssetID = function(ID) {
  if (!ID) {
    $('#preview_frame').html("<center><h2>No asset selected</h2></center>")
    return;
  }

  showingSource = false;
  $('#source_code').hide();
  $('#preview_frame').show();
  $('#image_preview').show();

  $('#image_preview').html('');
  $('#preview_frame').contents().find('html').html('');
  $('#preview_frame_holder').removeClass('preview-frame-holder');

  var asset = assetMap.get(ID)

  // Enable controls if we're an html document
  if (asset.document) {
    $('#flip_controls').show();
    const prettyHtml = htmlFormatter(asset.document);
    $('#source_code_content').html(nsh.highlight(prettyHtml, nsh.getLanguage('xml')));
  } else {
    $('#flip_controls').hide();
  }

  if (asset.document) {
    $('#preview_frame_holder').addClass('preview-frame-holder');
    $('#preview_frame').contents().find('html').find('body').html(asset.document || "")
    $('#preview_frame').contents().find('html').find('img').each(function() {
      var imgID = $(this).attr("data-soma-job-id")
      $(this).attr("src", hatchFolder + "/" + imgID + ".data")
    })
  } else if (asset.objectType == "ImageObject") {
    image_asset = $('<img />', { id: 'image_asset',
                                 src: asset.path,
                                 class: 'centered mx-auto' });
    $('#image_preview').append(
        image_asset
    )
  } else {
    $('#image_preview').html("<center><h2>Unsupported asset type (" + asset.objectType + ")!</h2></center>")
  }
}

setPreviewAssetID(null)
