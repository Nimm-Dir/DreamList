import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('dreamlist', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data: unknown) => ipcRenderer.invoke('data:save', data),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('win:setAlwaysOnTop', value),
})
