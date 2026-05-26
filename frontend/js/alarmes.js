function iniciarAlarmes() {
    let timersAlarmes = [];
    const token = localStorage.getItem("token");
    const lista = document.getElementById("listaAlarmes");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina("paginas/auth/login.html");
        return;
    }

    if (!lista) return;

    carregarAlarmes();

    async function carregarAlarmes() {
        lista.innerHTML = "<p>Carregando lembretes...</p>";
        try {
            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/alarmes"), {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            });

            if (!resposta.ok) throw new Error("Erro ao carregar alarmes");
            const alarmes = await resposta.json();

            lista.innerHTML = "";
            if (alarmes.length === 0) {
                lista.innerHTML = "<p>Nenhum lembrete encontrado.</p>";
                limparTimersAlarmes();
                return;
            }

            // 1. Agrupar os alarmes pelo NOME do medicamento
            const alarmesPorRemedio = {};

            alarmes.forEach(alarme => {
                const nomeMed = alarme.medicamento?.nome || "Medicamento Desconhecido";
                if (!alarmesPorRemedio[nomeMed]) {
                    alarmesPorRemedio[nomeMed] = [];
                }
                alarmesPorRemedio[nomeMed].push(alarme);
            });

            // 2. Para cada remédio, criar o card (sanfona/accordion)
            for (const nomeMed in alarmesPorRemedio) {
                // Ordena os alarmes desse remédio cronologicamente
                const alarmesDoMed = alarmesPorRemedio[nomeMed].sort((a, b) => new Date(a.horario) - new Date(b.horario));
                criarGrupoRemedio(nomeMed, alarmesDoMed);
            }

            agendarNotificacoes(alarmes);

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function criarGrupoRemedio(nomeMed, alarmes) {
        const grupo = document.createElement("div");
        grupo.classList.add("grupo-dia-alarme");

        const pendentes = alarmes.filter(a => !a.tomado && !alarmeAtrasado(a.horario)).length;
        const atrasados = alarmes.filter(a => !a.tomado && alarmeAtrasado(a.horario)).length;

        // Cabeçalho clicável (A barra do remédio)
        grupo.innerHTML = `
            <div class="grupo-alarme-cabecalho" style="cursor: pointer; background-color: #2da79d; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <h3 style="margin: 0; text-transform: uppercase; font-size: 1.1em; color: #ffffff;">
                    ${nomeMed}
                </h3>
                
                <div style="font-size: 0.9em; color: #ffffff;">
                    ${atrasados > 0 ? `<span style="background-color: #e74c3c; color: #ffffff; padding: 3px 8px; border-radius: 12px; margin-right: 5px; font-weight: bold;">${atrasados} atrasados</span>` : ''}
                    <span>${pendentes} pendentes de ${alarmes.length}</span>
                </div>

            </div>
            <div class="grupo-alarme-conteudo" style="display: none; padding: 10px; border: 1px solid #ccc; border-top: none; border-radius: 0 0 8px 8px; margin-bottom: 20px; background: #fafafa;"></div>
        `;

        const cabecalho = grupo.querySelector(".grupo-alarme-cabecalho");
        const conteudo = grupo.querySelector(".grupo-alarme-conteudo");

        // Lógica de abrir/fechar ao clicar no remédio
        cabecalho.onclick = () => {
            const estaFechado = conteudo.style.display === "none";
            conteudo.style.display = estaFechado ? "block" : "none";
            
            
            cabecalho.style.borderRadius = estaFechado ? "8px 8px 0 0" : "8px";
        };

        // Renderiza a lista de horários DENTRO do card do remédio
        alarmes.forEach(alarme => {
            const div = document.createElement("div");
            div.className = `alarme ${alarme.tomado ? 'tomado' : ''} ${!alarme.tomado && alarmeAtrasado(alarme.horario) ? 'atrasado' : ''}`;
            
            div.style.padding = "12px";
            div.style.borderBottom = "1px solid #ddd";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.marginBottom = "5px";
            div.style.backgroundColor = alarme.tomado ? "#d4edda" : (alarmeAtrasado(alarme.horario) ? "#f8d7da" : "#fff");
            div.style.borderRadius = "5px";

            div.innerHTML = `
                <div>
                    <strong style="font-size: 1.1em; color: #333;">📅 ${formatarDataHoraAlarme(alarme.horario)}</strong>
                    <span style="margin-left: 10px; font-size: 0.85em; font-weight: bold; color: ${alarme.tomado ? '#28a745' : (alarmeAtrasado(alarme.horario) ? '#dc3545' : '#f39c12')};">
                        ${definirStatusAlarme(alarme)}
                    </span>
                </div>
                <div class="acoes-alarme">
                    ${!alarme.tomado ? `<button class="btnTomado" style="background-color: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">✔ Tomado</button>` : ""}
                    <button class="btnRemoverAlarme" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">✖ Excluir</button>
                </div>
            `;

            if (!alarme.tomado) {
                div.querySelector(".btnTomado").onclick = () => marcarTomado(alarme.id);
            }
            div.querySelector(".btnRemoverAlarme").onclick = () => removerAlarme(alarme.id);

            conteudo.appendChild(div);
        });

        lista.appendChild(grupo);
    }

    async function marcarTomado(id) {
        try {
            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/alarmes/${id}/tomado`), {
                method: "PATCH",
                headers: { "Authorization": "Bearer " + token }
            });
            if (resposta.ok) carregarAlarmes();
        } catch (erro) { console.error(erro); }
    }

    async function removerAlarme(id) {
        try {
            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/alarmes/${id}`), {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            if (resposta.ok) carregarAlarmes();
        } catch (erro) { console.log(erro); }
    }

    function agendarNotificacoes(alarmes) {
        limparTimersAlarmes();
        if (!("Notification" in window) || Notification.permission !== "granted") return;

        const agora = new Date();
        alarmes.forEach(alarme => {
            if (alarme.tomado) return;
            const tempoAteAlarme = new Date(alarme.horario).getTime() - agora.getTime();
            if (tempoAteAlarme < 0 || tempoAteAlarme > 7 * 24 * 60 * 60 * 1000) return;

            const chave = `notificacaoAlarme_${alarme.id}`;
            const timer = setTimeout(() => {
                if (localStorage.getItem(chave)) return;
                const n = new Notification("Hora do medicamento", {
                    body: `${alarme.medicamento?.nome || "Medicamento"}`,
                    tag: `alarme-${alarme.id}`, requireInteraction: true
                });
                n.onclick = () => { window.focus(); carregarPagina("paginas/alarmes.html"); };
                localStorage.setItem(chave, "notificado");
            }, tempoAteAlarme);
            timersAlarmes.push(timer);
        });
    }

    function limparTimersAlarmes() {
        timersAlarmes.forEach(t => clearTimeout(t));
        timersAlarmes = [];
    }

    function alarmeAtrasado(horario) { return new Date(horario) < new Date(); }
    
    function definirStatusAlarme(alarme) {
        if (alarme.tomado) return "Tomado";
        if (alarmeAtrasado(alarme.horario)) return "Atrasado";
        return "Pendente";
    }
    
    function formatarDataHoraAlarme(data) {
        return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    }
}