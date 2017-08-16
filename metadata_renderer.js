main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

const extraPropsByModelType = {
  'ArticleObject': ['authors', 'published', 'sourceName'],
  'ImageObject': ['caption', 'height', 'width'],
  'VideoObject': ['caption', 'duration', 'height', 'transcript', 'width'],
  'DictionaryObjectModel': ['word', 'definition', 'partOfSpeech']
}

const visibleProps = [ 'assetID',
                       'objectType',
                       'contentType',

                       'canonicalURI',
                       'matchingLinks',

                       'title',
                       'synopsis',
                       'thumbnail',
                       'license',
                       'tags',
                       'lastModifiedDate',
                       'revisionTag' ]

$(document).ready(function(){
})

function _appendProp($, asset, prop) {
  if (!asset.hasOwnProperty(prop))
    return
  $('#metadata_table').append(
      $('<thead/>').append(
        $('<tr/>').append(
          $('<td/>').text(prop)
        ).append(
          $('<td/>').text(asset[prop])
        )
      )
   )
}

setMetadataAssetID = function(ID) {
  $('#metadata').html("")

  if (ID != null) {
    var asset = assetMap.get(ID)
    console.log(asset)
    $('#metadata').append(
      $('<table/>')
        .attr('class', 'table table-striped table-hover table-sm smaller')
        .attr('id', 'metadata_table')
        .append(
          $('<thead/>').append(
            $('<tr/>').append(
              $('<th/>').text('Title')
            ).append(
              $('<th/>').text(asset.title || "Unknown")
            )
          )
      )
    )

    visibleProps.forEach(prop => _appendProp($, asset, prop))
    extraPropsByModelType[asset['objectType']].forEach(prop =>
      _appendProp($, asset, prop))
  } else {
    $('#metadata').html("<center><h6>No asset selected</h6></center>")
  }
}

setMetadataAssetID(null)
