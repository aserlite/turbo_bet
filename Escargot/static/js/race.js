var turboImages = ["static/images/turbobleu.png", "static/images/turbojaune.png", "static/images/turboorange.png", "static/images/turborose.png", "static/images/turborouge.png", "static/images/turbovert.png", "static/images/turboviolet.png"];
let all_players = []
let race_id = Date.now()
let numberOfPlayers;

/*
Faire la page de fin avec le winner affiché Si qlq a parié dessus
Faire un classement
 */
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
    plateau.classList.add('plateau');

    for (let i = 1; i <= escargots; i++) {
        var concurent_image = document.createElement("img");
        concurent_image.src = getRandomTurboImage();

        var concurent = document.createElement("div");
        concurent.classList.add('concurent');
        concurent.appendChild(concurent_image);
        concurent.id = "escargot_" + i;
        concurent.setAttribute('step', '0');
        plateau.appendChild(concurent);

        var drapeau_img = document.createElement("img");
        drapeau_img.src = "static/images/arrivee.png"
        drapeau_img.classList.add('drapeau');
        concurent.appendChild(drapeau_img);
    }

    return {tickspeed, steps, escargots, chances, steps_size};
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
    var {tickspeed, steps, escargots, chances, steps_size} = init_game();
    document.getElementById('race_container').setAttribute('hidden', 'hidden')
    selectPlayers(tickspeed, steps, escargots, chances, steps_size)
}


function selectPlayers(tickspeed, steps, escargots, chances, steps_size) {
    while (!numberOfPlayers) {
        numberOfPlayers = parseInt(prompt("Entrez le nombre de joueurs :"));
    }
    console.log(numberOfPlayers)

    var modal = document.createElement('div');
    modal.id = 'modal';
    modal.classList.add('modal');

    var modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    var titre = document.createElement('h1');
    titre.textContent = "Lancez les paris!";
    modalContent.appendChild(titre);

    var modal = document.createElement('div');
    modal.id = 'modal';
    modal.classList.add('modal');

    var modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    var titre = document.createElement('h1');
    titre.textContent = "Lancez les paris!";
    modalContent.appendChild(titre);

    for (let i = 1; i <= numberOfPlayers; i++) {
        var playerForm = document.createElement("form");
        playerForm.setAttribute('id', "form_player_" + i);
        var nameLabel = document.createElement("label");
        nameLabel.textContent = "Joueur " + i;
        nameLabel.classList.add('intro');

        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.required = "required";
        nameInput.name = "playerName" + i;
        nameInput.classList.add('nbjoueur');
        var escargotLabel = document.createElement("label");
        escargotLabel.textContent = " vote pour l' ";
        var escargotSelect = document.createElement("select");
        escargotSelect.name = "escargot" + i;

        for (let j = 1; j <= escargots; j++) {
            var option = document.createElement("option");
            option.value = j;
            option.textContent = "escargot " + j;
            escargotSelect.appendChild(option);
        }

        var submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "GO!";

        playerForm.appendChild(nameLabel);
        playerForm.appendChild(nameInput);
        playerForm.appendChild(escargotLabel);
        playerForm.appendChild(escargotSelect);
        playerForm.appendChild(submitButton);

        modalContent.appendChild(playerForm);


        let currentPlayerForm = playerForm;
        let currentPlayerNameInput = nameInput;
        let currentPlayerEscargotSelect = escargotSelect;

        playerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var playerName = currentPlayerNameInput.value;
            var selectedEscargot = currentPlayerEscargotSelect.value;
            var player = {
                name: playerName, bet: selectedEscargot, race_ref: race_id,
            };
            savePari(player);
            playersReady++;
            if (playersReady === numberOfPlayers) {
                startRace(tickspeed, steps, escargots, chances, steps_size).then(checkFinished);
                modal.remove();
            }
            currentPlayerForm.remove();
        });
    }

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}



async function savePari(player) {
    fetch('/enregistrer_joueur/', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
        }, body: JSON.stringify(player)
    })
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi des données du joueur:', error);
        });
    all_players.push(player)
    console.log(all_players)
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

        finished = checkFinished(tickspeed, steps, escargots, chances, steps_size);
    }
}

function checkFinished(tickspeed, steps, escargots, chances, steps_size) {
    for (let i = 1; i <= escargots; i++) {
        let cur_escargot = document.getElementById('escargot_' + i);
        let cur_steps = parseInt(cur_escargot.getAttribute('step'));
        if (cur_steps >= steps) {
            let winner = i;
            save_race(race_id, tickspeed, steps, escargots, chances, winner, numberOfPlayers)
                .then(() => {
                    afficherModalRecap(race_id, winner);
                });
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

function save_race(race_id, tickspeed, steps, escargots, chances, winner, numberOfPlayers) {
    return new Promise((resolve, reject) => {
        fetch('/enregistrer_course/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                ref: race_id,
                tickspeed: tickspeed,
                steps: steps,
                escargots: escargots,
                chances: chances,
                winner: winner,
                participants: numberOfPlayers,
            })
        })
            .then(response => {
                console.log(response);
                resolve();
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi des données de la course:', error);
                reject(error);
            });
    });
}


function afficherModalRecap(race_id, winner) {
    var modal = document.createElement('div');
    modal.classList.add('modal');
    var modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    var refreshButton = document.createElement('button');
    refreshButton.classList.add('refresh-button');
    refreshButton.textContent = 'Relancer la course';
    refreshButton.addEventListener('click', function() {
        location.reload(); // Recharger la page lors du clic sur le bouton de rafraîchissement
    });

    var titre = document.createElement('h1');
    titre.textContent = "Résultats de la course";

    var resultat = document.createElement('p');
    resultat.textContent = "L'escargot gagnant est l'escargot " + winner + "!";

    modalContent.appendChild(refreshButton);
    modalContent.appendChild(titre);
    modalContent.appendChild(resultat);
    all_players.forEach(player => {
        if (player.bet == winner) {
            var joueurGagnant = document.createElement('p');
            joueurGagnant.textContent = player.name + " a parié sur l'escargot gagnant!";
            modalContent.appendChild(joueurGagnant);
        }
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

