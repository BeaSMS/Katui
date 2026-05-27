const params = new URLSearchParams(window.location.search);
const token = params.get("token");
let pacienteId = params.get("pacienteId"); // Tenta obter do URL

if (!token) {
    document.getElementById("tokenInvalido").style.display = "block";
} else {
    carregarPaciente();
}

async function carregarPaciente() {
    try {
        const resposta = await fetch(`http://localhost:8085/medico/paciente?token=${token}`);
        if (!resposta.ok) {
            document.getElementById("tokenInvalido").style.display = "block";
            return;
        }

        const paciente = await resposta.json();
        // Se não veio no URL, tenta usar o ID do paciente retornado
        if (!pacienteId && paciente.id) {
            pacienteId = paciente.id;
        }
        
        document.getElementById("infoPaciente").innerHTML = `
            <p><strong>Paciente:</strong> ${paciente.nome || "Não informado"}</p>
            <p><strong>Alergias:</strong> ${paciente.alergias || "Nenhuma registrada"}</p>
        `;
        document.getElementById("conteudo").style.display = "block";
        // As linhas de .onclick foram removidas daqui para evitar conflitos
    } catch (erro) {
        console.log(erro);
        document.getElementById("tokenInvalido").style.display = "block";
    }
}

async function enviarExame() {
    const nome = document.getElementById("nomeExame").value;
    const data = document.getElementById("dataExame").value; // Captura a data
    const obs = document.getElementById("obsExame").value;
    const arquivo = document.getElementById("arquivoExame").files[0];
    const msg = document.getElementById("msgExame");
    const btn = document.getElementById("btnExame");

    // Validação para garantir que os campos essenciais foram preenchidos
    if (!nome || !data || !arquivo) {
        msg.className = "mensagem erro";
        msg.textContent = "Preencha o nome, a data e selecione um arquivo.";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append("token", token);
    formData.append("nome", nome);
    
    // A MÁGICA AQUI: Concatenamos a data no formato que o exames.js espera.
    // Se o médico escrever alguma observação, ela vai logo a seguir separada por um traço.
    const observacaoFormatada = `Data do exame: ${data}${obs ? ' - ' + obs : ''}`;
    formData.append("observacao", observacaoFormatada);
    
    formData.append("arquivo", arquivo);
    
    if (pacienteId) {
        formData.append("pacienteId", pacienteId);
    }

    try {
        const resposta = await fetch("http://localhost:8085/medico/exame", {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            msg.className = "mensagem sucesso";
            msg.textContent = "Exame enviado com sucesso!";
            // Limpa os campos
            document.getElementById("nomeExame").value = "";
            document.getElementById("dataExame").value = "";
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
    
    // Se houver pacienteId, inclui na requisição para garantir associação correta
    if (pacienteId) {
        formData.append("pacienteId", pacienteId);
    }

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