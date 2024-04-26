var turboImages = [
    "static/images/turbobleu.png",
    "static/images/turbojaune.png",
    "static/images/turboorange.png",
    "static/images/turborose.png",
    "static/images/turborouge.png",
    "static/images/turbovert.png",
    "static/images/turboviolet.png"
];

function getRandomTurboImage() {
    var randomIndex = Math.floor(Math.random() * turboImages.length);
    return turboImages[randomIndex];
}

var plateau = document.getElementById('plateau');
var playersReady = 0;

function init_game() {
    var tickspeed = parseInt(document.getElementById('tickspeed').value);
    var steps = parseInt(document.getElementById('steps').value);
    var escargots = parseInt(document.getElementById('escargots').value);
    var chances = parseInt(document.getElementById('chances').value);
    var steps_size = (window.innerWidth - 150) / steps;

    plateau.innerHTML = "";

    for (let i = 1; i <= escargots; i++) {
        var concurent_image = document.createElement("img");
        concurent_image.src = getRandomTurboImage(); 
        var concurent = document.createElement("div");
        concurent.classList.add('concurent');
        concurent.appendChild(concurent_image);
        concurent.id = "escargot_" + i;
        concurent.setAttribute('step', '0');
        plateau.appendChild(concurent);
    }

    return { tickspeed, steps, escargots, chances, steps_size };
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function startRaceButtonClicked() {
    var { tickspeed, steps, escargots, chances, steps_size } = init_game();
    document.getElementById('race_container').setAttribute('hidden', 'hidden')
        fetch('/enregistrer_course/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            tickspeed: tickspeed,
            steps: steps,
            escargots: escargots,
            chances: chances
        })
    })
    .then(response => {
        console.log(response)
    })
    .catch(error => {
        console.error('Erreur lors de l\'envoi des données de la course:', error);
    });
    selectPlayers(tickspeed, steps, escargots, chances, steps_size)
}
function selectPlayers(tickspeed, steps, escargots, chances, steps_size){
    let numberOfPlayers;
    while(!numberOfPlayers){
        numberOfPlayers = parseInt(prompt("Entrez le nombre de joueurs :"));
    }

    for (let i = 1; i <= numberOfPlayers; i++) {
        var playerForm = document.createElement("form");
        playerForm.setAttribute('id',"form_player_"+i)
        var nameLabel = document.createElement("label");
        nameLabel.textContent = "Joueur " + i + " : Nom ";
        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.required = "required";
        nameInput.name = "playerName" + i;
        var escargotLabel = document.createElement("label");
        escargotLabel.textContent = "Escargot ";
        var escargotSelect = document.createElement("select");
        escargotSelect.name = "escargot" + i;

        for (let j = 1; j <= escargots; j++) {
            var option = document.createElement("option");
            option.value = j;
            option.textContent = "Escargot " + j;
            escargotSelect.appendChild(option);
        }

        var submitButton = document.createElement("button"); // Bouton de soumission
        submitButton.type = "submit";
        submitButton.textContent = "Pret";

        playerForm.appendChild(nameLabel);
        playerForm.appendChild(nameInput);
        playerForm.appendChild(escargotLabel);
        playerForm.appendChild(escargotSelect);
        playerForm.appendChild(submitButton); // Ajout du bouton de soumission au formulaire

        plateau.appendChild(playerForm);

        // Création de variables locales pour chaque joueur
        let currentPlayerForm = playerForm;
        let currentPlayerNameInput = nameInput;
        let currentPlayerEscargotSelect = escargotSelect;

        playerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var playerName = currentPlayerNameInput.value;
            var selectedEscargot = currentPlayerEscargotSelect.value;
            var player = {
                name: playerName,
                escargot: selectedEscargot
            };
            savePari(player);
            playersReady++;
            if (playersReady === numberOfPlayers) {
                startRace(tickspeed, steps, escargots, chances, steps_size).then(checkFinished);
            }
            currentPlayerForm.remove();
        });
    }
}


async function savePari(player){
    console.log(player)
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
            document.getElementById('race_container').removeAttribute('hidden')
            plateau.innerHTML ="";
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
