function iniciarPacientes() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaPacientes");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista) {
        return;
    }

    carregarPacientes();

    async function carregarPacientes() {

        lista.innerHTML = "<p>Carregando pacientes...</p>";

        try {

            const resposta = await fetch(
                "http://localhost:8085/usuarios/me/pacientes",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar pacientes.</p>";
                return;
            }

            const pacientes = await resposta.json();

            lista.innerHTML = "";

            if (pacientes.length === 0) {
                lista.innerHTML = "<p>Nenhum paciente vinculado ainda.</p>";
                return;
            }

            pacientes.forEach(paciente => {

                const div = document.createElement("div");
                div.classList.add("paciente");

                div.innerHTML = `
                    <p><strong>Nome:</strong> ${paciente.nome}</p>
                    <p><strong>Email:</strong> ${paciente.email}</p>

                    <button class="btnSelecionarPaciente">
                        Acessar Dados
                    </button>

                    <button class="btnRemoverPaciente">
                        Remover
                    </button>
                `;

                div.querySelector(".btnSelecionarPaciente").onclick = () => {

                    localStorage.setItem("pacienteSelecionadoId", paciente.id);
                    localStorage.setItem("pacienteSelecionadoNome", paciente.nome);

                    mostrarMenuSistema();
                    mostrarAvisoPacienteSelecionado();

                    mostrarToast(`Paciente ${paciente.nome} selecionado!`);

                    carregarPagina('paginas/dashboard.html');
                };

                div.querySelector(".btnRemoverPaciente").onclick = () => {
                    removerPaciente(paciente.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function removerPaciente(id) {

        try {

            const resposta = await fetch(
                `http://localhost:8085/usuarios/me/pacientes/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                alert("Erro ao remover paciente");
                return;
            }

            const pacienteSelecionadoId =
                localStorage.getItem("pacienteSelecionadoId");

            if (pacienteSelecionadoId == id) {

                localStorage.removeItem("pacienteSelecionadoId");
                localStorage.removeItem("pacienteSelecionadoNome");

                mostrarMenuSistema();
                mostrarAvisoPacienteSelecionado();
            }

            carregarPacientes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    // Evento do botão para abrir modal de cadastro
    const btnNovaRegistro = document.getElementById("btnNovaRegistro");
    if (btnNovaRegistro) {
        btnNovaRegistro.onclick = abrirModalCadastroPaciente;
    }
}

// Funções para gerenciar o modal
function abrirModalCadastroPaciente() {
    const modal = document.getElementById("modalCadastroPaciente");
    if (modal) {
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
    }
}

function fecharModalCadastroPaciente() {
    const modal = document.getElementById("modalCadastroPaciente");
    if (modal) {
        modal.style.display = "none";
        document.getElementById("formCadastroPaciente").reset();
    }
}

// Função para registrar um novo paciente
async function registrarNovoPaciente() {
    const token = localStorage.getItem("token");
    
    const nome = document.getElementById("nomePacienteReg").value;
    const email = document.getElementById("emailPacienteReg").value;
    const telefone = document.getElementById("telefonePacienteReg").value;
    const altura = parseFloat(document.getElementById("alturaPacienteReg").value);
    const peso = parseFloat(document.getElementById("pesoPacienteReg").value);
    const alergias = document.getElementById("alergiasPacienteReg").value || null;
    const senha = document.getElementById("senhaPacienteReg").value;

    // Validações
    if (!nome || !email || !telefone || !altura || !peso || !senha) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    try {
        // 1. Registrar o novo paciente
        const respostaRegistro = await fetch(
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
                    tipo: "PACIENTE",
                    telefone,
                    altura,
                    peso,
                    alergias
                })
            }
        );

        if (!respostaRegistro.ok) {
            alert("Erro ao registrar paciente");
            return;
        }

        // 2. Adicionar o paciente registrado à lista do cuidador
        const respostaAdicionar = await fetch(
            "http://localhost:8085/usuarios/me/pacientes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    email: email
                })
            }
        );

        if (!respostaAdicionar.ok) {
            alert("Paciente registrado, mas não foi possível adicionar à sua lista. Tente adicionar pelo email.");
            return;
        }

        // 3. Sucesso! Fecha o modal e atualiza a lista
        mostrarToast(`Paciente ${nome} registrado com sucesso!`);
        fecharModalCadastroPaciente();
        
        // Recarrega a lista de pacientes
        iniciarPacientes();

    } catch (erro) {
        console.log(erro);
        alert("Erro ao conectar com backend");
    }
}