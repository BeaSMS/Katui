/* funcao consultas */
function iniciarConsultas() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaConsultas");
    const btn = document.getElementById("btnAddConsulta");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarConsultas();

    btn.onclick = async () => {

        const dataHora = document.getElementById("dataConsulta").value;
        const medico = document.getElementById("medicoConsulta").value;
        const especialidade = document.getElementById("espConsulta").value;
        const local = document.getElementById("localConsulta").value;

        if (!dataHora || !medico || !especialidade || !local) {
            alert("Preencha data, médico, especialidade e local!");
            return;
        }

        const consulta = {
            dataHora: dataHora,
            medico: medico,
            especialidade: especialidade,
            local: local,
        };

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/consultas"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(consulta)
            });

            if (!resposta.ok) {
                alert("Erro ao salvar consulta");
                return;
            }

            limparCamposConsulta();

            carregarConsultas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarConsultas() {

        lista.innerHTML = "<p>Carregando consultas...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/consultas"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar consultas.</p>";
                return;
            }

            const consultas = await resposta.json();

            lista.innerHTML = "";

            if (consultas.length === 0) {
                lista.innerHTML = "<p>Nenhuma consulta cadastrada ainda.</p>";
                return;
            }

            consultas.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

            consultas.forEach(consulta => {

                const div = document.createElement("div");
                div.classList.add("consulta");

                div.innerHTML = `
                    <p><strong>Data e horário:</strong> ${formatarDataConsulta(consulta.dataHora)}</p>
                    <p><strong>Médico:</strong> ${consulta.medico}</p>
                    <p><strong>Especialidade:</strong> ${consulta.especialidade}</p>
                    <p><strong>Local:</strong> ${consulta.local}</p>

                    <button class="remover">Remover</button>
                `;

                div.querySelector(".remover").onclick = () => {
                    removerConsulta(consulta.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function removerConsulta(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente( `http://localhost:8085/consultas/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao remover consulta");
                return;
            }

            carregarConsultas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    function limparCamposConsulta() {
        document.getElementById("dataConsulta").value = "";
        document.getElementById("medicoConsulta").value = "";
        document.getElementById("espConsulta").value = "";
        document.getElementById("localConsulta").value = "";
    }

    function formatarDataConsulta(data) {

        if (!data) {
            return "Não informado";
        }

        return new Date(data).toLocaleString();
    }
}