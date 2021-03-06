const main = require('electron').remote.require('./main');

const $ = require('jquery');
const nsh = require('node-syntaxhighlighter');
const htmlFormatter = require('js-beautify').html;

const {getAssetMap, getHatchVersion, hatchFolder} = main;

let showingSource = false;

$(document).ready(() => {
    $('#flip_controls').hide();
    $('#source_code').hide();
    $('#image_asset').hide();
});

window.flipPage = function () {
    showingSource = !showingSource;
    if (showingSource) {
        $('#preview_frame_holder').hide();
        $('#image_preview').hide();
        $('#flip_button').text('View Article');
        $('#source_code').show();
    } else {
        $('#preview_frame_holder').show();
        $('#image_preview').show();
        $('#flip_button').text('View Source');
        $('#source_code').hide();
    }
};

exports.setPreviewAssetID = function (ID) {
    const previewFrame = $('#preview_frame');
    if (!ID) {
        previewFrame.html('<center><h2>No asset selected</h2></center>');
        return;
    }

    showingSource = false;
    const imagePreview = $('#image_preview');
    const frameContents = previewFrame.contents();
    const frameHTML = frameContents.find('html');
    const previewFrameHolder = $('#preview_frame_holder');

    $('#flip_button').text('View Source');
    $('#source_code').hide();
    previewFrameHolder.show();
    imagePreview.show();

    imagePreview.html('');
    frameHTML.html('');
    previewFrameHolder.removeClass('preview-frame-holder');

    const asset = getAssetMap().get(ID);

    // Hatch v3 has body, while Hatch v2 has document
    let document;
    switch (getHatchVersion()) {
    case 2:
        document = asset.document;
        break;
    case 3:
        document = asset.body;
        break;
    default:
        break;
    }

    // Enable controls if we're an html document
    if (document) {
        $('#flip_controls').show();
        const prettyHtml = htmlFormatter(document);
        $('#source_code_content').html(nsh.highlight(prettyHtml, nsh.getLanguage('xml')));
    } else {
        $('#flip_controls').hide();
    }

    if (document) {
        previewFrameHolder.addClass('preview-frame-holder');
        const frameBody = frameContents.find('body');
        frameBody.html(document || '');
        frameBody.scrollTop(0);
        frameHTML.find('img').each(/* @this jquery */ function () {
            const imgID = $(this).attr('data-soma-job-id');
            $(this).attr('src', `${hatchFolder}/${imgID}.data`);
        });

        // Append placeholders for videos
        frameHTML.find("a[data-soma-widget='VideoLink']").each(/* @this jquery */ function () {
            const videoPlaceholder = $('<div>VIDEO PLACEHOLDER</div>');
            videoPlaceholder.css('align-content', 'center');
            videoPlaceholder.css('background-color', 'black');
            videoPlaceholder.css('color', '#007bff');
            videoPlaceholder.css('display', 'inline-grid');
            videoPlaceholder.css('font-size', 'xx-large');
            videoPlaceholder.css('font-weight', 'bold');
            videoPlaceholder.css('height', '20rem');
            videoPlaceholder.css('justify-content', 'center');
            videoPlaceholder.css('width', '25rem');

            $(this).append(videoPlaceholder);
        });
    } else if (asset.objectType === 'ImageObject') {
        const imageAsset = $('<img />', {
            id: 'image_asset',
            src: asset.path,
            class: 'centered mx-auto',
        });
        imagePreview.append(imageAsset);
    } else {
        imagePreview.html(`<center><h2>Unsupported asset type
            (${asset.objectType})!</h2></center>`);
    }
};

exports.setPreviewAssetID(null);
