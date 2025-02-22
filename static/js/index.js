import { fntoggleHistorique, canvasColums, handleDialogue, proccessingInput, model, addHistorique, getHistorique, disabledElement, enabledElement, alertFlash } from "./fn.js";

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
    const download = document.getElementById("download")

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
        disabledElement([generate, download])

        let toggle = false
        if (!stateHistoriqueToggle) {
            toggleH()
            toggle = true
        }
        toggleHistorique.setAttribute('disabled', true)

        model(projet, addHistorique, () => {
            setTimeout(() => {
                enabledElement([generate, download])
                if (toggle) toggleH()

                toggleHistorique.removeAttribute('disabled')
            }, 2000);
        })
    }

    // get historique
    getHistorique()

    // download canvas
    download.addEventListener("click", function () {
        disabledElement([download, generate])
        const element = document.getElementById("canvas-model").parentElement.cloneNode(true); // Sélectionne l'élément à convertir

        const projetName = element.querySelector('#projet-name span:last-child').innerText
        if (!projetName) {
            enabledElement([download, generate])
            return alertFlash('Erreur lors du téléchargement', 'Veuillez générer un modèle canvas avant de télécharger', 'red')
        }

        const propel = document.querySelector('#propel').cloneNode(true)
        propel.classList.add(...['m-auto', 'my-5'])
        element.appendChild(propel)

        element.classList.replace('w-3/4', 'w-[97%]')
        element.classList.add('m-auto')
        element.querySelector('#download').remove()

        html2pdf()
            .set({
                margin: [20, 0], 
                filename: `modélé-canvas-${projetName.replaceAll(' ','-')}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(element)
            .save();

        enabledElement([download, generate])

        alertFlash('Téléchargement','modèle canvas téléchargé avec succès', 'green')

    });



}

