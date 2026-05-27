async function fazerCadastro() {

    const tipo = document.getElementById("tipoCadastro").value;
    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const telefone = document.getElementById("telefoneCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    let altura = null;
    let peso = null;
    let alergias = null;

    if (tipo === "PACIENTE") {

        altura = Number(
            document.getElementById("alturaCadastro").value
        );

        peso = Number(
            document.getElementById("pesoCadastro").value
        );

        alergias =
            document.getElementById("alergiasCadastro").value;
    }

    if (!tipo || !nome || !email || !telefone || !senha) {

        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    if (tipo === "PACIENTE" && (!altura || !peso)) {

        alert("Preencha altura e peso do paciente!");
        return;
    }

    try {

        const resposta = await fetch(
            "http://localhost:8085/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    tipo,
                    telefone,
                    altura,
                    peso,
                    alergias
                })
            }
        );

        if (!resposta.ok) {

            alert("Erro ao realizar cadastro");
            return;
        }

        alert("Cadastro realizado com sucesso!");

        carregarPagina('paginas/auth/login.html');

    } catch (erro) {

        console.log(erro);

        alert("Erro ao conectar com backend");
    }
}



async function fazerLogin() {

    const email = document.getElementById("emailLogin").value;
    const senha = document.getElementById("senhaLogin").value;
    
    try {

        const resposta = await fetch("http://localhost:8085/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })

        });

        if (!resposta.ok) {

            alert("Email ou senha inválidos");

            return;
        }

        const dados = await resposta.json();

        localStorage.setItem("token", dados.token);

        // limpa paciente antigo
        localStorage.removeItem("pacienteSelecionadoId");
        localStorage.removeItem("pacienteSelecionadoNome");

        // busca usuário logado
        const respostaUsuario = await fetch(
            "http://localhost:8085/usuarios/me",
            {
                headers: {
                    "Authorization": "Bearer " + dados.token
                }
            }
        );

        if (!respostaUsuario.ok) {

            alert("Erro ao carregar usuário");
            return;
        }

        const usuario = await respostaUsuario.json();

        // salva tipo
        localStorage.setItem("tipoUsuario", usuario.tipo);
        
        mostrarMenuSistema();
        controlarVisibilidadeMenu();

        // cuidador vai para pacientes
        if (usuario.tipo === "CUIDADOR") {

            carregarPagina('paginas/pacientes.html');

        }

        // paciente vai para dashboard
        else {

            carregarPagina('paginas/dashboard.html');
        }

    } catch (erro) {

        console.log(erro);

        alert("Erro ao conectar com backend");

    }

}



function mostrarMenuSistema() {

    const tipoUsuario =
        localStorage.getItem("tipoUsuario");

    const pacienteSelecionado =
        localStorage.getItem("pacienteSelecionadoId");

    document.getElementById("itemLogin").style.display = "none";
    document.getElementById("itemCadastro").style.display = "none";

    document.getElementById("itemDashboard").style.display = "none";
    document.getElementById("itemAlarme").style.display = "none";
    document.getElementById("itemMedicamentos").style.display = "none";
    document.getElementById("itemSintomas").style.display = "none";
    document.getElementById("itemConsultas").style.display = "none";
    document.getElementById("itemExames").style.display = "none";
    document.getElementById("itemReceitas").style.display = "none";
    

    document.getElementById("itemPerfil").style.display = "block";
    document.getElementById("itemSair").style.display = "block";

    const itemPacientes =
        document.getElementById("itemPacientes");

    if (itemPacientes) {
        itemPacientes.style.display = "none";
    }

    // PACIENTE
    if (tipoUsuario === "PACIENTE") {

        document.getElementById("itemDashboard").style.display = "block";
        document.getElementById("itemAlarme").style.display = "block";
        document.getElementById("itemMedicamentos").style.display = "block";
        document.getElementById("itemSintomas").style.display = "block";
        document.getElementById("itemConsultas").style.display = "block";
        document.getElementById("itemExames").style.display = "block";
        document.getElementById("itemReceitas").style.display = "block";
        
    }

    // CUIDADOR
    else if (tipoUsuario === "CUIDADOR") {

        if (itemPacientes) {
            itemPacientes.style.display = "block";
        }

        // só libera sistema se selecionar paciente
        if (pacienteSelecionado) {

            document.getElementById("itemDashboard").style.display = "block";
            document.getElementById("itemAlarme").style.display = "block";
            document.getElementById("itemMedicamentos").style.display = "block";
            document.getElementById("itemSintomas").style.display = "block";
            document.getElementById("itemConsultas").style.display = "block";
            document.getElementById("itemExames").style.display = "block";
            document.getElementById("itemReceitas").style.display = "block";
        }
    }
}



function sair() {

    localStorage.removeItem("token");
    localStorage.removeItem("tipoUsuario");
    localStorage.removeItem("pacienteSelecionadoId");
    localStorage.removeItem("pacienteSelecionadoNome");

    document.getElementById("itemLogin").style.display = "block";
    document.getElementById("itemCadastro").style.display = "block";
    document.getElementById("itemAlarme").style.display = "none";
    document.getElementById("itemDashboard").style.display = "none";
    document.getElementById("itemMedicamentos").style.display = "none";
    document.getElementById("itemSintomas").style.display = "none";
    document.getElementById("itemConsultas").style.display = "none";
    document.getElementById("itemPerfil").style.display = "none";
    document.getElementById("itemExames").style.display = "none";
    document.getElementById("itemReceitas").style.display = "none";
    document.getElementById("itemSair").style.display = "none";

    controlarVisibilidadeMenu()

    const itemPacientes =
        document.getElementById("itemPacientes");

    if (itemPacientes) {
        itemPacientes.style.display = "none";
    }

    carregarPagina('paginas/auth/login.html');

}



function mostrarCamposCadastro() {

    const tipo = document.getElementById("tipoCadastro").value;
    const camposPaciente = document.getElementById("camposPaciente");

    if (tipo === "PACIENTE") {

        camposPaciente.classList.remove("escondido");

    } else {

        camposPaciente.classList.add("escondido");

        document.getElementById("alturaCadastro").value = "";
        document.getElementById("pesoCadastro").value = "";
        document.getElementById("alergiasCadastro").value = "";
    }
}
function controlarVisibilidadeMenu() {
    const token = localStorage.getItem("token");
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");
    const inverseDisplay = token ? "none" : "block";

    const itemLogin = document.getElementById("itemLogin");
    const itemCadastro = document.getElementById("itemCadastro");
    if (itemLogin) itemLogin.style.display = inverseDisplay;
    if (itemCadastro) itemCadastro.style.display = inverseDisplay;

    const btnQrHeader = document.getElementById("btnQRCodeHeader");
    if (btnQrHeader) {

        const deveExibir = token && (tipoUsuario === "PACIENTE" || (tipoUsuario === "CUIDADOR" && pacienteSelecionado));
        btnQrHeader.style.display = deveExibir ? "flex" : "none";
    }
}