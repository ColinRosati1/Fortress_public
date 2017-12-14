'use strict'
const electron = require('electron')
//var app = require('app')
//var BrowserWindow = require('browser-window');  // Module to create native browser window.
//var fs = require('fs');

//var ipc =require('ipc');
const {app} = electron;
const {ipcMain} = electron;

const {BrowserWindow} = electron;
var mainWindow = null;

var fti = require('./fti-flash-node/index.js');
var fs = require('fs');

var prefs = null;

//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var saveDialogue = null;
var fssWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', ()=> {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  
    app.quit();
  
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 800});
  saveDialogue = new BrowserWindow({width: 600, height: 400, show:false})
  fssWindow = new BrowserWindow({width: 800, height: 480, show:false})

 // saveDialogue = new BrowserWindow({width: 400, height:300, show:false});
  // and load the index.html of the app.
  //loadURL
  mainWindow.loadURL('file://' + __dirname + '/demo.html');
  saveDialogue.loadURL('file://' + __dirname + '/save.html');
  fssWindow.loadURL('file://' + __dirname + '/open.html');
    //mainWindow.toggleDevTools();
  ipcMain.on('toggle', function(event, data){
    mainWindow.toggleDevTools();

  })
  ipcMain.on('fss', function(event, data){
    if( prefs == null){

      
    prefs = JSON.parse(fs.readFileSync(__dirname+ "/data/prefs.config"))
    saveDialogue.webContents.send('loadPrefs',prefs)
    
  }else{
      saveDialogue.webContents.send('loadPrefs',prefs)
    
  }
     saveDialogue.show()
    saveDialogue.openDevTools();
    saveDialogue.webContents.send('sigdata', data)
  })
  ipcMain.on('readfss',function(e,d){
    fssWindow.show();
    fssWindow.openDevTools();
  })
  ipcMain.on('savePrefs', function(event,data){
  fs.writeFile( __dirname+"/data/prefs.config", JSON.stringify(data),'ascii', function(err){
    saveDialogue.webContents.send('prefsDoneUpdate')
  })
})
  // Open the DevTools.
 // mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    mainWindow = null;
    saveDialogue.close();
    saveDialogue = null;
    fssWindow.close();
    fssWindow = null;
  });
  saveDialogue.on('close', function(e){
    if(mainWindow != null){
      e.preventDefault();
      saveDialogue.hide();
    }
  })
   fssWindow.on('close', function(e){
    if(mainWindow != null){
      e.preventDefault();
      fssWindow.hide();
    }
  })
});

