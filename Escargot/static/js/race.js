var plateau = document.getElementById('plateau');
var turbo = "static/images/turbo.webp";

function init_game() {
    var tickspeed = parseInt(document.getElementById('tickspeed').value);
    var steps = parseInt(document.getElementById('steps').value);
    var escargots = parseInt(document.getElementById('escargots').value);
    var chances = parseInt(document.getElementById('chances').value);
    var steps_size = (window.innerWidth - 150) / steps; // Recalculer la taille des étapes

    plateau.innerHTML = "";

    for (let i = 1; i <= escargots; i++) {
        var concurent_image = document.createElement("img");
        concurent_image.src = turbo;
        var concurent = document.createElement("div");
        concurent.classList.add('concurent');
        concurent.appendChild(concurent_image);
        concurent.id = "escargot_" + i;
        concurent.setAttribute('step', '0');
        plateau.appendChild(concurent);
    }

    return { tickspeed, steps, escargots, chances, steps_size };
}

function startRaceButtonClicked() {
    document.getElementById('controls').setAttribute('hidden', 'hidden')
    var { tickspeed, steps, escargots, chances, steps_size } = init_game(); // Réinitialiser la course avec les nouveaux paramètres
    startRace(tickspeed, steps, escargots, chances, steps_size).then(checkFinished); // Démarrer la course
}

async function startRace(tickspeed, steps, escargots, chances, steps_size) {
    let finished = false;
    while (!finished) {
        for (let i = 1; i <= escargots; i++) {
            if (Math.random() < 1 / chances) {
                await staze(i, steps_size);
            }
        }
        await wait(1000 / tickspeed);

        finished = checkFinished(steps, escargots);
    }
}

function checkFinished(steps, escargots) {
    for (let i = 1; i <= escargots; i++) {
        let cur_escargot = document.getElementById('escargot_' + i);
        let cur_steps = parseInt(cur_escargot.getAttribute('step'));
        if (cur_steps >= steps) {
            alert("L'escargot gagnant est l'escargot " + i);
            return true;
        }
    }
    return false;
}

async function staze(escargotIndex, steps_size) {
    let cur_escargot = document.getElementById('escargot_' + escargotIndex);
    let cur_steps = cur_escargot.getAttribute('step');
    let gap = steps_size * parseInt(cur_steps);
    cur_escargot.setAttribute('step', parseInt(cur_steps) + 1);
    cur_escargot.style.marginLeft = gap + 'px';
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
