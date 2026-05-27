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

    // --- LÓGICA DO BOTÃO DE NOTIFICAÇÃO ---
    const btnNotif = document.getElementById("btnAtivarNotificacao");
    const statusNotif = document.getElementById("statusNotificacao");

    function atualizarStatusNotificacao() {
        if (!("Notification" in window)) {
            statusNotif.textContent = "Seu navegador não suporta notificações.";
            btnNotif.style.display = "none";
            return;
        }
        if (Notification.permission === "granted") {
            statusNotif.textContent = "Notificações ativadas!";
            btnNotif.style.display = "none";
        } else if (Notification.permission === "denied") {
            statusNotif.textContent = "Notificações bloqueadas. Clique no cadeado na barra de endereço do navegador para permitir.";
            btnNotif.style.display = "none";
        } else {
            statusNotif.textContent = "Permissão pendente. Clique no botão para ativar.";
            btnNotif.style.display = "block";
        }
    }

atualizarStatusNotificacao();

btnNotif.addEventListener("click", async () => {
    const permissao = await Notification.requestPermission();
    atualizarStatusNotificacao();
    if (permissao === "granted") {
        new Notification("Katu'I", { body: "Notificações ativadas com sucesso! 🎉" });
    }
});

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

            // --- SEPARAÇÃO DE LÓGICA ---
            const alarmesMedicamentos = alarmes.filter(a => a.medicamento != null);
            const lembretesManuais = alarmes.filter(a => a.medicamento == null);

            // 1. Processar Alarmes de Medicamentos (Com Sanfona)
            if (alarmesMedicamentos.length > 0) {
                const alarmesPorRemedio = {};
                alarmesMedicamentos.forEach(alarme => {
                    const nomeMed = alarme.medicamento.nome;
                    if (!alarmesPorRemedio[nomeMed]) alarmesPorRemedio[nomeMed] = [];
                    alarmesPorRemedio[nomeMed].push(alarme);
                });

                for (const nomeMed in alarmesPorRemedio) {
                    let alarmesDoMed = alarmesPorRemedio[nomeMed];

                    // REGRA NOVA 2: Ocultar o card se TODOS os alarmes do remédio já foram tomados
                    const todosTomados = alarmesDoMed.every(alarme => alarme.tomado === true);
                    if (todosTomados) {
                        continue; // Ignora o remédio e não renderiza ele na tela
                    }

                    // REGRA NOVA 1: Doses tomadas vão pro final da fila
                    alarmesDoMed.sort((a, b) => {
                        // Se "a" foi tomado e "b" não, "a" vai pro final (retorna 1)
                        if (a.tomado && !b.tomado) return 1;
                        // Se "b" foi tomado e "a" não, "a" sobe na fila (retorna -1)
                        if (!a.tomado && b.tomado) return -1;
                        
                        // Desempate cronológico
                        return new Date(a.horario) - new Date(b.horario);
                    });

                    criarGrupoRemedio(nomeMed, alarmesDoMed);
                }
            }

            // 2. Processar Lembretes Avulsos (Sem Sanfona)
            if (lembretesManuais.length > 0) {
                if (alarmesMedicamentos.length > 0) {
                    const divisor = document.createElement("h3");
                    divisor.style.marginTop = "30px";
                    divisor.style.color = "var(--cor-principal)";
                    divisor.textContent = "Outros Lembretes";
                    lista.appendChild(divisor);
                }

                // Ordena e cria os cards individuais
                lembretesManuais.sort((a, b) => new Date(a.horario) - new Date(b.horario)).forEach(lembrete => {
                    criarCardLembreteIndividual(lembrete);
                });
            }

            agendarNotificacoes(alarmes);

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    window.salvarLembreteManual = async function() {
        const nome = document.getElementById("nomeLembrete").value;
        const horario = document.getElementById("dataHoraLembrete").value;

        if (!nome || !horario) {
            alert("Por favor, preencha o nome e o horário do lembrete!");
            return;
        }

        try {
            const url = montarUrlComPaciente("http://localhost:8085/alarmes/lembrete"); 

            const resposta = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    titulo: nome, // CORREÇÃO: Enviando o valor da variável 'nome' para a propriedade 'titulo' que o Java espera
                    horario: horario
                })
            });

            if (!resposta.ok) {
                throw new Error("Falha ao salvar no banco de dados.");
            }

            alert("Lembrete salv com sucesso!");
            
            // Limpa os campos após salvar
            document.getElementById("nomeLembrete").value = "";
            document.getElementById("dataHoraLembrete").value = "";
            
            // Recarrega a tela para exibir o novo alarme imediatamente
            carregarAlarmes();

        } catch (erro) {
            console.error("Erro ao salvar lembrete:", erro);
            alert("Erro ao conectar com o backend. Verifique o console.");
        }
    };
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

    function criarCardLembreteIndividual(alarme) {
        const div = document.createElement("div");
        div.className = `alarme ${alarme.tomado ? 'tomado' : ''} ${!alarme.tomado && alarmeAtrasado(alarme.horario) ? 'atrasado' : ''}`;
        
        div.style.padding = "18px";
        div.style.border = "1px solid var(--cor-borda)";
        div.style.borderLeft = alarme.tomado ? "6px solid var(--cor-sucesso)" : (alarmeAtrasado(alarme.horario) ? "6px solid var(--cor-erro)" : "6px solid var(--cor-alerta)");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.marginBottom = "15px";
        div.style.backgroundColor = alarme.tomado ? "#eefaf2" : (alarmeAtrasado(alarme.horario) ? "#fff5f5" : "var(--cor-card)");
        div.style.borderRadius = "12px";
        div.style.boxShadow = "var(--sombra-card)";

        div.innerHTML = `
            <div>
                <h3 style="margin: 0 0 5px 0; color: var(--cor-principal); font-size: 1.2em;">📌 ${alarme.titulo || 'Lembrete'}</h3>
                <span style="color: var(--cor-texto-claro); font-size: 0.95em;">📅 ${formatarDataHoraAlarme(alarme.horario)}</span>
                <span style="margin-left: 10px; font-size: 0.85em; font-weight: bold; color: ${alarme.tomado ? '#1e8449' : (alarmeAtrasado(alarme.horario) ? '#c0392b' : '#856404')}; background: ${alarme.tomado ? '#d4edda' : (alarmeAtrasado(alarme.horario) ? '#f8d7da' : '#fff3cd')}; padding: 4px 8px; border-radius: 12px;">
                    ${definirStatusAlarme(alarme, true)}
                </span>
            </div>
            <div class="acoes-alarme" style="margin-top: 0;">
                ${!alarme.tomado ? `<button class="btnTomado" style="background-color: var(--cor-sucesso); color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: bold;">✔ Resolvido</button>` : ""}
                <button class="btnRemoverAlarme" style="background-color: var(--cor-erro); color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: bold;">✖ Excluir</button>
            </div>
        `;

        if (!alarme.tomado) {
            // Reaproveita a mesma rota de API, pois no banco a coluna chama "tomado" (booleano)
            div.querySelector(".btnTomado").onclick = () => marcarTomado(alarme.id);
        }
        div.querySelector(".btnRemoverAlarme").onclick = () => removerAlarme(alarme.id);

        lista.appendChild(div);
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
    
    function definirStatusAlarme(alarme, isLembreteAvulso = false) {
        if (alarme.tomado) return isLembreteAvulso ? "Resolvido" : "Tomado";
        if (alarmeAtrasado(alarme.horario)) return "Atrasado";
        return "Pendente";
    }
    
    function formatarDataHoraAlarme(data) {
        return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    }
}