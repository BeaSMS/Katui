const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
    document.getElementById("tokenInvalido").style.display = "block";
} else {
    carregarPaciente();
}

async function carregarPaciente() {

    try {

        const resposta = await fetch(
            `http://localhost:8085/medico/paciente?token=${token}`
        );

        if (!resposta.ok) {
            document.getElementById("tokenInvalido").style.display = "block";
            return;
        }

        const paciente = await resposta.json();

        document.getElementById("infoPaciente").innerHTML = `
            <p><strong>Paciente:</strong> ${paciente.nome || "Não informado"}</p>
            <p><strong>Alergias:</strong> ${paciente.alergias || "Nenhuma registrada"}</p>
        `;

        document.getElementById("conteudo").style.display = "block";

        document.getElementById("btnExame").onclick = enviarExame;
        document.getElementById("btnReceita").onclick = enviarReceita;

    } catch (erro) {
        console.log(erro);
        document.getElementById("tokenInvalido").style.display = "block";
    }
}

async function enviarExame() {

    const nome = document.getElementById("nomeExame").value;
    const obs = document.getElementById("obsExame").value;
    const arquivo = document.getElementById("arquivoExame").files[0];
    const msg = document.getElementById("msgExame");
    const btn = document.getElementById("btnExame");

    if (!nome || !arquivo) {
        msg.className = "mensagem erro";
        msg.textContent = "Preencha o nome e selecione um arquivo.";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append("token", token);
    formData.append("nome", nome);
    formData.append("observacao", obs);
    formData.append("arquivo", arquivo);

    try {

        const resposta = await fetch("http://localhost:8085/medico/exame", {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            msg.className = "mensagem sucesso";
            msg.textContent = "Exame enviado com sucesso!";
            document.getElementById("nomeExame").value = "";
            document.getElementById("obsExame").value = "";
            document.getElementById("arquivoExame").value = "";
            
        } else {
            msg.className = "mensagem erro";
            msg.textContent = "Erro ao enviar exame. Token pode ter expirado.";
        }

    } catch (erro) {
        msg.className = "mensagem erro";
        msg.textContent = "Erro ao conectar com o servidor.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Enviar Exame";
    }
}

async function enviarReceita() {

    const obs = document.getElementById("obsReceita").value;
    const arquivo = document.getElementById("arquivoReceita").files[0];
    const msg = document.getElementById("msgReceita");
    const btn = document.getElementById("btnReceita");

    if (!arquivo) {
        msg.className = "mensagem erro";
        msg.textContent = "Selecione um arquivo.";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append("token", token);
    formData.append("observacao", obs);
    formData.append("arquivo", arquivo);

    try {

        const resposta = await fetch("http://localhost:8085/medico/receita", {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            msg.className = "mensagem sucesso";
            msg.textContent = "Receita enviada com sucesso!";
            document.getElementById("obsReceita").value = "";
            document.getElementById("arquivoReceita").value = "";
            
        } else {
            msg.className = "mensagem erro";
            msg.textContent = "Erro ao enviar receita. Token pode ter expirado.";
        }

    } catch (erro) {
        msg.className = "mensagem erro";
        msg.textContent = "Erro ao conectar com o servidor.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Enviar Receita";
    }
}

function desabilitarFormularios() {

    const aviso = document.getElementById("avisoToken");
    aviso.style.background = "#faece7";
    aviso.style.borderColor = "#993c1d";
    aviso.innerHTML = "Este link foi <strong>utilizado</strong> e não pode mais ser usado. Solicite um novo QR code ao paciente.";

    document.getElementById("btnExame").disabled = true;
    document.getElementById("btnReceita").disabled = true;
}