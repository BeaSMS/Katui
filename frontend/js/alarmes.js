function iniciarAlarmes() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaAlarmes");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista) {
        return;
    }

    carregarAlarmes();

    async function carregarAlarmes() {

        lista.innerHTML = "<p>Carregando alarmes...</p>";

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/alarmes"),
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar alarmes.</p>";
                return;
            }

            const alarmes = await resposta.json();

            lista.innerHTML = "";

            if (alarmes.length === 0) {
                lista.innerHTML = "<p>Nenhum alarme encontrado.</p>";
                return;
            }

            alarmes.sort((a, b) =>
                new Date(a.horario) - new Date(b.horario)
            );

            alarmes.forEach(alarme => {

                const div = document.createElement("div");
                div.classList.add("alarme");

                if (alarme.tomado) {
                    div.classList.add("tomado");
                }

                div.innerHTML = `
                    <div class="alarme-topo">

                        <div>
                            <h3>
                                ${alarme.medicamento?.nome || "Medicamento"}
                            </h3>

                            <span class="horario-alarme">
                                ${formatarHorarioAlarme(alarme.horario)}
                            </span>
                        </div>

                        <span class="status-alarme">
                            ${alarme.tomado ? "Tomado" : "Pendente"}
                        </span>

                    </div>

                    <p>
                        <strong>Dosagem:</strong>
                        ${alarme.medicamento?.dosagem || "Não informada"}
                    </p>

                    <div class="acoes-alarme">

                        ${
                            !alarme.tomado
                            ?
                            `<button class="btnTomado">
                                Marcar como tomado
                            </button>`
                            :
                            ""
                        }

                        <button class="btnRemoverAlarme">
                            Remover
                        </button>

                    </div>
                `;

                if (!alarme.tomado) {

                    div.querySelector(".btnTomado").onclick = () => {
                        marcarTomado(alarme.id);
                    };
                }

                div.querySelector(".btnRemoverAlarme").onclick = () => {
                    removerAlarme(alarme.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function marcarTomado(id) {

        try {

            const resposta = await fetch(
                montarUrlComPaciente(
                    `http://localhost:8085/alarmes/${id}/tomado`
                ),
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                alert("Erro ao marcar alarme");
                return;
            }

            carregarAlarmes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    async function removerAlarme(id) {

        try {

            const resposta = await fetch(
                montarUrlComPaciente(
                    `http://localhost:8085/alarmes/${id}`
                ),
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                alert("Erro ao remover alarme");
                return;
            }

            carregarAlarmes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    function formatarHorarioAlarme(data) {

        return new Date(data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }
}