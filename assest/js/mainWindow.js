const electron = require("electron");
const { ipcRenderer } = electron;

//Uygulama başladığında alert ü kontrol ediyoruz
checkTodoCount();

const todoValue = document.querySelector('#todoValue');
const addBtn = document.querySelector('#addBtn');
const closeBtn = document.querySelector('#closeBtn');

//İnit Eventini karşıladık
ipcRenderer.on("initApp", (err, todos) => {
    todos.forEach(todo => {
        drawRow(todo);
    })
})

addBtn.addEventListener('click', () => {
    if(todoValue.value !=="") {
        ipcRenderer.send("newTodo:save", {
            ref:"main",
            value:todoValue.value
        });
        todoValue.value = "";
    }
})

todoValue.addEventListener("keypress", (e) => {
    if(e.keyCode == 13) {
        if(e.target.value !=="") {
            ipcRenderer.send("newTodo:save", {
                ref:"main",
                value:e.target.value
            });
            e.target.value = "";
        }
    }
})

closeBtn.addEventListener("click", () => {
    if(confirm("Uygulamadan çıkmak istediğinize emin misiniz?")) {
        ipcRenderer.send("todo:close");
    }    
});

//İpc Renderer ile gelen değeri karşıladık
ipcRenderer.on("todo:addItem", (err, todo) => {
    //DrawRow fonskiyonu ile dom da nesne oluşturuyoruz
    drawRow(todo);
})

function checkTodoCount() {
    const container = document.querySelector(".todo-container");
    const alertContainer = document.querySelector(".alert-container");
    const totalCount = document.querySelector(".total-count-container");

    //Toplam todo sayısı
    totalCount.innerText = container.children.length;
    //Alert Kontrol
    if(container.children.length !== 0) {
        alertContainer.style.display = "none";
    }
    else {
        alertContainer.style.display = "block";
    }
}

//Doma veri ekleyecek fonksiyonu yazdık

function drawRow(todo) {
    //Container ı seçtik
    const container = document.querySelector(".todo-container");

    //Row
    const row = document.createElement('div');
    row.className = 'row';

    //Column
    const col = document.createElement("div");
    col.className = "todo-purple p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center";

    //Parapragh

    const p = document.createElement("p");
    p.className = "m-0 w-100";
    p.innerText = todo.text;

    //Delete button

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-warning flex-shrink-1 mr-1";
    deleteBtn.innerText = "x";
    deleteBtn.setAttribute("data-id", todo.id);


    //Delete Button onClick

    deleteBtn.addEventListener('click', (e) => {
        if (confirm("Bu kaydı silmek istediğinize emin misiniz")) {
            e.target.parentNode.parentNode.remove();
            ipcRenderer.send("todo:remove", e.target.getAttribute("data-id"));
            checkTodoCount();
        }
    });

    //DOM oluşturma

    col.appendChild(p);
    col.appendChild(deleteBtn);

    row.appendChild(col);

    container.appendChild(row);

    //İşlem tamamlandıktan sonra todoAlert kaldırılmalı
    checkTodoCount();
}