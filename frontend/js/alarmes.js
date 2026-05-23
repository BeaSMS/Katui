function iniciarAlarmes() {

    let timersAlarmes = [];

    const token = localStorage.getItem("token");
    const lista = document.getElementById("listaAlarmes");

    const btnAtivarNotificacao = document.getElementById("btnAtivarNotificacao");
    const statusNotificacao = document.getElementById("statusNotificacao");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina("paginas/auth/login.html");
        return;
    }

    if (!lista) return;

    configurarNotificacoes();
    carregarAlarmes();

    function configurarNotificacoes() {
        if (!btnAtivarNotificacao || !statusNotificacao) return;

        if (!("Notification" in window)) {
            statusNotificacao.textContent = "Seu navegador não suporta notificações.";
            btnAtivarNotificacao.style.display = "none";
            return;
        }

        atualizarStatusNotificacao();

        btnAtivarNotificacao.onclick = async () => {
            const permissao = await Notification.requestPermission();

            atualizarStatusNotificacao();

            if (permissao === "granted") {
                alert("Notificações ativadas com sucesso!");
                carregarAlarmes();
            }
        };
    }

    function atualizarStatusNotificacao() {
        if (!btnAtivarNotificacao || !statusNotificacao) return;

        if (Notification.permission === "granted") {
            statusNotificacao.textContent = "Notificações ativadas.";
            btnAtivarNotificacao.style.display = "none";
        } else if (Notification.permission === "denied") {
            statusNotificacao.textContent = "Notificações bloqueadas no navegador.";
            btnAtivarNotificacao.style.display = "none";
        } else {
            statusNotificacao.textContent = "Ative para receber lembretes no PC.";
            btnAtivarNotificacao.style.display = "inline-block";
        }
    }

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
                limparTimersAlarmes();
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

            criarGrupo("Hoje", pendentesHoje);
            criarGrupo("Próximos dias", proximosDias);
            criarGrupo("Já tomados", tomados);

            agendarNotificacoes(alarmes);

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function criarGrupo(titulo, alarmes) {
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

    function agendarNotificacoes(alarmes) {
        limparTimersAlarmes();

        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        const agora = new Date();

        alarmes.forEach(alarme => {
            if (alarme.tomado) return;

            const horarioAlarme = new Date(alarme.horario);
            const tempoAteAlarme = horarioAlarme.getTime() - agora.getTime();

            const umaSemana = 7 * 24 * 60 * 60 * 1000;

            if (tempoAteAlarme < 0 || tempoAteAlarme > umaSemana) {
                return;
            }

            const chave = `notificacaoAlarme_${alarme.id}_${alarme.horario}`;

            const timer = setTimeout(() => {
                if (localStorage.getItem(chave)) return;

                const nomeMedicamento = alarme.medicamento?.nome || "Medicamento";
                const dosagem = alarme.medicamento?.dosagem || "Dosagem não informada";

                const notificacao = new Notification("Hora do medicamento", {
                    body: `${nomeMedicamento} - ${dosagem}`,
                    tag: `alarme-${alarme.id}`,
                    requireInteraction: true
                });

                notificacao.onclick = () => {
                    window.focus();
                    carregarPagina("paginas/alarmes.html");
                };

                localStorage.setItem(chave, "notificado");

            }, tempoAteAlarme);

            timersAlarmes.push(timer);
        });
    }

    function limparTimersAlarmes() {
        timersAlarmes.forEach(timer => clearTimeout(timer));
        timersAlarmes = [];
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