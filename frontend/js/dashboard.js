/* dashboard.js - Versão corrigida e unificada */

function iniciarDashboard() {
    const token = localStorage.getItem("token");
    if (!token) return;

    carregarMedicamentos();
    carregarSintomas();
    carregarConsultas();
    iniciarCalendarioDashboard();

    async function carregarMedicamentos() {
        try {
            const res = await fetch(montarUrlComPaciente("http://localhost:8085/medicamentos"), { headers: { "Authorization": "Bearer " + token } });
            if (!res.ok) return;
            const meds = await res.json();
            document.getElementById("qtdMedicamentos").textContent = meds.filter(m => m.ativo !== false).length;
        } catch (e) { console.log(e); }
    }

    async function carregarSintomas() {
        try {
            const res = await fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), { headers: { "Authorization": "Bearer " + token } });
            if (!res.ok) return;
            const sint = await res.json();
            document.getElementById("qtdSintomas").textContent = sint.length;
        } catch (e) { console.log(e); }
    }

    async function carregarConsultas() {
        try {
            const res = await fetch(montarUrlComPaciente("http://localhost:8085/consultas"), { headers: { "Authorization": "Bearer " + token } });
            if (!res.ok) return;
            const cons = await res.json();
            document.getElementById("qtdConsultas").textContent = cons.length;
        } catch (e) { console.log(e); }
    }
}

function iniciarCalendarioDashboard() {
    const token = localStorage.getItem("token");
    const grid = document.getElementById("gridCalendario");
    const titulo = document.getElementById("tituloCalendario");
    if (!grid || !titulo) return;

    let dataAtual = new Date();
    let consultas = [], sintomas = [], medicamentos = [];

    carregarEventos();

    document.getElementById("btnMesAnterior").onclick = () => { dataAtual.setMonth(dataAtual.getMonth() - 1); renderizarCalendario(); };
    document.getElementById("btnProximoMes").onclick = () => { dataAtual.setMonth(dataAtual.getMonth() + 1); renderizarCalendario(); };

    async function carregarEventos() {
        try {
            const res = await Promise.all([
                fetch(montarUrlComPaciente("http://localhost:8085/consultas"), { headers: { "Authorization": "Bearer " + token } }),
                fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), { headers: { "Authorization": "Bearer " + token } }),
                fetch(montarUrlComPaciente("http://localhost:8085/medicamentos"), { headers: { "Authorization": "Bearer " + token } })
            ]);
            consultas = await res[0].json();
            sintomas = await res[1].json();
            medicamentos = await res[2].json();
            renderizarCalendario();
        } catch (e) { console.log(e); }
    }

    function renderizarCalendario() {
        grid.innerHTML = "";
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        
        titulo.textContent = primeiroDia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        for (let i = 0; i < primeiroDia.getDay(); i++) {
            grid.appendChild(document.createElement("div")).classList.add("dia-vazio");
        }

        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const dataTexto = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const divDia = document.createElement("div");
            divDia.classList.add("dia-calendario");
            divDia.onclick = () => abrirResumoDoDia(dataTexto);
            
            divDia.innerHTML = `<div class="numero-dia">${dia}</div>`;

            consultas.filter(c => c.dataHora?.startsWith(dataTexto)).forEach(c => {
                const ev = criarEvento(divDia, `🩺 ${c.medico}`, "evento-consulta");
                ev.onclick = (e) => { e.stopPropagation(); abrirDetalhes('CONSULTA', c); };
            });

            sintomas.filter(s => s.dataHoraRegistro?.startsWith(dataTexto)).forEach(s => {
                const ev = criarEvento(divDia, `⚠ ${s.qualidade}`, "evento-sintoma");
                ev.onclick = (e) => { e.stopPropagation(); abrirDetalhes('SINTOMA', s); };
            });

            grid.appendChild(divDia);
        }
    }

    function criarEvento(container, texto, classe) {
        const div = document.createElement("div");
        div.className = `evento-calendario ${classe}`;
        div.textContent = texto;
        container.appendChild(div);
        return div;
    }

    // Função interna para acessar os dados locais
    window.abrirResumoDoDia = function(dataTexto) {
        const modal = document.getElementById("modalResumo");
        const lista = document.getElementById("listaResumo");
        const tituloModal = document.getElementById("tituloModal");

        if (!modal || !lista || !tituloModal) return;

        const eventosDoDia = [
            ...consultas.filter(c => c.dataHora?.startsWith(dataTexto)).map(c => ({ 
                ...c, tipo: 'CONSULTA', nome: `Consulta: ${c.medico}`, hora: c.dataHora?.split('T')[1]?.substring(0, 5) || "00:00" 
            })),
            ...sintomas.filter(s => s.dataHoraRegistro?.startsWith(dataTexto)).map(s => ({ 
                ...s, tipo: 'SINTOMA', nome: `Sintoma: ${s.qualidade}`, hora: s.dataHoraRegistro?.split('T')[1]?.substring(0, 5) || "00:00" 
            }))
        ].sort((a, b) => a.hora.localeCompare(b.hora));

        tituloModal.textContent = `Eventos de ${dataTexto.split('-').reverse().join('/')}`;
        
        lista.innerHTML = eventosDoDia.length > 0 
            ? eventosDoDia.map(ev => `
                <div class="item-resumo" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="abrirDetalhes('${ev.tipo}', {id: '${ev.id}'})">
                    <div style="font-weight: bold;">${ev.nome}</div>
                    <div style="font-size: 0.85em; color: #666;">Horário: ${ev.hora}</div>
                </div>
            `).join('')
            : `<p style="text-align: center; color: #999;">Nenhum evento registrado.</p>`;

        modal.style.display = "block";
    }
}

function abrirDetalhes(tipo, obj) {
    const paginas = { 'SINTOMA': 'paginas/sintomas.html', 'CONSULTA': 'paginas/consultas.html' };
    carregarPagina(`${paginas[tipo]}?id=${obj.id}`);
}