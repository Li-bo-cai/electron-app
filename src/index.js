const { app, BrowserWindow, Tray, dialog, Menu, nativeImage, MenuItem, screen, shell, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')
const update = require('./update')
const pathIcon = path.join(__dirname, './icon/OA.ico')
const electron = require('electron')
const IndexUrl = 'https://oa.yuwan.cn/front/#/information/index'

var tray, mySelf = {
    width: 870,
    height: 540,
}

function openWindow(url) {
    var win = new BrowserWindow({
        // fullscreen: true,   //全屏
        minWidth: 1366,
        minHeight: 768,
        icon: pathIcon,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    // 设置不需要菜单选项
    win.setMenu(null)
    //加载网页
    win.loadURL(url)
}

function createWindow(url) {
    // 创建浏览器窗口
    var win = new BrowserWindow({
        // fullscreen: true,   //全屏
        minWidth: mySelf.width,
        minHeight: mySelf.height,
        icon: pathIcon,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            backgroundThrottling: false,
            contextIsolation: false,
        }
    })
    // 设置不需要菜单选项
    win.setMenu(null)
    // 处理window.open跳转   在浏览器窗口显示
    win.webContents.setWindowOpenHandler((data) => {
        // shell.openExternal(data.url)
        openWindow(data.url)
        return {
            action: 'deny'
        }
    })
    // 实例化一个托盘对象
    tray = new Tray(nativeImage.createFromPath(pathIcon))
    // 移动到托盘上的提示
    tray.setToolTip('OA系统')
    // 监听托盘右击事件
    tray.on('right-click', () => {
        const tempate = [
            {
                label: '查看版本',
                click: () => dialog.showMessageBox({
                    type: 'info',
                    title: '查看版本',
                    defaultId: 0,
                    message: '当前版本号:V1.1.0',
                })
            },
            {
                label: '退出',
                click: () => app.exit()
            }
        ]
        const MenuConfig = Menu.buildFromTemplate(tempate)
        tray.popUpContextMenu(MenuConfig)
    })
    // 监听托盘点击事件
    tray.on('click', () => {
        if (win.isVisible()) {
            win.hide()
        } else {
            win.show()
        }
    })
    // 应用加载
    win.loadURL(url)


    win.on('close', (e) => {
        e.preventDefault(); //阻止默认行为
        electron.dialog.showMessageBox({
            type: 'info',
            title: '关闭应用',
            cancelId: 0,
            message: '确定要关闭吗？',
            buttons: ['最小化', '直接退出']
        }).then(index => {
            if (index.response == 0) {
                win.hide()
            } else {
                win = null
                app.exit();
            }
        })
    })
    // 创建右键菜单
    const menu = new Menu();
    menu.append(new MenuItem({ label: '复制', role: 'copy' }))
    menu.append(new MenuItem({ label: '粘贴', role: 'paste' }))
    menu.append(new MenuItem({ label: '刷新', role: 'reload' }))
    menu.append(new MenuItem({ label: '全选', role: 'selectall' }))
    menu.append(new MenuItem({ label: '剪切', role: 'cut' }))
    menu.append(new MenuItem({ label: '删除', role: 'delete' }))
    win.webContents.on('context-menu', (e, params) => {
        menu.popup({ window: win, x: params.x, y: params.y })
    })
    // 窗口中间打开
    win.center()
    // 打开开发者工具
    // win.webContents.openDevTools()
}


// 创建窗口
app.whenReady().then(() => {
    // const userWindow = { width, height } = screen.getPrimaryDisplay().workAreaSize
    // if (userWindow.width < 1920) {
    //     ipcRenderer.sendSync('sendSize', 123)
    //     mySelf = {
    //         width: userWindow.width,
    //         height: userWindow.height
    //     }
    //     createWindow(IndexUrl)
    // } else {
    //     axios.post('https://oa-dev.413club.cn/inside/window').then(res => {
    //         mySelf = {
    //             width: res.data.data.width | 1920,
    //             height: res.data.data.height | 1080,
    //         }
    //         createWindow(IndexUrl)
    //     })
    // }
    createWindow(IndexUrl)
})

// app.on('browser-window-created', () => {
//     setTimeout(() => {
//         // 获取线上版本进行对比
//         console.log(app.getVersion());
//         axios.post('https://oa-dev.413club.cn/inside/version').then(res => {
//             console.log(res.data.data.httpPath);
//             if (app.getVersion() == res.data.data.version) {
//             } else {
//                 const dialogOpts = {
//                     typeof: 'info',
//                     buttons: ['立即更新', '稍后更新'],
//                     title: '更新提醒',
//                     cancelId: 0,
//                     message: '您有新的更新！',
//                     detail: `内容如下：V${res.data.data.version}`
//                 }
//                 dialog.showMessageBox(dialogOpts).then((index) => {
//                     if (index.response === 0) {
//                         update(res.data.data.httpPath)
//                     }
//                 })
//             }
//         })
//     }, 5000)
// })






// 当所有窗口被关闭后退出应用
app.on('window-all-closed', () => {
    // 在macOS上，除非用户用cmd+Q确定退出，否则绝大部分应用及其菜单栏会保持活性
    if (process.platform !== 'darwin') {
        app.quit()
    }
    console.log('我关闭了全部窗口');
})

app.on('activate', () => {
    // macOS上,当单击dock图标并且没有其它窗口打开时
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
