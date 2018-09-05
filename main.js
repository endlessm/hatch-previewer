const {app, BrowserWindow, dialog} = require('electron');

const path = require('path');
const url = require('url');
const fs = require('fs');
const winston = require('winston');
const chokidar = require('chokidar');

let level = 'warn';
if (process.env.DEBUG && process.env.DEBUG.includes('hatch-previewer'))
    level = 'debug';

winston.configure({
    transports: [new winston.transports.Console({
        level,
        colorize: true,
        handleExceptions: true,
        humanReadableUnhandledException: true,
    })],
});
exports.winston = winston;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let _assetMap;
let _tagsMap;
let _title;
let _hatchVersion;

function getManifestPath(hatchFolder) {
    return `${hatchFolder}/hatch_manifest.json`;
}

function loadManifest(hatchFolder) {
    const manifestPath = getManifestPath(hatchFolder);
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function loadMetadata(hatchFolder, id) {
    const metadata = JSON.parse(fs.readFileSync(`${hatchFolder}/${id}.metadata`, 'utf8'));

    metadata.path = `${hatchFolder}/${metadata.cdnFilename}`;

    const errorsPath = `${hatchFolder}/${id}.errors`;
    if (fs.existsSync(errorsPath)) {
        const errors = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
        metadata.errors = errors;
        winston.info(errors);
    }
    return metadata;
}

function loadHatchV2(hatchFolder, manifest) {
    const assetMap = new Map();
    const tagsMap = new Map();

    manifest.assets.forEach(asset => {
        const id = asset.asset_id;
        assetMap.set(id, loadMetadata(hatchFolder, id));
        assetMap.get(id).tags.forEach(tag =>
            tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
    });

    // Sort assets map for easy finding of things
    _assetMap = new Map([...assetMap.entries()].sort());
    _tagsMap = new Map([...tagsMap.entries()].sort());
}

function loadHatchV3(hatchFolder, manifest) {
    const assetMap = new Map();
    const tagsMap = new Map();

    for (const id of manifest.assets) {
        assetMap.set(id, loadMetadata(hatchFolder, id));
        assetMap.get(id).tags.forEach(tag =>
            tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
    }

    // Sort assets map for easy finding of things
    _assetMap = new Map([...assetMap.entries()].sort());
    _tagsMap = new Map([...tagsMap.entries()].sort());
}

function loadHatch(hatchFolder) {
    winston.info(`Loading hatch ${hatchFolder}`);

    const manifest = loadManifest(hatchFolder);
    _hatchVersion = manifest.hatch_version;
    winston.debug(`hatch version: ${_hatchVersion}`);

    switch (_hatchVersion) {
    case 2:
        loadHatchV2(hatchFolder, manifest);
        break;
    case 3:
        loadHatchV3(hatchFolder, manifest);
        break;
    default:
        throw new Error(`Invalid hatch version: ${_hatchVersion}`);
    }

    const hatchName = manifest.name || 'Unknown';
    const hatchLanguage = manifest.language || 'Unknown language';
    _title = `Hatch Previewer - ${hatchName} (${hatchLanguage})`;

    if (mainWindow) mainWindow.reload();
}

exports.getAssetMap = function () {
    return _assetMap;
};

exports.getTagsMap = function () {
    return _tagsMap;
};

exports.getHatchVersion = function () {
    return _hatchVersion;
};

function initApp() {
    if (![2, 3].includes(process.argv.length)) {
        winston.error(`usage: ${process.argv[0]} ${process.argv[1]} [<hatch directory>]`);
        throw new Error('Invalid command-line arguments');
    }

    let hatchFolder;
    if (process.argv.length === 3) {
        hatchFolder = process.argv[2];
    } else {
        const result = dialog.showOpenDialog({
            title: 'Choose a hatch folder to open',
            properties: ['openDirectory'],
        });
        if (!result) {
            winston.info('Cancelled');
            app.quit();
            return;
        }
        [hatchFolder] = result;
    }

    // We want to use the absolute path to our hatch as relative
    // ones are buggy depending on invocation context
    hatchFolder = path.resolve(hatchFolder);

    winston.debug(`Using hatch folder: ${hatchFolder}`);

    loadHatch(hatchFolder);

    const manifestPath = getManifestPath(hatchFolder);

    // Watch manifest for changes to reload the hatch
    chokidar.watch(manifestPath, {ignoreInitial: true})
        .on('add', () => loadHatch(hatchFolder))
        .on('change', () => loadHatch(hatchFolder))
        .on('unlink', () => winston.debug(`Manifest ${manifestPath} was deleted`));

    exports.hatchFolder = hatchFolder;

    let icon = '/app/share/icons/hicolor/256x256/apps/com.endlessm.HatchPreviewer.png';
    if (!fs.existsSync(icon))
        icon = path.join(__dirname, '/icons/com.endlessm.HatchPreviewer-256.png');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 700,
        minHeight: 200,
        width: 1300,
        height: 700,
        useContentSize: true,
        title: _title,
        acceptFirstMouse: true,
        autoHideMenuBar: true,
        thickFrame: true,
        zoomFactor: 3.0,
        icon,
    });

    // and load the asset list html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main.html'),
        protocol: 'file:',
        slashes: true,
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initApp);

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());
