import { fntoggleHistorique, canvasColums, handleDialogue, proccessingInput, model } from "./fn.js";

// toggle-historique
const toggleHistorique = document.getElementById('toggle-historique')
const historique = document.getElementById('historique')
let stateHistoriqueToggle = false

const toggleH = () => {
    fntoggleHistorique(historique, stateHistoriqueToggle)

    stateHistoriqueToggle = !stateHistoriqueToggle
}

toggleHistorique.onclick = () => toggleH()

toggleH()

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
    const alertTemplate = document.getElementById('alert-template')
    const alertElement = document.getElementById('alert')
    generate.onclick = () => {
        const projet = generate.previousElementSibling.value
        if (!projet) return
        generate.setAttribute('disabled', true)
        model(projet, [
            alertElement,
            alertTemplate,
        ], () => {
            setTimeout(() => {
                generate.removeAttribute('disabled')
            }, 2000);
        })
    }
}

