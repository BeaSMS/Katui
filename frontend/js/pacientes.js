function iniciarPacientes() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaPacientes");
    const btn = document.getElementById("btnAddPaciente");
    const pacienteSelecionado = document.getElementById("pacienteSelecionado");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarPacientes();
    mostrarPacienteSelecionado();

    btn.onclick = async () => {

        const email = document.getElementById("emailPaciente").value;

        if (!email) {
            alert("Digite o email do paciente!");
            return;
        }

        try {

            const resposta = await fetch(
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

            if (!resposta.ok) {
                alert("Erro ao adicionar paciente");
                return;
            }

            document.getElementById("emailPaciente").value = "";

            carregarPacientes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

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
                    mostrarPacienteSelecionado();

                    alert(`Paciente ${paciente.nome} selecionado!`);

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
                mostrarPacienteSelecionado();
            }

            carregarPacientes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    function mostrarPacienteSelecionado() {

        const nome = localStorage.getItem("pacienteSelecionadoNome");

        if (nome) {

            pacienteSelecionado.innerHTML = `
                Paciente selecionado:
                <strong>${nome}</strong>
            `;

        } else {

            pacienteSelecionado.innerHTML =
                "Nenhum paciente selecionado";
        }
    }
}