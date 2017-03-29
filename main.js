const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let previewWindow
let metadataWindow

let assetMap

function loadManifest(path) {
  var manifest = JSON.parse(fs.readFileSync(path + '/hatch_manifest.json', 'utf8'))
  return manifest
}

function loadMetadata(path, id) {
  var metadata = JSON.parse(fs.readFileSync(path + '/' + id + '.metadata', 'utf8'))

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

  try {
      loadManifest(hatchFolder).assets.forEach(function(asset) {
          const id = asset.asset_id;
          assetMap.set(id, loadMetadata(hatchFolder, id))
      });
  } catch(e) {
    console.log(e);
    process.exit(1)
  }
  exports.assetMap = assetMap
  exports.hatchFolder = hatchFolder

  const icon = __dirname + '/previewer.png';

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 400, height: 600, icon: icon})
  previewWindow = new BrowserWindow({width: 800, height: 600, icon: icon})
  metadataWindow = new BrowserWindow({width: 400, height: 600, icon: icon})

  // and load the asset list html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'assetlist.html'),
    protocol: 'file:',
    slashes: true
  }))

  // load the asset preview html
  previewWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'preview.html'),
    protocol: 'file:',
    slashes: true
  }))

  // load the metadata html
  metadataWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'metadata.html'),
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
  previewWindow.webContents.executeJavaScript('setAssetID("' + ID +'")');
  metadataWindow.webContents.executeJavaScript('setAssetID("' + ID +'")');
}

