function iniciarQRCode() {

    const token = localStorage.getItem("token");
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

    // Paciente sempre pode acessar
    if (tipoUsuario === "PACIENTE" && token) {
        // Permite acesso
    }
    // Cuidador só pode acessar se estiver gerenciando um paciente
    else if (tipoUsuario === "CUIDADOR" && token && pacienteSelecionado) {
        // Permite acesso
    }
    // Qualquer outro caso redireciona
    else {
        const destino = tipoUsuario === "CUIDADOR" 
            ? 'paginas/pacientes.html' 
            : 'paginas/dashboard.html';
        carregarPagina(destino);
        return;
    }

    const qrCodeArea = document.getElementById("qrCodeArea");

    if (!qrCodeArea) {
        return;
    }

    const btnGerarQR = document.getElementById("btnGerarQR");
    
    if (btnGerarQR) {
        btnGerarQR.onclick = gerarQRCode;
    }
}

async function gerarQRCode() {

    const token = localStorage.getItem("token");

    if (!token) return;

    const btn = document.getElementById("btnGerarQR");
    btn.textContent = "Gerando...";
    btn.disabled = true;

    try {

        const resposta = await fetch("http://localhost:8085/medico/token", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resposta.ok) {
            alert("Erro ao gerar QR code");
            return;
        }

        const dados = await resposta.json();

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dados.url)}`;

        document.getElementById("qrCodeImg").src = qrUrl;

        const expiracao = new Date(dados.expiracao);
        document.getElementById("qrExpiracao").textContent =
            "Expira às: " + expiracao.toLocaleTimeString('pt-BR');

        document.getElementById("qrCodeArea").style.display = "block";

    } catch (erro) {
        console.log(erro);
        alert("Erro ao conectar com backend");

    } finally {
        btn.textContent = "Gerar QR Code";
        btn.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", iniciarQRCode);
