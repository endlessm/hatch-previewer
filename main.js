const {app, BrowserWindow, dialog} = require('electron');

const path = require('path');
const url = require('url');
const fs = require('fs');
const winston = require('winston');

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
let assetMap;

function loadManifest(manifestPath) {
    return JSON.parse(fs.readFileSync(`${manifestPath}/hatch_manifest.json`, 'utf8'));
}

function loadMetadata(metadataPath, id) {
    const metadata = JSON.parse(fs.readFileSync(`${metadataPath}/${id}.metadata`, 'utf8'));

    metadata.path = `${metadataPath}/${metadata.cdnFilename}`;
    return metadata;
}

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

    assetMap = new Map();
    let tagsMap = new Map();

    const manifest = loadManifest(hatchFolder);
    manifest.assets.forEach(asset => {
        const id = asset.asset_id;
        assetMap.set(id, loadMetadata(hatchFolder, id));
        assetMap.get(id).tags.forEach(tag =>
            tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
    });

    const hatchName = manifest.name || 'Unknown';
    const hatchLanguage = manifest.language || 'Unknown';

    // Sort assets map for easy finding of things
    assetMap = new Map([...assetMap.entries()].sort());
    tagsMap = new Map([...tagsMap.entries()].sort());

    exports.assetMap = assetMap;
    exports.tagsMap = tagsMap;
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
        title: `Hatch Previewer - ${hatchName} (${hatchLanguage})`,
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
