function iniciarAlarmes() {

    const token = localStorage.getItem("token");
    const lista = document.getElementById("listaAlarmes");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista) return;

    carregarAlarmes();

    async function carregarAlarmes() {

        lista.innerHTML = "<p>Carregando lembretes...</p>";

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
                lista.innerHTML = "<p>Erro ao carregar lembretes.</p>";
                return;
            }

            const alarmes = await resposta.json();

            lista.innerHTML = "";

            if (alarmes.length === 0) {
                lista.innerHTML = "<p>Nenhum lembrete encontrado.</p>";
                return;
            }

            alarmes.sort((a, b) => new Date(a.horario) - new Date(b.horario));

            const pendentesHoje = [];
            const proximosDias = [];
            const tomados = [];

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);

            alarmes.forEach(alarme => {

                const dataAlarme = new Date(alarme.horario);
                const dataSemHora = new Date(dataAlarme);
                dataSemHora.setHours(0, 0, 0, 0);

                if (alarme.tomado) {
                    tomados.push(alarme);
                } else if (dataSemHora.getTime() === hoje.getTime()) {
                    pendentesHoje.push(alarme);
                } else if (dataSemHora >= amanha) {
                    proximosDias.push(alarme);
                }
            });

            criarGrupo("Hoje", pendentesHoje, "hoje");
            criarGrupo("Próximos dias", proximosDias, "proximos");
            criarGrupo("Já tomados", tomados, "tomados");

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function criarGrupo(titulo, alarmes, tipo) {

        const grupo = document.createElement("div");
        grupo.classList.add("grupo-dia-alarme");

        grupo.innerHTML = `<h3>${titulo}</h3>`;

        if (alarmes.length === 0) {
            grupo.innerHTML += `<p class="sem-alarmes">Nenhum lembrete nesta seção.</p>`;
            lista.appendChild(grupo);
            return;
        }

        alarmes.forEach(alarme => {

            const div = document.createElement("div");
            div.classList.add("alarme");

            if (alarme.tomado) {
                div.classList.add("tomado");
            }

            if (!alarme.tomado && alarmeAtrasado(alarme.horario)) {
                div.classList.add("atrasado");
            }

            div.innerHTML = `
                <div class="alarme-topo">
                    <div>
                        <h3>${alarme.medicamento?.nome || "Medicamento"}</h3>
                        <span class="horario-alarme">
                            ${formatarDataHoraAlarme(alarme.horario)}
                        </span>
                    </div>

                    <span class="status-alarme">
                        ${definirStatusAlarme(alarme)}
                    </span>
                </div>

                <p>
                    <strong>Dosagem:</strong>
                    ${alarme.medicamento?.dosagem || "Não informada"}
                </p>

                <p>
                    <strong>Finalidade:</strong>
                    ${alarme.medicamento?.finalidade || "Não informada"}
                </p>

                <div class="acoes-alarme">
                    ${
                        !alarme.tomado
                        ? `<button class="btnTomado">Marcar como tomado</button>`
                        : ""
                    }

                    <button class="btnRemoverAlarme">Remover</button>
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

            grupo.appendChild(div);
        });

        lista.appendChild(grupo);
    }

    async function marcarTomado(id) {

        try {

            const resposta = await fetch(
                montarUrlComPaciente(`http://localhost:8085/alarmes/${id}/tomado`),
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                alert("Erro ao marcar como tomado");
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
                montarUrlComPaciente(`http://localhost:8085/alarmes/${id}`),
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                alert("Erro ao remover lembrete");
                return;
            }

            carregarAlarmes();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    function alarmeAtrasado(horario) {
        return new Date(horario) < new Date();
    }

    function definirStatusAlarme(alarme) {

        if (alarme.tomado) {
            return "Tomado";
        }

        if (alarmeAtrasado(alarme.horario)) {
            return "Atrasado";
        }

        return "Pendente";
    }

    function formatarDataHoraAlarme(data) {

        return new Date(data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }
}