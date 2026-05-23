/* botao dashboard */
function iniciarDashboard() {

    const token = localStorage.getItem("token");

    if (!token) return;

    carregarMedicamentos();
    carregarSintomas();
    carregarConsultas();
    iniciarCalendarioDashboard();

    async function carregarMedicamentos() {

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/medicamentos"),
                {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) return;

            const medicamentos = await resposta.json();

            const medicamentosAtivos = medicamentos.filter(med => med.ativo !== false);

            document.getElementById("qtdMedicamentos").textContent =
                medicamentosAtivos.length;

        } catch (erro) {
            console.log(erro);
        }
    }

    async function carregarSintomas() {

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/sintomas"),
                {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) return;

            const sintomas = await resposta.json();

            document.getElementById("qtdSintomas").textContent =
                sintomas.length;

        } catch (erro) {
            console.log(erro);
        }
    }

    async function carregarConsultas() {

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/consultas"),
                {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) return;

            const consultas = await resposta.json();

            document.getElementById("qtdConsultas").textContent =
                consultas.length;

        } catch (erro) {
            console.log(erro);
        }
    }
}

function iniciarCalendarioDashboard() {

    const token = localStorage.getItem("token");

    const grid = document.getElementById("gridCalendario");
    const titulo = document.getElementById("tituloCalendario");

    if (!grid || !titulo) return;

    let dataAtual = new Date();

    let consultas = [];
    let sintomas = [];
    let medicamentos = [];

    carregarEventos();

    document.getElementById("btnMesAnterior").onclick = () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    };

    document.getElementById("btnProximoMes").onclick = () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    };

    async function carregarEventos() {

        try {

            const respostas = await Promise.all([

                fetch(
                    montarUrlComPaciente("http://localhost:8085/consultas"),
                    {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    }
                ),

                fetch(
                    montarUrlComPaciente("http://localhost:8085/sintomas"),
                    {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    }
                ),

                fetch(
                    montarUrlComPaciente("http://localhost:8085/medicamentos"),
                    {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    }
                )

            ]);

            consultas = await respostas[0].json();
            sintomas = await respostas[1].json();
            medicamentos = await respostas[2].json();

            renderizarCalendario();

        } catch (erro) {
            console.log(erro);
        }
    }

    function renderizarCalendario() {

        grid.innerHTML = "";

        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);

        const totalDias = ultimoDia.getDate();
        const diaSemanaInicio = primeiroDia.getDay();

        titulo.textContent =
            primeiroDia.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
            });

        for (let i = 0; i < diaSemanaInicio; i++) {

            const vazio = document.createElement("div");
            vazio.classList.add("dia-vazio");

            grid.appendChild(vazio);
        }

        for (let dia = 1; dia <= totalDias; dia++) {

            const divDia = document.createElement("div");
            divDia.classList.add("dia-calendario");

            const numero = document.createElement("div");
            numero.classList.add("numero-dia");
            numero.textContent = dia;

            divDia.appendChild(numero);

            const dataTexto =
                `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

            consultas.forEach(c => {

                if (c.dataHora?.startsWith(dataTexto)) {

                    const evento = document.createElement("div");

                    evento.classList.add(
                        "evento-calendario",
                        "evento-consulta"
                    );

                    evento.textContent =
                        `🩺 ${c.medico}`;

                    divDia.appendChild(evento);
                }
            });

            sintomas.forEach(s => {

                if (s.dataHoraRegistro?.startsWith(dataTexto)) {

                    const evento = document.createElement("div");

                    evento.classList.add(
                        "evento-calendario",
                        "evento-sintoma"
                    );

                    evento.textContent =
                        `⚠ ${s.qualidade}`;

                    divDia.appendChild(evento);
                }
            });

            medicamentos.forEach(m => {

                if (m.ativo === false) {
                    return;
                }

                if (!m.dataInicio) {
                    return;
                }

                const dataDoDia = new Date(dataTexto + "T00:00:00");

                const inicio = new Date(m.dataInicio + "T00:00:00");

                let dentroPeriodo = false;

                if (m.dataFim) {

                    const fim = new Date(m.dataFim + "T00:00:00");

                    dentroPeriodo =
                        dataDoDia >= inicio &&
                        dataDoDia <= fim;

                } else {

                    dentroPeriodo =
                        dataDoDia >= inicio;
                }

                if (!dentroPeriodo) {
                    return;
                }

                let mostrarHoje = false;

                // DIÁRIO
                if (m.tipoFrequencia === "DIARIO") {

                    mostrarHoje = true;
                }

                // INTERVALO EM HORAS
                else if (m.tipoFrequencia === "INTERVALO_HORAS") {

                    mostrarHoje = true;
                }

                // SEMANAL
                else if (m.tipoFrequencia === "SEMANAL") {

                    const diffDias =
                        Math.floor(
                            (dataDoDia - inicio)
                            / (1000 * 60 * 60 * 24)
                        );

                    mostrarHoje = diffDias % 7 === 0;
                }

                // MENSAL
                else if (m.tipoFrequencia === "MENSAL") {

                    mostrarHoje =
                        dataDoDia.getDate() === inicio.getDate();
                }

                if (!mostrarHoje) {
                    return;
                }

                const evento = document.createElement("div");

                evento.classList.add(
                    "evento-calendario",
                    "evento-medicamento"
                );

                evento.textContent =
                    `💊 ${m.nome} ${m.horario || ""}`;

                divDia.appendChild(evento);
            });

            grid.appendChild(divDia);
        }
    }
}