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

    let textoFinal = "";

    for(let i = event.resultIndex; i < event.results.length; i++){

        const transcript =
        event.results[i][0].transcript.trim();

        const isFinal =
        event.results[i].isFinal;

        if(isFinal){

            textoFinal += transcript + " ";

        }

    }

    if(textoFinal !== ""){

        processarTexto(textoFinal);

    }

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

    const textoLower = texto.toLowerCase().trim();

    console.log("Reconhecido:", textoLower);

    /*
    ========================
    COMANDOS DE VOZ
    ========================
    */

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

    if(textoLower.includes("libravox câmera") ||
       textoLower.includes("libravox camera")){

        aulaPausada = true;

        atualizarStatus("📷 Abrindo câmera");

        abrirCamera();

        return;

    }

    if(textoLower.includes("libravox fim")){

        finalizarAula();

        return;

    }

    /*
    ========================
    SE ESTIVER PAUSADO
    NÃO SALVA TEXTO
    ========================
    */

    if(aulaPausada) return;

    /*
    ========================
    LIMPEZA DE TEXTO
    ========================
    */

    texto = limparTexto(texto);

    if(texto === "") return;

    /*
    ========================
    SALVA TEXTO
    ========================
    */

    textoCompleto += texto + "\n";

    atualizarTexto();

    salvarAula();

}

function limparTexto(texto){

    texto = texto.replace(/libravox pausar/gi, "");
    texto = texto.replace(/libravox continuar/gi, "");
    texto = texto.replace(/libravox câmera/gi, "");
    texto = texto.replace(/libravox camera/gi, "");
    texto = texto.replace(/libravox fim/gi, "");

    texto = texto.trim();

    return texto;

}

function atualizarTexto(){

    document.getElementById("textoReconhecido").innerText =
    textoCompleto;

    /*
    ========================
    TEXTO PARA O VLIBRAS
    ========================
    */

    document.getElementById("textoVlibras").innerText =
    textoCompleto;

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

    alert("Aula finalizada.");

}

function salvarAula(){

    localStorage.setItem(
        "aulaTexto",
        textoCompleto
    );

}

function limparAula(){

    textoCompleto = "";

    localStorage.removeItem("aulaTexto");

    atualizarTexto();

    atualizarStatus("🧹 Aula limpa");

}

function abrirCamera(){

    document
    .getElementById("cameraInput")
    .click();

}

document
.getElementById("cameraInput")
.addEventListener("change", function(event){

    const arquivo = event.target.files[0];

    if(!arquivo){

        aulaPausada = false;

        return;

    }

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

        /*
        CONTINUA AUTOMATICAMENTE
        */

        aulaPausada = false;

        atualizarStatus("▶ Aula continuada");

    };

    reader.readAsDataURL(arquivo);

});

window.onload = function(){

    const aulaSalva =
    localStorage.getItem("aulaTexto");

    if(aulaSalva){

        textoCompleto = aulaSalva;

        atualizarTexto();

    }

};
