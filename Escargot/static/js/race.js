let turboImages = ["static/images/turbobleu.png", "static/images/turbojaune.png", "static/images/turboorange.png", "static/images/turborose.png", "static/images/turborouge.png", "static/images/turbovert.png", "static/images/turboviolet.png"];
let all_players = [];
let race_id = Date.now();
let numberOfPlayers;

function getRandomTurboImage() {
    let randomIndex = Math.floor(Math.random() * turboImages.length);
    return turboImages[randomIndex];
}

let plateau = document.getElementById('plateau');
let playersReady = 0;

function init_game() {
    let tickspeed = parseInt(document.getElementById('tickspeed').value);
    let steps = parseInt(document.getElementById('steps').value);
    let escargots = parseInt(document.getElementById('escargots').value);
    let chances = parseInt(document.getElementById('chances').value);
    let steps_size = (window.innerWidth - 150) / steps;

    plateau.innerHTML = "";
    plateau.classList.add('plateau');

    for (let i = 1; i <= escargots; i++) {
        let concurent_image = document.createElement("img");
        concurent_image.src = getRandomTurboImage();

        let concurent = document.createElement("div");
        concurent.classList.add('concurent');
        concurent.appendChild(concurent_image);
        concurent.id = "escargot_" + i;
        concurent.setAttribute('step', '0');
        plateau.appendChild(concurent);

        let drapeau_img = document.createElement("img");
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
    let {tickspeed, steps, escargots, chances, steps_size} = init_game();
    document.getElementById('race_container').setAttribute('hidden', 'hidden')
    selectPlayers(tickspeed, steps, escargots, chances, steps_size)
}

function selectPlayers(tickspeed, steps, escargots, chances, steps_size) {
    while (!numberOfPlayers) {
        numberOfPlayers = parseInt(prompt("Entrez le nombre de joueurs :"));
    }

    let modal = document.createElement('div');
    modal.id = 'modal';
    modal.classList.add('modal');

    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    let titre = document.createElement('h1');
    titre.textContent = "Lancez les paris!";
    modalContent.appendChild(titre);

    for (let i = 1; i <= numberOfPlayers; i++) {
        let playerForm = document.createElement("form");
        playerForm.setAttribute('id', "form_player_" + i);
        let nameLabel = document.createElement("label");
        nameLabel.textContent = "Joueur " + i;
        nameLabel.classList.add('intro');

        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.required = "required";
        nameInput.name = "playerName" + i;
        nameInput.classList.add('nbjoueur');
        let escargotLabel = document.createElement("label");
        escargotLabel.textContent = " vote pour l' ";
        let escargotSelect = document.createElement("select");
        escargotSelect.name = "escargot" + i;

        for (let j = 1; j <= escargots; j++) {
            let option = document.createElement("option");
            option.value = j;
            option.textContent = "escargot " + j;
            escargotSelect.appendChild(option);
        }

        let submitButton = document.createElement("button");
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
            let playerName = currentPlayerNameInput.value;
            let selectedEscargot = currentPlayerEscargotSelect.value;
            let player = {
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
    let modal = document.createElement('div');
    modal.classList.add('modal');
    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    let refreshButton = document.createElement('button');
    refreshButton.classList.add('refresh-button');
    refreshButton.textContent = 'Relancer la course';
    refreshButton.addEventListener('click', function() {
        location.reload(); // Recharger la page lors du clic sur le bouton de rafraîchissement
    });

    let titre = document.createElement('h1');
    titre.textContent = "Résultats de la course";

    let resultat = document.createElement('p');
    resultat.textContent = "L'escargot gagnant est l'escargot " + winner + "!";

    modalContent.appendChild(refreshButton);
    modalContent.appendChild(titre);
    modalContent.appendChild(resultat);
    all_players.forEach(player => {
        if (player.bet == winner) {
            let joueurGagnant = document.createElement('p');
            joueurGagnant.textContent = player.name + " a parié sur l'escargot gagnant!";
            modalContent.appendChild(joueurGagnant);
        }
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
