main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

const visibleProps = [ 'assetID',
                       'objectType',
                       'contentType',

                       'canonicalURI',
                       'matchingLinks',

                       'title',
                       'license',
                       'tags',
                       'lastModifiedDate',
                       'revisionTag' ]

$(document).ready(function(){
})


setAssetID = function(ID) {
  $('#metadata').html("")

  if (ID != null) {
    var asset = assetMap.get(ID)
    console.log(asset)
    $('#metadata').append(
      $('<table/>')
        .attr('class', 'table table-striped table-hover table-sm')
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

    visibleProps.forEach(function(prop) {
      $('#metadata_table').append(
          $('<thead/>').append(
            $('<tr/>').append(
              $('<td/>').text(prop)
            ).append(
              $('<td/>').text(asset[prop])
            )
          )
       )
    })
  } else {
    $('#metadata').html("<center><h2>No asset selected</h2></center>")
  }
}

setAssetID(null)
