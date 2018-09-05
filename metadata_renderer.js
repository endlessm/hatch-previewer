const main = require('electron').remote.require('./main');
const $ = require('jquery');
const {getAssetMap, winston} = main;

const extraPropsByModelType = {
    ArticleObject: ['authors', 'published', 'publishedDate', 'sourceName'],
    ImageObject: ['caption', 'height', 'width'],
    VideoObject: ['caption', 'duration', 'height', 'transcript', 'width'],
    DictionaryWordObject: ['word', 'definition', 'partOfSpeech'],
};

const visibleProps = [
    'title',
    'assetID',
    'objectType',
    'contentType',

    'canonicalURI',
    'matchingLinks',

    'synopsis',
    'thumbnail',
    'license',
    'tags',
    'lastModifiedDate',
    'revisionTag',
];

function _appendProp(asset, prop) {
    if (!(prop in asset))
        return;

    const $tr = $('<tr/>');

    if (asset.errors && prop in asset.errors)
        $tr.attr('class', 'table-danger text-dark')
            .attr('title', asset.errors[prop]);

    $('#metadata_table tbody')
        .append($tr
            .append($('<td/>')
                .text(prop))
            .append($('<td/>')
                .text(asset[prop])));
}

exports.setMetadataAssetID = function (ID) {
    $('#metadata').html('');

    if (ID === null) {
        $('#metadata').html('<center><h6>No asset selected</h6></center>');
    } else {
        const asset = getAssetMap().get(ID);
        winston.debug('asset', {asset});
        $('#metadata')
            .append($('<table/>')
                .attr('class', 'table table-striped table-hover table-sm smaller')
                .attr('id', 'metadata_table')
                .append($('<tbody/>')));

        visibleProps.forEach(prop => _appendProp(asset, prop));
        extraPropsByModelType[asset.objectType].forEach(prop =>
            _appendProp(asset, prop));
    }
};

exports.setMetadataAssetID(null);
