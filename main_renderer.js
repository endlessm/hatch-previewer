// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const main = require('electron').remote.require('./main');
const $ = require('jquery');

const assetMap = main.assetMap;
const hatchFolder = main.hatchFolder;

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
      thumbnail_img = $('<img />', { src: hatchFolder + "/" + asset.assetID + ".data",
                                     class: 'thumbnail' });

      $('#imageList').append(
        $('<tr/>')
          .attr('onclick', 'preview("' + asset.assetID + '")')
          .append(
            $('<td/>')
              .attr('class', 'text-center')
              .append(thumbnail_img)
              .append('<br />')
              .append(
                $('<a/>')
                  .attr('id', asset.assetID)
                  .text(getShortenedID(asset.assetID))
              )
        )
      )
    } else if (asset.objectType == "ArticleObject" || asset.objectType == "DictionaryWordObject") {
      let thumbnail = '';
      if (asset.thumbnail) {
        const thumbnail_img = $('<img />', { src: hatchFolder + "/" + asset.thumbnail + ".data",
                                           class: 'thumbnail' });
        thumbnail = $('<div />')
          .append(thumbnail_img)
          .append($('<br />'));
      }

      $('#documentList').append(
        $('<tr/>')
          .attr('onclick', 'preview("' + asset.assetID + '")')
          .append(
            $('<td/>')
              .attr('class', 'text-center')
              .append(thumbnail)
              .append(
                $('<a/>')
                  .attr('id', asset.assetID)
                  .text(asset.title)
              )
        )
      )

      // give a 'curent' class to clicked items in the documentList
      $('tr').on('click', function(){
        $(this).addClass('current');
        $(this).siblings('.current').toggleClass('current');
      })

    } else {
      console.log("unknown objectType: " + asset)
    }
  })
})
