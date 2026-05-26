async function iniciarPerfil() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    try {

        const resposta = await fetch("http://localhost:8085/usuarios/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resposta.ok) {
            alert("Erro ao carregar perfil");
            return;
        }

        const usuario = await resposta.json();

        document.getElementById("viewNome").textContent = usuario.nome || "";
        document.getElementById("viewEmail").textContent = usuario.email || "";
        document.getElementById("viewTelefone").textContent = usuario.telefone || "";
        document.getElementById("viewAltura").textContent = usuario.altura || "";
        document.getElementById("viewPeso").textContent = usuario.peso || "";
        document.getElementById("viewAlergias").textContent = usuario.alergias || "";
        document.getElementById("viewCategoria").textContent = usuario.tipo || "";

        const areaPaciente =
            document.getElementById("areaDadosPaciente");

        const edicaoDadosPaciente =
            document.getElementById("edicaoDadosPaciente");

        if (usuario.tipo === "CUIDADOR") {

            areaPaciente.style.display = "none";
            edicaoDadosPaciente.style.display = "none";

        } else {

            areaPaciente.style.display = "block";
            edicaoDadosPaciente.style.display = "block";
        }

    } catch (erro) {
        console.log(erro);
        alert("Erro ao conectar com backend");
    }

    const visualizacao = document.getElementById("visualizacao");
    const edicao = document.getElementById("edicao");

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const viewNome = document.getElementById("viewNome");
    const viewTelefone = document.getElementById("viewTelefone");
    const viewAltura = document.getElementById("viewAltura");
    const viewPeso = document.getElementById("viewPeso");
    const viewAlergias = document.getElementById("viewAlergias");

    const inputNome = document.getElementById("nome");
    const inputTelefone = document.getElementById("telefone");
    const inputAltura = document.getElementById("altura");
    const inputPeso = document.getElementById("peso");
    const inputAlergias = document.getElementById("alergias");

    btnEditar.onclick = () => {
        visualizacao.style.display = "none";
        edicao.style.display = "block";

        inputNome.value = viewNome.textContent;
        inputTelefone.value = viewTelefone.textContent;
        inputAltura.value = viewAltura.textContent;
        inputPeso.value = viewPeso.textContent;
        inputAlergias.value = viewAlergias.textContent;
    };

    btnCancelar.onclick = () => {
        edicao.style.display = "none";
        visualizacao.style.display = "block";
    };

    btnSalvar.onclick = async () => {

        let usuarioAtualizado = {
            nome: inputNome.value,
            telefone: inputTelefone.value
        };

        if (localStorage.getItem("tipoUsuario") === "PACIENTE") {

            usuarioAtualizado.altura = Number(inputAltura.value);
            usuarioAtualizado.peso = Number(inputPeso.value);
            usuarioAtualizado.alergias = inputAlergias.value;
        }

        try {

            const resposta = await fetch("http://localhost:8085/usuarios/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(usuarioAtualizado)
            });

            if (!resposta.ok) {
                alert("Erro ao salvar perfil");
                return;
            }

            const usuario = await resposta.json();

            viewNome.textContent = usuario.nome || "";
            viewTelefone.textContent = usuario.telefone || "";
            viewAltura.textContent = usuario.altura || "";
            viewPeso.textContent = usuario.peso || "";
            viewAlergias.textContent = usuario.alergias || "";

            document.getElementById("msg").style.display = "block";

            setTimeout(() => {
                document.getElementById("msg").style.display = "none";
            }, 2000);

            edicao.style.display = "none";
            visualizacao.style.display = "block";

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    // Carrega preferências de acessibilidade
    carregarPreferenciasAcessibilidade();
}

// Funções de Acessibilidade
function carregarPreferenciasAcessibilidade() {
    // Carrega tamanho da fonte
    const tamanhoSalvo = localStorage.getItem("tamanhoFonte") || "normal";
    document.getElementById("tamanhoFonte").value = tamanhoSalvo;
    aplicarTamanhFonte(tamanhoSalvo);

    // Carrega modo escuro
    const modoEscuroSalvo = localStorage.getItem("modoEscuro") === "true";
    document.getElementById("modoEscuro").checked = modoEscuroSalvo;
    if (modoEscuroSalvo) {
        aplicarModoEscuro();
    }

    // Carrega fonte dislexia
    const fonteDislexiaSalva = localStorage.getItem("fonteDislexia") === "true";
    document.getElementById("fonteDislexia").checked = fonteDislexiaSalva;
    if (fonteDislexiaSalva) {
        aplicarFonteDislexia();
    }
}

function alterarTamanhFonte() {
    const tamanho = document.getElementById("tamanhoFonte").value;
    localStorage.setItem("tamanhoFonte", tamanho);
    aplicarTamanhFonte(tamanho);
}

function aplicarTamanhFonte(tamanho) {
    let raiz = document.documentElement;

    switch (tamanho) {
        case "pequeno":
            raiz.style.fontSize = "12px";
            break;
        case "normal":
            raiz.style.fontSize = "16px";
            break;
        case "grande":
            raiz.style.fontSize = "18px";
            break;
        case "extragrande":
            raiz.style.fontSize = "20px";
            break;
    }
}

function alterarModoEscuro() {
    const ativo = document.getElementById("modoEscuro").checked;
    localStorage.setItem("modoEscuro", ativo);
    
    if (ativo) {
        aplicarModoEscuro();
    } else {
        removerModoEscuro();
    }
}

function aplicarModoEscuro() {
    document.documentElement.style.setProperty("--cor-fundo", "#1e1e1e");
    document.documentElement.style.setProperty("--cor-texto", "#e0e0e0");
    document.documentElement.style.setProperty("--cor-card", "#2d2d2d");
    document.body.style.backgroundColor = "#1e1e1e";
    document.body.style.color = "#e0e0e0";
}

function removerModoEscuro() {
    // Redefine as variáveis CSS para os valores padrão
    document.documentElement.style.setProperty("--cor-fundo", "#f6f8f8");
    document.documentElement.style.setProperty("--cor-texto", "#263238");
    document.documentElement.style.setProperty("--cor-card", "#ffffff");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
}

function alterarFonteDislexia() {
    const ativo = document.getElementById("fonteDislexia").checked;
    localStorage.setItem("fonteDislexia", ativo);
    
    if (ativo) {
        aplicarFonteDislexia();
    } else {
        removerFonteDislexia();
    }
}

function aplicarFonteDislexia() {
    // Importa a fonte OpenDyslexic do Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap";
    link.rel = "stylesheet";
    
    if (!document.querySelector('link[href*="OpenDyslexic"]')) {
        document.head.appendChild(link);
    }

    document.body.style.fontFamily = "'OpenDyslexic', cursive";
    document.body.style.letterSpacing = "0.1em";
    document.body.style.lineHeight = "1.8";
}

function removerFonteDislexia() {
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";
    document.body.style.letterSpacing = "normal";
    document.body.style.lineHeight = "normal";
}