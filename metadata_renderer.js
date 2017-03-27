main = require('electron').remote.require('./main')
$ = require('jquery')

assetMap = main.assetMap
hatchFolder = main.hatchFolder

$(document).ready(function(){
})

function propertyToRow(asset, prop) {
  propValue = asset[prop]
  var row = $('<tr />')
  row.append($('<td />').text(prop))
  row.append($('<td />').text(propValue))
  return row
}

setAssetID = function(ID) {
  if (ID != null) {
    var asset = assetMap.get(ID)
    console.log(asset)
    $('#metadata').html("<h2>" + asset.title + "</h2>")
    $('#metadata').append($('<table />').attr("id", "metadataTable"))
    var props = [
      "assetID",
      "objectType",
      "contentType",

      "canonicalURI",
      "matchingLinks",

      "title",
      "license",
      "tags",
      "lastModifiedDate",
      "revisionTag"
    ]
    props.forEach(function(prop) {
      $('#metadataTable').append(propertyToRow(asset, prop))
    })
  } else {
    $('#metadata').html("<h2>No asset selected</h2>")
  }
}

setAssetID(null)
