const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let assetMap

function loadManifest(path) {
  const manifest = JSON.parse(fs.readFileSync(path + '/hatch_manifest.json', 'utf8'))
  return manifest
}

function loadMetadata(path, id) {
  const metadata = JSON.parse(fs.readFileSync(path + '/' + id + '.metadata', 'utf8'))

  metadata['path'] = path + '/' + metadata.cdnFilename;
  return metadata
}

function initApp() {
  if (process.argv.length < 3) {
    console.log("usage: " + process.argv[0] + " " + process.argv[1] + " <hatch directory>")
    process.exit(1)
  }

  hatchFolder = process.argv[2]
  console.log("Using hatch folder: " + hatchFolder);

  assetMap = new Map()
  tagsMap = new Map()

  let hatchLanguage, hatchName;
  try {
      const manifest = loadManifest(hatchFolder);
      manifest.assets.forEach(function(asset) {
          const id = asset.asset_id;
          assetMap.set(id, loadMetadata(hatchFolder, id))
          assetMap.get(id).tags.forEach(tag =>
              tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
      });

      hatchName = manifest.name || "Unknown";
      hatchLanguage = manifest.language || "Unknown";
  } catch(e) {
    console.log(e);
    process.exit(1)
  }

  // Sort assets map for easy finding of things
  assetMap = new Map([...assetMap.entries()].sort());
  tagsMap = new Map([...tagsMap.entries()].sort());

  exports.assetMap = assetMap
  exports.tagsMap = tagsMap
  exports.hatchFolder = hatchFolder

  const icon = __dirname + '/previewer.png';

  // Create the browser window.
  mainWindow = new BrowserWindow({minWidth: 700,
                                  minHeight: 200,
                                  width: 1300,
                                  height: 700,
                                  useContentSize: true,
                                  title: `Hatch Previewer - ${hatchName} (${hatchLanguage})`,
                                  acceptFirstMouse: true,
                                  autoHideMenuBar: true,
                                  thickFrame: true,
                                  zoomFactor: 3.0,
                                  icon: icon})

  // and load the asset list html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'main.html'),
    protocol: 'file:',
    slashes: true
  }))


  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initApp)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

exports.loadPreview = function(ID) {
}
