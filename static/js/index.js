import { fntoggleHistorique, canvasColums, handleDialogue, proccessingInput, model, addHistorique, getHistorique } from "./fn.js";

// toggle-historique
const toggleHistorique = document.getElementById('toggle-historique')
const historique = document.getElementById('historique')
let stateHistoriqueToggle = false

const toggleH = () => {
    fntoggleHistorique(historique, stateHistoriqueToggle)
    stateHistoriqueToggle = !stateHistoriqueToggle
}

toggleHistorique.onclick = () => toggleH()

// toggleH()

window.onload = () => {

    // dialog
    const template = document.getElementById('dialogue')
    for (const [k, v] of Object.entries(canvasColums)) {
        const element = document.getElementById(v)
        element.querySelector('.add-item').onclick = () => handleDialogue(element, template, k, proccessingInput)
        canvasColums[k] = element
    }

    // fetch data
    const generate = document.getElementById('generate')
    generate.onclick = () => {
        const projet = generate.previousElementSibling.value

        if (!projet) return
        generate.setAttribute('disabled', true)

        let toggle = false
        if (!stateHistoriqueToggle){
            toggleH()
            toggle = true
        }
        toggleHistorique.setAttribute('disabled', true)
        
        model(projet, addHistorique, () => {
            setTimeout(() => {
                generate.removeAttribute('disabled')
                if (toggle) toggleH()
                
                toggleHistorique.removeAttribute('disabled')
            }, 2000);
        })
    }

    // get historique
    getHistorique()
}

