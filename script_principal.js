if(localStorage.getItem("logado") !== "sim"){

    window.location.href = "../index.html";

}

let reconhecimento;
let aulaAtiva = false;
let aulaPausada = false;
let textoCompleto = "";

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

    alert("Seu navegador não suporta reconhecimento de voz.");

}else{

    reconhecimento = new SpeechRecognition();

    reconhecimento.lang = "pt-BR";

    reconhecimento.continuous = true;

    reconhecimento.interimResults = true;

}

const btnIniciar = document.getElementById("btnIniciar");

btnIniciar.addEventListener("click", iniciarAula);

function iniciarAula(){

    if(aulaAtiva) return;

    aulaAtiva = true;

    aulaPausada = false;

    atualizarStatus("🎤 Aula iniciada");

    reconhecimento.start();

}

reconhecimento.onresult = function(event){

    let textoParcial = "";

    for(let i = event.resultIndex; i < event.results.length; i++){

        textoParcial += event.results[i][0].transcript + " ";

    }

    processarTexto(textoParcial);

};

reconhecimento.onerror = function(event){

    atualizarStatus("Erro: " + event.error);

};

reconhecimento.onend = function(){

    if(aulaAtiva){

        reconhecimento.start();

    }

};

function processarTexto(texto){

    const textoLower = texto.toLowerCase();

    if(textoLower.includes("libravox pausar")){

        aulaPausada = true;

        atualizarStatus("⏸ Aula pausada");

        return;

    }

    if(textoLower.includes("libravox continuar")){

        aulaPausada = false;

        atualizarStatus("▶ Aula continuada");

        return;

    }

    if(textoLower.includes("libravox fim")){

        finalizarAula();

        return;

    }

    if(textoLower.includes("libravox camera")){

        aulaPausada = true;

        atualizarStatus("📷 Abrindo câmera");

        abrirCamera();

        return;

    }

    if(aulaPausada) return;

    textoCompleto += texto + " ";

    atualizarTexto();

    salvarAula();

}

function atualizarTexto(){

    document.getElementById("textoReconhecido").innerHTML = textoCompleto;

    document.getElementById("textoVlibras").innerHTML = textoCompleto;

}

function atualizarStatus(msg){

    document.getElementById("status").innerHTML = msg;

}

function finalizarAula(){

    aulaAtiva = false;

    aulaPausada = true;

    reconhecimento.stop();

    atualizarStatus("✅ Aula finalizada");

    salvarAula();

    alert("Aula salva com sucesso.");

}

function salvarAula(){

    localStorage.setItem("aulaTexto", textoCompleto);

}

function abrirCamera(){

    document.getElementById("cameraInput").click();

}

document
.getElementById("cameraInput")
.addEventListener("change", function(event){

    const arquivo = event.target.files[0];

    if(!arquivo) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const div = document.createElement("div");

        div.className = "col-md-4";

        const img = document.createElement("img");

        img.src = e.target.result;

        img.className = "img-aula";

        div.appendChild(img);

        document
        .getElementById("galeria")
        .appendChild(div);

        atualizarStatus("📸 Imagem anexada");

        aulaPausada = false;

    };

    reader.readAsDataURL(arquivo);

});

window.onload = function(){

    const aulaSalva = localStorage.getItem("aulaTexto");

    if(aulaSalva){

        textoCompleto = aulaSalva;

        atualizarTexto();

    }

};