const electron = require("electron");
const url = require("url");
const path = require("path");

require("dotenv").config();

const db = require("./lib/connections").db;




const { app, Menu, BrowserWindow, ipcMain } = electron;

let mainWindow, addWindow;



app.on("ready", () => {
    //Ana Pencerenin oluşturulması

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true //Node js entegrasyonu
        },
        frame: true, //Çerçevenin kullanılmasını sağlar / false engeller
    });

    //Ana pencerinin yeniden boyulandırılmasını engelleme
    mainWindow.setResizable(false);

    //Anapencere sayfa yapısının verilmesi
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "/windows/mainWindow.html"),
            protocol: "file",
            slashes: true,
        })
    );

    //Menünün Oluşturulması
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Menünün set uygulamaya set edilmesi
    Menu.setApplicationMenu(mainMenu);

    //Close Button

    ipcMain.on("todo:close", () => {
        app.quit();
    })

    // NewTODO Penceresi Eventleri...
    ipcMain.on("newTodo:close", () => {
        addWindow.close();
        addWindow = null;
    });

    ipcMain.on("newTodo:save", (err, data) => {
        if (data) {
            db.query("INSERT INTO todo SET text = ?", data.value, (err, result, fields) => {
                if(result.insertId > 0) {
                    mainWindow.webContents.send("todo:addItem", {
                        id:result.insertId,
                        text:data.value,
                    });
                }
            });

            

            if (data.ref == "window") {
                addWindow.close();
                addWindow = null;
            }
        }
    });

    //Veritabanından todo silme işlemi
    ipcMain.on("todo:remove", (err,id) => {
        db.query("DELETE FROM todo WHERE id = ?", id, (err, result, fields) => {
            if(result.affectedRows >= 0) {
                console.log("Silme işlemi başarılı");
            }
        })
    })

    //Anapencere de ki domlar yüklenmişse bir kereliğine çalıştır. (on herseferinde çalıştırı)
    mainWindow.webContents.once('dom-ready', () => {
        db.query("SELECT * FROM todo", (err, result, fields) => {
            //init eventini frontende gönderdik
            mainWindow.webContents.send("initApp", result);
        })
    })

});

//Menü Template'i
const mainMenuTemplate = [
    {
        label: "Dosya", //Label Menü deki adı temsil eder.
        submenu: [{ //Submenu alt menüler oluşturur.
            label: "Yeni TODO Ekle",
            submenu: [
                {
                    label: "Todo Add",
                    click(item, focusWindow) {
                        createWindow();
                    },
                    accelerator: "Alt+T"
                }
            ]
        },
        {
            label: "Çıkış",
            accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q", //Kısa yol ataması yapar
            role: "quit" //Roller Electron tarafından tanımlanmıştır. //Uygulamada ki belirli işleri yapmak için kullanılır
        }]
    }
];

//MAcos için ilk ekleme

if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: app.getName(),
        role: "TODO"
    })
}

//Geliştirici araçlarının getirilmesi

if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Geliştirici Araçları",
        submenu: [{
            label: "Geliştirici Araçları",
            click(item, focusWindow) {
                focusWindow.toggleDevTools();
            }
        },
        {
            label: "Yenile",
            role: "reload"
        }]
    })
}

//Yeni bir pencere oluşturma fonksiyonu
function createWindow() {
    //addWindowu browserWindowdan çalıştırdık
    addWindow = new BrowserWindow({
        width: 482, //Genişlik
        height: 180, //Uzunluk
        title: "Yeni bir pencere", //Başlık
        frame: false, //Çerçeve,
        //transparent: true, //Arkaplan transparan
        webPreferences: {
            nodeIntegration: true //Node js entegrasyonu
        }
    });

    //Yeni pencerenin frontend yolu
    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "windows/newTodo.html"),
            protocol: "file",
            slashes: true, //Slashların işletim sistemlerine göre düzenlenmesi
        })
    );

    //Pencerenin yeniden boyutlandırılmasını kapatır.
    addWindow.setResizable(false);

    //Yeni pencere kapandığında addWindowu boşa eşitledik
    addWindow.on("close", () => {
        addWindow = null;
    })
}
