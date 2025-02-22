// const BASE_URL = 'http://127.0.0.1:5000/'
const BASE_URL = window.navigation.currentEntry.url

export const URLs = {
    generate: `${BASE_URL}api/canvas/generate`,
    canvas: `${BASE_URL}api/canvas`,
    canva: _ => `${BASE_URL}api/canvas/${_}`,
    upload: `${BASE_URL}api/upload`,
}

export const fntoggleHistorique = (historique, stateHistoriqueToggle) => {
    const className = 'hidden'
    if (!stateHistoriqueToggle) {
        historique.classList.add(className)
        historique.nextElementSibling.classList.add('w-full')
    } else {
        historique.classList.remove(className)
        historique.nextElementSibling.classList.remove('w-full')
    }
}

/**
 * 
 * @param {HTMLElement[]} params 
 */
export function disabledElement(params) {
    params.forEach(element => {
        element.setAttribute('disabled', true)
    });
}

/**
 * 
 * @param {HTMLElement[]} params 
 */
export function enabledElement(params) {
    setTimeout(() => {
        params.forEach(element => {
            element.removeAttribute('disabled')
        });
    }, 2000);
}

/**
 * 
 * @param {HTMLElement} element 
 */
export function removeElement(element) {
    element.remove()
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {HTMLTemplateElement} template 
 * @param {string} label 
 * @param {HTMLElement} parent 
 */
export const handleDialogue = (element, template, label, action, edit = false) => {
    const dialog = document.createElement('div')
    dialog.append(template.content.cloneNode(true))

    // label and placeholder
    dialog.querySelector('.label').innerHTML = `${edit ? 'modifier' : 'ajouter'} un(e) <span class="font-bold">${label}</span>`
    const input = dialog.querySelector("textarea")

    input.setAttribute('placeholder', label)
    if (edit) input.value = element.querySelector('span').innerText

    // close
    const close = dialog.querySelector('#close')
    close.onclick = () => removeElement(dialog)
    dialog.querySelector('#flou').onclick = () => removeElement(dialog)

    // button comfirmer
    dialog.querySelector('[type="submit"]').onclick = () => action(input, element, dialog)

    document.body.appendChild(dialog)
}

/**
 * 
 * @param {HTMLInputElement} input 
 * @param {HTMLElement} element 
 * @param {HTMLDivElement} dialog 
 */
export function proccessingInput(input, element, dialog) {
    const value = input.value
    if (!value) return
    addItem(value, element)
    removeElement(dialog)
}

/**
 * 
 * @param {HTMLLIElement} element 
 * @param {String} value 
 */
function addItem(value, element) {
    const ul = element.querySelector('ul')
    const li = document.createElement('li')
    const span = document.createElement('span')
    span.innerText = value
    li.append(span)
    li.innerHTML += `<button class="absolute group-hover:w-max w-0 group-hover:transition-all hidden group-hover:block rounded-sm bg-red-200 -top-2 -right-1 delete-item text-red-500">
                    <i class="fa-solid fa-minus"></i>
                  </button>`
    li.setAttribute('class', 'bg-blue-200 group text-blue-700 p-1 rounded-lg relative')
    ul.append(li)

    // edit
    const template = document.getElementById('dialogue')
    const key = ul.parentElement.getAttribute('id')

    li.ondblclick = () => handleDialogue(li, template, key, editItem, true)

    // delete
    li.querySelector('.delete-item').onclick = () => removeElement(li)
}

/**
 * 
 * @param {HTMLInputElement} input 
 * @param {HTMLLIElement} li 
 * @param {HTMLDivElement} dialog 
 * @returns 
 */
function editItem(input, li, dialog) {
    const value = input.value
    if (!value) return

    li.querySelector('span').innerText = value

    removeElement(dialog)
}

export const canvasColums = {
    revenu: "revenu",
    cout: 'cout',
    client: "client",
    distribution: "distribution",
    relation: "relation",
    proposition: "offre",
    ressource: "ressource",
    activité: "activité",
    partenaire: "partenaire",
}

/**
 * FEC est une fonction qui permet d'effectuer
 * une appel vers une api tier, recuper et parser du json 
 * @param {string} url 
 * @param {object} body 
 * @returns {JSON}
 */
export default async function fec(url, body = false, method = 'GET') {
    const head = {
        'Accept': 'application/json',
        'Content-Type': "application/json"
    }
    let r
    if (!body) {
        r = await fetch(url, { headers: head, method: method })
    }
    else {
        r = await fetch(
            url,
            {
                headers: head,
                method: 'POST',
                body: JSON.stringify(body)
            }
        )
    }
    if (r.ok) {
        try {
            const l = await r.json()
            return l
        } catch (error) {
            return true
        }
    }
    throw new Error('serveur non present')
}

/**
 * 
 * @param {String} projet 
 * @param {String} canva_id 
 * @param {HTMLElement} parent 
 */
export const addHistorique = (projet, canva_id) => {
    const button = document.createElement('button')
    button.setAttribute('class', 'bg-blue-200 text-blue-700 group relative p-2 rounded-lg block disabled:opacity-50 disabled:pointer-events-none disabled:bg-blue-500 disabled:text-blue-200')
    button.dataset.canva_id = canva_id
    button.innerText = projet
    button.innerHTML += `<button class="absolute group-hover:w-max w-0 group-hover:transition-all hidden group-hover:block rounded-sm bg-red-200 -top-2 -right-1 delete-item text-red-500">
                    <i class="fa-solid fa-minus"></i></button>`

    const parrent = document.querySelector('#historique').querySelector('div')
    parrent.insertBefore(button, parrent.firstChild)

    button.onclick = () => {
        const canva_id = button.dataset.canva_id
        parrent.querySelectorAll('button').forEach(element => {
            element.setAttribute('disabled', true)
        })
        fec(URLs.canva(canva_id))
            .then(reponse => {
                reponse = reponse.canvas
                reponse = reponse.replace('```json', '').replace('```', '')
                reponse = JSON.parse(reponse)
                alertFlash('Projet', 'Modéle Canva chargée', 'green')

                setCanvas(button.innerText,reponse)
            })
            .catch(error => {
                console.log(error);

                alertFlash('Erreur', error.message, 'red')
            })
            .finally(() => {
                setTimeout(() => {
                    parrent.querySelectorAll('button').forEach(element => {
                        element.removeAttribute('disabled')
                    })
                }, 2000);
            })
    }

    button.querySelector('button').addEventListener('click', e => {
        e.stopPropagation()
        parrent.querySelectorAll('button').forEach(element => {
            element.setAttribute('disabled', true)
        })
        fec(URLs.canva(canva_id), false, 'DELETE')
            .then(reponse => {
                alertFlash('Succès', reponse.message, 'green')
                button.remove()
            })

            .catch(error => {
                alertFlash('Erreur', error.message, 'red')
            })
            .finally(() => {
                parrent.querySelectorAll('button').forEach(element => {
                    element.removeAttribute('disabled')
                })
            })
        button.remove()
    })
}

export function getHistorique() {
    fec(URLs.canvas)
        .then(reponse => {
            alertFlash('Projet', 'Projet chargée', 'green')

            reponse.forEach(element => {
                addHistorique(element.name, element.id)
            });
        })
        .catch(error => {
            alertFlash('Erreur', error.message, 'red')
        })
}

function clearCanvas() {
    for (const [k, element] of Object.entries(canvasColums)) {
        element.querySelector('ul').innerHTML = ''
    }
}

function setCanvas(projet, reponse) {
    // const canvaSection = document.querySelector('#canvas-model')
    // canvaSection.classList.add('loading')

    document.querySelector('#projet-name span:last-child').innerText = projet

    clearCanvas()
    for (const [k, element] of Object.entries(canvasColums)) {
        try {
            reponse[k].forEach((value, index) => {
                setTimeout(() => addItem(value, element), index * 300);
            });
        } catch (error) {
            console.log(k, error);

        }
    }
    // setTimeout(() => {
    //     canvaSection.classList.remove('loading')
    // }, 2000);

}

/**
 * 
 * @param {String} projet 
 * @param {Array} alertParam 
 */
export const model = async (projet, thenAction, finalle) => {

    alertFlash('Nouveau Projet', 'Traitement en cours', 'blue')


    const data = { projet: projet }
    fec(URLs.generate, data)
        .then(reponse => {
            const canva_id = reponse.canvas_id
            reponse = reponse.response
            reponse = reponse.replace('```json', '').replace('```', '')
            reponse = JSON.parse(reponse)

            alertFlash('Nouveau Projet', 'Modéle Canvas terminé', 'green')

            setCanvas(projet, reponse)

            thenAction(projet, canva_id)
        })
        .catch(error => {
            alertFlash('Erreur', error.message, 'red')
        }).finally(() => {
            finalle()
        })

}

/**
 * 
 * @param {HTMLElement} parent 
 */
export function alertFlash(titre, message, color = 'blue') {

    const parent = document.getElementById('alert')
    const template = document.getElementById('alert-template')

    const alert = document.createElement('div')
    alert.append(template.content.cloneNode(true))

    alert.querySelector('h3').innerText = titre
    alert.querySelector('p').innerText = message
    alert.classList.add(...[`bg-${color}-500`, `text-${color}-100`, `overflow-hidden`, `rounded-lg`, `shadow-lg`])

    // close
    const close = alert.querySelector('.close')
    close.classList.add(...[`text-${color}-100`, `hover:text-${color}-300`])
    close.onclick = () => removeElement(alert)
    parent.appendChild(alert)

    setTimeout(() => {
        alert.style.transition = 'opacity 3s';
        alert.style.opacity = '0';
        setTimeout(() => removeElement(alert), 3000);
    }, 3000);
}

