// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');

const {getAssetMap, hatchFolder, getTagsMap, winston} =
    require('electron').remote.require('./main');
const {setMetadataAssetID} = require('./metadata_renderer');
const {setPreviewAssetID} = require('./preview_renderer');

window.preview = function (ID) {
    winston.debug(`preview("${ID}")`);
    setPreviewAssetID(ID);
    setMetadataAssetID(ID);
};

function getShortenedID(ID) {
    if (ID.length <= 18)
        return;

    // Front 6
    const assetPrefix = ID.substring(0, 8);
    const assetSuffix = ID.slice(-8);

    return `${assetPrefix}..${assetSuffix}`;
}

$(document).ready(() => {
    let firstItemSelected = false;

    getAssetMap().forEach(asset => {
        if (asset.objectType === 'ImageObject') {
            const thumbnailImg = $('<img />', {
                src: `${hatchFolder}/${asset.assetID}.data`,
                class: 'thumbnail',
            });

            $('#imageList').append($('<tr/>')
                .attr('onclick', `preview("${asset.assetID}")`)
                .append($('<td/>')
                    .attr('class', 'text-center')
                    .append(thumbnailImg)
                    .append('<br />')
                    .append($('<a/>')
                        .attr('id', asset.assetID)
                        .text(getShortenedID(asset.assetID)))));
        } else if (['ArticleObject', 'DictionaryWordObject'].includes(asset.objectType)) {
            let thumbnail = '';
            if (asset.thumbnail) {
                const thumbnailImg = $('<img />', {
                    src: `${hatchFolder}/${asset.thumbnail}.data`,
                    class: 'thumbnail',
                });
                thumbnail = $('<div />')
                    .append(thumbnailImg)
                    .append($('<br />'));
            }

            $('#documentList')
                .append($('<tr/>')
                    .attr('onclick', `preview("${asset.assetID}")`)
                    .attr('class', firstItemSelected
                        ? ''
                        : 'table-active')
                    .append($('<td/>')
                        .attr('class', 'text-center')
                        .append(thumbnail)
                        .append($('<a/>')
                            .attr('id', asset.assetID)
                            .text(asset.title))));

            // give an 'active' class to clicked items in the documentList
            $('tr').on('click', /* @this jquery */ function () {
                $(this).addClass('table-active');
                $(this).siblings('.table-active').toggleClass('table-active');
            });

            // Select the first document if there is one
            if (!firstItemSelected) {
                firstItemSelected = true;
                window.preview(asset.assetID);
            }
        } else {
            winston.warn(`unknown objectType: ${asset}`);
        }
    });

    getTagsMap().forEach((tagCount, tag) => {
        $('#tagList')
            .append($('<span/>', {class: 'badge badge-primary'})
                .text(`${tag} `)
                .append($('<span/>', {class: 'badge badge-light'})
                    .text(`${tagCount}`)));
    });
});
