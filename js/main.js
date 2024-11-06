import { agregarClase, quitarClase } from "./utils.js";

const channel = "ArtLira";
const REWARD_BELINDA = "Belinda";
let customRewards = [];
const banWords = ['puto', 'puta', 'put0'];
let pendientes = [];
let isPlaying = false;

const frases = ['ganando como siempre', 'no quiero ver a nadie', 'eres mi angel de paz', 'ay que calor me da', 'beli belica'];
const sounds = ['Ganando.mp3', 'Nadie.mp3', 'Angel.mp3', 'Calor.mp3', 'Belica.mp3'];
let Audios = [];
//const voice_id = 'bcce747f-73e4-472d-b189-888cf8b7ed8d'; // BLinda
const voice_id = 'c2cfb0ba-3a50-4d82-8a5d-cfcd401957af'; //BLinda2

const pozoleSound = new Audio('sonidos/pozole.mp3');

function init() {
    setRewards(channel);
    loadAudios();
    ComfyJS.Init(channel);
}

function setRewards(channelName) {
    fetch(`https://api.jebaited.net/twitchItems/${channelName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la solicitud");
            }
            return response.json(); // Convierte la respuesta en JSON
        })
        .then(data => {
            let rewards = data[0].data.community.channel.communityPointsSettings.customRewards;

            for (let reward of rewards) {
                customRewards[reward["id"]] = {
                    cost: reward["cost"],
                    name: reward["title"],
                };
            }
            console.log(customRewards);
        })
        .catch(error => console.error("Error:", error));
}

async function fetchBLinda(txtInput) {
    const options = {
        method: 'POST',
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            Authorization: 'eTb7YKAQhwIBh9CxBhRD0GV4wkHN0266VHhw9qLkQ7I='
        },
        body: JSON.stringify({
            voice_id: voice_id,
            input: txtInput,
            audio_format: 'mp3',
            language: 'es-ES',
            model: 'simba-multilingual'
        })
    };
    try {
        // Hacemos la petición con async y await
        const response = await fetch('https://api.sws.speechify.com/v1/audio/speech', options);
        first();
        const result = await response.json();

        // Obtener el audio en base64 del campo audio_data
        const audioBase64 = result.audio_data;

        // Convertir el base64 a un blob de tipo mp3
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });

        // Crear una URL de objeto para el blob y reproducirlo
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = end;
        start();
        audio.play();
        console.log("Audio reproduciéndose...");
    } catch (err) {
        console.error("Error al reproducir el audio:", err);
    }
}

function esTextoLegible(texto) {
    const patron = /[a-zA-Z0-9]/; // Verifica si el texto contiene al menos una letra o número 
    if (patron.test(texto)) {
        return true;
    } return false;
}

function banW(txt) {
    if (banWords.length > 0) {
        for (let s of banWords) {
            if (txt.includes(s)) return true;
        }
    }
    return false;
}

function loadAudios() {
    for (let i = 0; i < sounds.length; i++) {
        Audios[i] = new Audio(`sonidos/${sounds[i]}`);
        Audios[i].addEventListener("ended", end);
    }
}

function isPharse(txt) {
    if (frases.length > 0) {
        for (let f of frases) {
            if (txt.includes(f)) return true;
        }
    }
    return false;
}

function removeEmpty(txts) {
    return txts.filter(function (txt) {
        return txt != "" && txt != " ";
    });
}

function txtfrases(txt) {
    let txts = [txt];
    for (let p of frases) {
        var spl = new RegExp("(" + p + ")", "g");
        console.log(spl);
        let aux = [];
        for (let t of txts) {
            let a = t.split(spl);
            aux = aux.concat(a);
        }
        if (aux.length > 0) txts = aux;
    }
    return removeEmpty(txts);
}

function playFrase(frase) {
    let ind = frases.indexOf(frase);
    Audios[ind].play();
}

function tts(txt) {
    txt = txt.toLowerCase();
    pendientes = pendientes.concat(txtfrases(txt));
    console.log('tts');
    console.log(pendientes);
    if (!isPlaying) end();
}

function first() {
    quitarClase('main', "initialHide");
    quitarClase('main', "SlideLeftOut");
    agregarClase('main', "SlideRightIn");
}

function start() {
    agregarClase('boca', 'UpDown');
}

function end() {
    console.log("end");
    console.log(pendientes);
    if (pendientes.length > 0) {
        let txt = pendientes[0];
        pendientes.splice(0, 1);
        if (isPharse(txt)) {
            first();
            playFrase(txt);
        }
        else {
            if(esTextoLegible(txt)) {
                fetchBLinda(txt);
            } else {
                end();
            }
        }
    } else {
        quitarClase('boca', "UpDown");
        quitarClase('main', "SlideRightIn");
        agregarClase('main', "SlideLeftOut");
        isPlaying = false;
    }
}

ComfyJS.onChat = (user, message, flags, self, extra) => {
    if (extra.customRewardId) {
        const id = extra.customRewardId;
        const reward = customRewards[id];
        if (reward != undefined) {
            if (reward.name == REWARD_BELINDA && !banW(message)) {
                tts(message);
            }
        }
    }
}

function iniciar() {
    quitarClase('pozole', "initialHide");
    quitarClase('pozole', "SlideLeftOut");
    agregarClase('pozole', "SlideRightIn");
    setTimeout(() => {
        pozoleSound.onended = (event) => {
            //hide
            agregarClase('pozole', "SlideLeftOut");
        };
        pozoleSound.play();
    }, 1000);

}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command == 'pozole') {
        iniciar();
    }
}

init();