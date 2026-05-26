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

            if (pagina.includes('qrcode')) {
                iniciarQRCode();
            }
            if (pagina.includes('ajuda')) {
                iniciarAjuda();
            }
        })
        .catch(err => {
            conteudo.innerHTML = "<p>Erro ao carregar conteúdo</p>";
            console.log(err);
        });
        controlarVisibilidadeMenu();
    }

    // DISPARA A VERIFICAÇÃO ASSIM QUE O SITE ENTRA NO AR
    verificarAutenticacaoInicial();
    
    /*Deixa a função acessível no HTML*/
    window.carregarPagina = carregarPagina;

    const token = localStorage.getItem("token");

    if (token) {
        mostrarMenuSistema();
        controlarVisibilidadeMenu(); // Garante que o menu está certo
        
        const tipoUsuario = localStorage.getItem("tipoUsuario");
        const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

        // AQUI: Apenas redireciona se for o carregamento inicial (se estiver no index)
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {
                carregarPagina('paginas/pacientes.html');
            } else {
                carregarPagina('paginas/dashboard.html');
            }
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

async function iniciarQRCode() {
    console.log("Iniciando lógica de QR Code..."); // Isso vai aparecer no F12 se funcionar
    
    const token = localStorage.getItem("token");
    const pacienteId = localStorage.getItem("pacienteSelecionadoId");
    
    // URL dinâmica: se tem paciente, pega o dele, se não, pega o do cuidador
    const urlBase = pacienteId 
        ? `http://localhost:8085/usuarios/qrcode?pacienteId=${pacienteId}` 
        : "http://localhost:8085/usuarios/qrcode";

    try {
        const resposta = await fetch(urlBase, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!resposta.ok) {
            console.error("Erro na resposta do servidor:", resposta.status);
            throw new Error("Erro ao buscar dados do QR");
        }

        const dados = await resposta.json();
        
        // Verifica se os elementos existem antes de tentar acessar
        const imgElement = document.getElementById("qrCodeImg");
        const expElement = document.getElementById("qrExpiracao");

        if (imgElement) {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dados.url)}`;
            imgElement.src = qrUrl;
            imgElement.style.display = "block";
        }
        
        if (expElement) {
            expElement.textContent = "Expira em: " + new Date(dados.expiracao).toLocaleTimeString();
        }
    } catch (e) {
        console.error("Erro no QR Code:", e);
        alert("Erro ao gerar QR Code. Verifique o console.");
    }
}

// FUNÇÃO DE VALIDAÇÃO DE LOGIN E TOKEN ATIVO
async function verificarAutenticacaoInicial() {
    const token = localStorage.getItem("token");
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

    // Passagem 1: Se nem existe token salvo, vai direto para o Login
    if (!token) {
        carregarPagina('paginas/auth/login.html');
        return;
    }

    // Passagem 2: Existe um token, mas precisamos saber se ele ainda é VÁLIDO no backend Java
    try {
        const resposta = await fetch("http://localhost:8085/usuarios/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (resposta.ok) {
            // O token é válido! Monta o menu correto e redireciona para a home certa
            if (typeof mostrarMenuSistema === "function") {
                mostrarMenuSistema(); 
            }
            if (typeof controlarVisibilidadeMenu === "function") {
                controlarVisibilidadeMenu(); 
            }
            if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {
                carregarPagina('paginas/pacientes.html');
            } else {
                carregarPagina('paginas/dashboard.html');
            }
        } else {
            // O servidor respondeu que o token expirou ou é inválido (401/403)
            localStorage.clear(); // Limpa lixo do localStorage
            carregarPagina('paginas/auth/login.html');
        }
    } catch (erro) {
        console.error("Erro ao conectar com o servidor para validar token:", erro);
        // Se a API Java estiver offline ou falhar, por segurança, joga para o login
        carregarPagina('paginas/auth/login.html');
    }
}
function controlarVisibilidadeMenu() {
    const token = localStorage.getItem("token");
    const display = token ? "block" : "none";
    const inverseDisplay = token ? "none" : "block";

    // Ocultar/Mostrar itens de Auth
    const itemLogin = document.getElementById("itemLogin");
    const itemCadastro = document.getElementById("itemCadastro");
    if(itemLogin) itemLogin.style.display = inverseDisplay;
    if(itemCadastro) itemCadastro.style.display = inverseDisplay;
    
    // CORREÇÃO: Usando o ID correto do seu HTML: btnQRCodeHeader
    const btnQr = document.getElementById("btnQRCodeHeader"); 
    if(btnQr) {
        btnQr.style.display = token ? "flex" : "none"; // flex para manter o alinhamento
    }
}