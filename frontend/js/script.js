/*Menu e Rodapé*/

function voltarInicio() {

    const token = localStorage.getItem("token");
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

    if (!token) {
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {
        carregarPagina('paginas/pacientes.html');
        return;
    }

    carregarPagina('paginas/dashboard.html');
}

document.addEventListener('DOMContentLoaded', () => {

    const conteudo = document.querySelector('.conteudo');

    /*Botão do menu*/
    const botao = document.querySelector('.cabecalhoMenu button');
    const menu = document.querySelector('.cabecalhoMenu');

    if (botao && menu) {
        botao.addEventListener('click', () => {
            menu.classList.toggle('ativo');
        });
    }

    /*Função de carregar as páginas*/
    function carregarPagina(pagina) {

        fetch(pagina)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Página não encontrada: " + pagina);
                }
                return res.text();
            })
        .then(html => {
            conteudo.innerHTML = html;

            mostrarAvisoPacienteSelecionado();

            if (pagina.includes('dashboard')) {
                iniciarDashboard();
            }

            if (pagina.includes('alarmes')) {
                iniciarAlarmes();
            }

            if (pagina.includes('consultas')) {
                iniciarConsultas();
            }

            if (pagina.includes('perfil')) {
                iniciarPerfil();
            }

            if (pagina.includes('exames')) {
                iniciarExames();
            }

            if (pagina.includes('receitas')) {
                iniciarReceitas();
            }

            if (pagina.includes('medicamentos')) {
                iniciarMedicamentos();
            }

            if (pagina.includes('sintomas')) {
                iniciarSintomas();
            }

            if (pagina.includes('pacientes')) {
                iniciarPacientes();
            }
        })
        .catch(err => {
            conteudo.innerHTML = "<p>Erro ao carregar conteúdo</p>";
            console.log(err);
        });
    }

    /*Deixa a função acessível no HTML*/
    window.carregarPagina = carregarPagina;

        const token = localStorage.getItem("token");

    if (token) {

        mostrarMenuSistema();

        const tipoUsuario = localStorage.getItem("tipoUsuario");
        const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

        if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {

            carregarPagina('paginas/pacientes.html');

        } else {

            carregarPagina('paginas/dashboard.html');

        }

    } else {

        carregarPagina('paginas/auth/login.html');

    }

});    

function montarUrlComPaciente(urlBase) {

    const tipoUsuario =
        localStorage.getItem("tipoUsuario");

    const pacienteId =
        localStorage.getItem("pacienteSelecionadoId");

    if (
        tipoUsuario === "CUIDADOR"
        && pacienteId
    ) {

        const separador =
            urlBase.includes("?") ? "&" : "?";

        return `${urlBase}${separador}pacienteId=${pacienteId}`;
    }

    return urlBase;
}

function mostrarAvisoPacienteSelecionado() {

    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const nomePaciente = localStorage.getItem("pacienteSelecionadoNome");

    if (tipoUsuario !== "CUIDADOR" || !nomePaciente) {
        return;
    }

    const conteudo = document.querySelector(".conteudo");

    const aviso = document.createElement("div");
    aviso.classList.add("aviso-paciente");

    aviso.innerHTML = `
        Você está acessando os dados de:
        <strong>${nomePaciente}</strong>
    `;

    conteudo.prepend(aviso);
}

async function gerarQRCode() {

    const token = localStorage.getItem("token");

    const resposta = await fetch("http://localhost:8085/medico/token", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
    });

    const dados = await resposta.json();

    // Usa a API do QR Server para gerar o QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dados.url)}`;

    document.getElementById("qrCodeImg").src = qrUrl;
    document.getElementById("qrCodeImg").style.display = "block";
    document.getElementById("qrExpiracao").textContent =
        "Expira em: " + new Date(dados.expiracao).toLocaleTimeString();
}