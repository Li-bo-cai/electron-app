const { ipcRenderer } = require("electron")

var webview = document.getElementById('wv')
var electron_app = document.getElementById('electron_app')


webview.addEventListener('did-start-loading', (e) => {
    console.log('正在加载中');
})

webview.addEventListener('did-stop-loading', (e) => {
    console.log('加载完成');
})