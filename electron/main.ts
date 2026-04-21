import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadData, saveData, patchWindow, Data } from './storage'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null
let boundsDebounce: NodeJS.Timeout | null = null

function scheduleBoundsSave() {
  if (boundsDebounce) clearTimeout(boundsDebounce)
  boundsDebounce = setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const [x, y] = mainWindow.getPosition()
    const [width, height] = mainWindow.getSize()
    patchWindow({ x, y, width, height }).catch(() => {})
  }, 300)
}

async function createWindow() {
  const data = await loadData()
  const win = data.settings.window

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'Logo.ico')
    : path.join(__dirname, '../Logo.ico')

  mainWindow = new BrowserWindow({
    x: win?.x,
    y: win?.y,
    width: win?.width ?? 1100,
    height: win?.height ?? 780,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: '#0d1117',
    show: false,
    autoHideMenuBar: true,
    title: 'DreamList',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (data.settings.alwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    await mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('resize', scheduleBoundsSave)
  mainWindow.on('move', scheduleBoundsSave)
  mainWindow.on('close', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const [x, y] = mainWindow.getPosition()
    const [width, height] = mainWindow.getSize()
    patchWindow({ x, y, width, height }).catch(() => {})
  })
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => loadData())
  ipcMain.handle('data:save', (_e, data: Data) => {
    saveData(data)
    return true
  })
  ipcMain.handle('win:setAlwaysOnTop', (_e, value: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return false
    mainWindow.setAlwaysOnTop(value, 'screen-saver')
    return mainWindow.isAlwaysOnTop()
  })
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
