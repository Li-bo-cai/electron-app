const fs = require('fs')
const path = require('path')
const axios = require('axios')
const fsPromises = require('fs').promises
const package = require('../package.json')
const { exec, spawn } = require('child_process')
const electron = require('electron')
const { app } = electron

// 获取真实的绝对路径
const dirPatho = path.join(__dirname).split('resources')
console.log('dirPatho', dirPatho);
const relativePath = dirPatho[0]
console.log('relativePath', relativePath);

// 获取一个绝对路径的文件夹
const dirPath = path.join(relativePath, '/dowload')
console.log('dirPath', dirPath);

//热更新
function update(url) {
    console.log('接收下载地址', url);
    fs.access(dirPath, (err) => {
        console.log('err', err);
        if (err) { //如果文件不存在，就创建这个文件
            fs.mkdir(dirPath, (err) => {
                console.log('创建的回调', err);
                if (!err) {
                    console.log('dowload file create success!');
                    dowloadFile(url)
                }
            })
        } else {
            //如果这个文件存在
            dowloadFile(url)
        }
    })
}

let num = 0

// 文件重命名
const reName = (name, newName, suffix) => {
    num++
    console.log('begin to rename!');
    fs.rename(relativePath + 'dowload/' + name, relativePath + 'dowload/' + newName + '.' + suffix, err => {
        console.log('error', err);
        if (err) {
            if (num <= 1) {
                console.log('rename again!');
                reName(name, newName, suffix)
            } else {
                console.log('rename failed!', err);
            }
        } else {
            console.log('rename success !');
            reviseVersion(name, newName, suffix)
        }
    })
}

// 调用脚本复制
const shellReName = (name, newName, suffix) => {
    let bat, shellPath
    if (suffix == 'asar') {
        shellPath = path.join(relativePath, '/copy.bat');
        console.log(15151515151515);
        console.log('shellPath', shellPath);
    } else {
        shellPath = path.join(relativePath, 'copyzjp.bat');
        console.log('shellPath', shellPath);
    }
    bat = spawn(shellPath);
    bat.stdout.on('data', (data) => {
        app.quit()
        console.log('data', data);
    })
    bat.on('exit', (code) => {
        console.log(`子进程退出，退出码${code}`);
    })
}

// 移动文件
const copyFile = (newName, suffix) => {
    const copiedPath = relativePath + 'dowload/' + newName + '.' + suffix;
    const resultPath = relativePath + 'resources/' + newName + '.' + suffix;
    fsPromises.copyFile(copiedPath, relativePath).then(() => {
        console.log('copyFile success!');
        openProgram()
    }).catch(err => {
        console.log('copyFile failed!');
        console.log(err);
    })
}

// 修改package的version号码
const reviseVersion = (name, newName, suffix) => {
    package.version = name
    console.log('version change success!');
    console.log('package', package);
    shellReName(name, newName, suffix)
}

//打开指定文件程序
const openProgram = () => {
    const path = relativePath + '/jixin.exe'
    exec(path, (err, data) => {
        if (err) {
            console.log('exe open failed', err);
            return
        }
        console.log('exe open success', data.toString());
    })
}

//下载文件
const dowloadFile = (url) => {
    console.log('开始下载文件--地址', url);
    // 获取文件名称
    const name = url.split('/').pop().split('_')[0]
    console.log('获取文件名称', name);
    // 获取文件后缀
    const suffix = url.split('/').pop().split('.').pop()
    console.log('获取文件后缀', suffix);

    axios({
        method: 'get',
        url,
        maxContentLength: Infinity,
        ResponseType: 'stream'
    }).then(res => {
        console.log(res);
        let win, newName
        win = fs.createWriteStream(relativePath + 'dowload/' + name)
        res.data.pipe(win)

        console.log('我执行完了');
        return new Promise((resolve, reject) => {
            win.on('finish', () => {
                console.log('这个文件已经结束了');
                if (suffix == 'exe') {
                    newName = 'app'
                    //重命名下载文件
                    reName(name, newName, suffix)
                } else {
                    newName = 'zjg_2d'
                    //重命名下载的文件
                    reName(name, newName, suffix)
                }
                resolve()
            })
            win.on('err', (err) => {
                console.log('err', err);
                reject()
            })
        })
    })
}

module.exports = update