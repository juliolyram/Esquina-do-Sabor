const btn_adicionar = document.getElementById('btn-pedido1')
const input = document.getElementById('tabeladecompras')
const taskList = document.getElementById('apagar')

btn_adicionar.addEventListener('click', adicionar)
let cont = 0;
function adicionar() {
    const coisa = document.createElement('li')
    const button = document.createElement('button')
    button.textContent = "x"
    coisa.textContent = input.value
    coisa.id = `${cont}`
    button.addEventListener("click" ,function (){taskList.removeChild(coisa)})

    coisa.appendChild(button)
    taskList.appendChild(coisa)
    cont += 1
}