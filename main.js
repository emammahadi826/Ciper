const { app, BrowserWindow, ipcMain, Notification, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess;

const tasksFilePath = path.join(app.getPath('userData'), 'tasks.json');

function readTasks() {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200, // Set a larger default width
    height: 800, // Set a larger default height
    minWidth: 800, // Set a minimum width
    minHeight: 600, // Set a minimum height
    icon: path.join(__dirname, 'app_icon', 'App.png'),
    webPreferences: {
      preload: path.join(__dirname, 'template', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.maximize(); // Maximize the window on launch

  mainWindow.loadFile(path.join(__dirname, 'template', 'index.html'));
  mainWindow.setMenu(null);

  mainWindow.webContents.on('did-finish-load', () => {
    const tasks = readTasks();
    mainWindow.webContents.send('load-tasks', tasks);
  });

  // Spawn the python process
  const pythonExecutable = path.join(__dirname, 'dist', 'task_manager.exe');
  pythonProcess = spawn(pythonExecutable);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
    const taskId = data.toString().trim();
    const tasks = readTasks();
    const task = tasks.find(t => t.id == taskId);

    if (task) {
        const notification = new Notification({
            title: 'Task Reminder',
            body: `Sir, this is your task complete time. Did you complete it?`
        });

        notification.show();

        notification.on('click', () => {
            mainWindow.webContents.send('show-notification-prompt', task);
        });
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  // Set a Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ 
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [ "default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' https://cdnjs.cloudflare.com;" ]
      }
    });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('save-tasks', (event, tasks) => {
  saveTasks(tasks);
  if (pythonProcess) {
    pythonProcess.stdin.write(JSON.stringify(tasks) + '\n');
  }
});



