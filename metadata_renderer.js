const main = require('electron').remote.require('./main');
const $ = require('jquery');
const {getAssetMap, winston} = main;

const extraPropsByModelType = {
    ArticleObject: ['authors', 'published', 'sourceName'],
    ImageObject: ['caption', 'height', 'width'],
    VideoObject: ['caption', 'duration', 'height', 'transcript', 'width'],
    DictionaryWordObject: ['word', 'definition', 'partOfSpeech'],
};

const visibleProps = [
    'assetID',
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
    'revisionTag',
];

function _appendProp(asset, prop) {
    if (!asset.hasOwnProperty(prop))
        return;
    $('#metadata_table')
        .append($('<thead/>')
            .append($('<tr/>')
                .append($('<td/>')
                    .text(prop))
                .append($('<td/>')
                    .text(asset[prop]))));
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
                .append($('<thead/>')
                    .append($('<tr/>')
                        .append($('<th/>')
                            .text('Title'))
                        .append($('<th/>')
                            .text(asset.title || 'Unknown')))));

        visibleProps.forEach(prop => _appendProp(asset, prop));
        extraPropsByModelType[asset.objectType].forEach(prop =>
            _appendProp($, asset, prop));
    }
};

exports.setMetadataAssetID(null);
