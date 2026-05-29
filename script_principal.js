if(localStorage.getItem("logado") !== "sim"){

    window.location.href = "../index.html";

}

let reconhecimento;

let aulaAtiva = false;

let aulaPausada = false;

let textoCompleto = "";

let streamCamera = null;

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

const btnIniciar =
document.getElementById("btnIniciar");

btnIniciar.addEventListener(
    "click",
    iniciarAula
);

async function iniciarAula(){

    if(aulaAtiva) return;

    try{

        atualizarStatus(
            "Solicitando permissões..."
        );

        /*
        ===================================
        PERMISSÃO MICROFONE/CÂMERA
        ===================================
        */

        streamCamera =
        await navigator
        .mediaDevices
        .getUserMedia({

            video: true,
            audio: true

        });

        /*
        FECHA O STREAM
        MAS MANTÉM PERMISSÃO
        */

        streamCamera
        .getTracks()
        .forEach(track => track.stop());

        aulaAtiva = true;

        aulaPausada = false;

        atualizarStatus(
            "🎤 Aula iniciada"
        );

        reconhecimento.start();

    }catch(erro){

        console.log(erro);

        atualizarStatus(
            "Permissões negadas."
        );

        alert(
            "Você precisa permitir câmera e microfone."
        );

    }

}

reconhecimento.onresult = function(event){

    let textoFinal = "";

    for(
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ){

        const transcript =
        event.results[i][0]
        .transcript
        .trim();

        const isFinal =
        event.results[i]
        .isFinal;

        if(isFinal){

            textoFinal +=
            transcript + " ";

        }

    }

    if(textoFinal !== ""){

        processarTexto(textoFinal);

    }

};

reconhecimento.onerror = function(event){

    atualizarStatus(
        "Erro: " + event.error
    );

};

reconhecimento.onend = function(){

    if(aulaAtiva){

        reconhecimento.start();

    }

};

function processarTexto(texto){

    const textoLower =
    texto.toLowerCase().trim();

    console.log(
        "Reconhecido:",
        textoLower
    );

    /*
    =================================
    DETECÇÃO FLEXÍVEL
    =================================
    */

    const comandoLibra =
    textoLower.includes("libra");

    const comandoVox =
    textoLower.includes("vox") ||
    textoLower.includes("box") ||
    textoLower.includes("voz");

    /*
    =================================
    PAUSAR
    =================================
    */

    if(

        comandoLibra &&
        comandoVox &&
        textoLower.includes("pausar")

    ){

        aulaPausada = true;

        atualizarStatus(
            "⏸ Aula pausada"
        );

        return;

    }

    /*
    =================================
    CONTINUAR
    =================================
    */

    if(

        comandoLibra &&
        comandoVox &&
        textoLower.includes("continuar")

    ){

        aulaPausada = false;

        atualizarStatus(
            "▶ Aula continuada"
        );

        return;

    }

    /*
    =================================
    CAMERA
    =================================
    */

    if(

        comandoLibra &&
        comandoVox &&
        (

            textoLower.includes("camera") ||
            textoLower.includes("câmera")

        )

    ){

        atualizarStatus(
            "📷 Abrindo câmera"
        );

        aulaPausada = true;

        abrirCamera();

        return;

    }

    /*
    =================================
    FINALIZAR
    =================================
    */

    if(

        comandoLibra &&
        comandoVox &&
        textoLower.includes("fim")

    ){

        finalizarAula();

        return;

    }

    /*
    =================================
    NÃO SALVA SE PAUSADO
    =================================
    */

    if(aulaPausada) return;

    /*
    =================================
    REMOVE COMANDOS
    =================================
    */

    texto = limparTexto(texto);

    if(texto === "") return;

    textoCompleto += texto + "\n";

    atualizarTexto();

    salvarAula();

}

function limparTexto(texto){

    texto = texto.replace(
        /libra/gi,
        ""
    );

    texto = texto.replace(
        /vox/gi,
        ""
    );

    texto = texto.replace(
        /box/gi,
        ""
    );

    texto = texto.replace(
        /voz/gi,
        ""
    );

    texto = texto.replace(
        /pausar/gi,
        ""
    );

    texto = texto.replace(
        /continuar/gi,
        ""
    );

    texto = texto.replace(
        /camera/gi,
        ""
    );

    texto = texto.replace(
        /câmera/gi,
        ""
    );

    texto = texto.replace(
        /fim/gi,
        ""
    );

    return texto.trim();

}

function atualizarTexto(){

    document
    .getElementById(
        "textoReconhecido"
    )
    .innerText =
    textoCompleto;

    /*
    =================================
    TEXTO DO VLIBRAS
    =================================
    */

    document
    .getElementById(
        "textoVlibras"
    )
    .innerText =
    textoCompleto;

}

function atualizarStatus(msg){

    document
    .getElementById("status")
    .innerHTML = msg;

}

function salvarAula(){

    localStorage.setItem(
        "aulaTexto",
        textoCompleto
    );

}

function limparAula(){

    textoCompleto = "";

    localStorage.removeItem(
        "aulaTexto"
    );

    atualizarTexto();

    atualizarStatus(
        "🧹 Aula limpa"
    );

}

function finalizarAula(){

    aulaAtiva = false;

    aulaPausada = true;

    reconhecimento.stop();

    fecharCamera();

    atualizarStatus(
        "✅ Aula finalizada"
    );

    salvarAula();

}

/*
==================================
CÂMERA
==================================
*/

async function abrirCamera(){

    try{

        atualizarStatus(
            "📷 Abrindo câmera"
        );

        streamCamera =
        await navigator
        .mediaDevices
        .getUserMedia({

            video: true,
            audio: false

        });

        const video =
        document.getElementById(
            "videoCamera"
        );

        video.srcObject =
        streamCamera;

        const modal =
        document.getElementById(
            "cameraModal"
        );

        if(modal){

            modal.style.display =
            "flex";

        }

    }catch(erro){

        console.log(erro);

        atualizarStatus(
            "Erro ao abrir câmera"
        );

    }

}

function capturarFoto(){

    const video =
    document.getElementById(
        "videoCamera"
    );

    const canvas =
    document.createElement(
        "canvas"
    );

    canvas.width =
    video.videoWidth;

    canvas.height =
    video.videoHeight;

    const ctx =
    canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const imagem =
    canvas.toDataURL(
        "image/png"
    );

    const div =
    document.createElement("div");

    div.className =
    "col-md-4";

    const img =
    document.createElement("img");

    img.src = imagem;

    img.className =
    "img-aula";

    div.appendChild(img);

    document
    .getElementById(
        "galeria"
    )
    .appendChild(div);

    fecharCamera();

    atualizarStatus(
        "📸 Imagem anexada"
    );

    aulaPausada = false;

    atualizarStatus(
        "▶ Aula continuada"
    );

}

function fecharCamera(){

    if(streamCamera){

        streamCamera
        .getTracks()
        .forEach(track => track.stop());

    }

    const modal =
    document.getElementById(
        "cameraModal"
    );

    if(modal){

        modal.style.display =
        "none";

    }

}

window.onload = function(){

    const aulaSalva =
    localStorage.getItem(
        "aulaTexto"
    );

    if(aulaSalva){

        textoCompleto =
        aulaSalva;

        atualizarTexto();

    }

};
