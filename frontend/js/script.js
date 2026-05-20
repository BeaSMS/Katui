/*Menu e Rodapé*/

function voltarInicio() {

    const token = localStorage.getItem("token");
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

    if (!token) {
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {
        carregarPagina('paginas/pacientes.html');
        return;
    }

    carregarPagina('paginas/dashboard.html');
}

document.addEventListener('DOMContentLoaded', () => {

    const conteudo = document.querySelector('.conteudo');

    /*Botão do menu*/
    const botao = document.querySelector('.cabecalhoMenu button');
    const menu = document.querySelector('.cabecalhoMenu');

    if (botao && menu) {
        botao.addEventListener('click', () => {
            menu.classList.toggle('ativo');
        });
    }

    /*Função de carregar as páginas*/
    function carregarPagina(pagina) {

        fetch(pagina)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Página não encontrada: " + pagina);
                }
                return res.text();
            })
        .then(html => {
            conteudo.innerHTML = html;

            mostrarAvisoPacienteSelecionado();

            if (pagina.includes('dashboard')) {
                iniciarDashboard();
            }

            if (pagina.includes('consultas')) {
                iniciarConsultas();
            }

            if (pagina.includes('perfil')) {
                iniciarPerfil();
            }

            if (pagina.includes('exames')) {
                iniciarExames();
            }

            if (pagina.includes('receitas')) {
                iniciarReceitas();
            }

            if (pagina.includes('medicamentos')) {
                iniciarMedicamentos();
            }

            if (pagina.includes('sintomas')) {
                iniciarSintomas();
            }

            if (pagina.includes('pacientes')) {
                iniciarPacientes();
            }
        })
        .catch(err => {
            conteudo.innerHTML = "<p>Erro ao carregar conteúdo</p>";
            console.log(err);
        });
    }

    /*Deixa a função acessível no HTML*/
    window.carregarPagina = carregarPagina;

        const token = localStorage.getItem("token");

    if (token) {

        mostrarMenuSistema();

        const tipoUsuario = localStorage.getItem("tipoUsuario");
        const pacienteSelecionado = localStorage.getItem("pacienteSelecionadoId");

        if (tipoUsuario === "CUIDADOR" && !pacienteSelecionado) {

            carregarPagina('paginas/pacientes.html');

        } else {

            carregarPagina('paginas/dashboard.html');

        }

    } else {

        carregarPagina('paginas/auth/login.html');

    }

});    

async function iniciarPerfil() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    try {

        const resposta = await fetch("http://localhost:8085/usuarios/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resposta.ok) {
            alert("Erro ao carregar perfil");
            return;
        }

        const usuario = await resposta.json();

        document.getElementById("viewNome").textContent = usuario.nome || "";
        document.getElementById("viewEmail").textContent = usuario.email || "";
        document.getElementById("viewTelefone").textContent = usuario.telefone || "";
        document.getElementById("viewAltura").textContent = usuario.altura || "";
        document.getElementById("viewPeso").textContent = usuario.peso || "";
        document.getElementById("viewAlergias").textContent = usuario.alergias || "";
        document.getElementById("viewCategoria").textContent = usuario.tipo || "";

        const areaPaciente =
            document.getElementById("areaDadosPaciente");

        const edicaoDadosPaciente =
            document.getElementById("edicaoDadosPaciente");

        if (usuario.tipo === "CUIDADOR") {

            areaPaciente.style.display = "none";
            edicaoDadosPaciente.style.display = "none";

        } else {

            areaPaciente.style.display = "block";
            edicaoDadosPaciente.style.display = "block";
        }

    } catch (erro) {
        console.log(erro);
        alert("Erro ao conectar com backend");
    }

    const visualizacao = document.getElementById("visualizacao");
    const edicao = document.getElementById("edicao");

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const viewNome = document.getElementById("viewNome");
    const viewTelefone = document.getElementById("viewTelefone");
    const viewAltura = document.getElementById("viewAltura");
    const viewPeso = document.getElementById("viewPeso");
    const viewAlergias = document.getElementById("viewAlergias");

    const inputNome = document.getElementById("nome");
    const inputTelefone = document.getElementById("telefone");
    const inputAltura = document.getElementById("altura");
    const inputPeso = document.getElementById("peso");
    const inputAlergias = document.getElementById("alergias");

    btnEditar.onclick = () => {
        visualizacao.style.display = "none";
        edicao.style.display = "block";

        inputNome.value = viewNome.textContent;
        inputTelefone.value = viewTelefone.textContent;
        inputAltura.value = viewAltura.textContent;
        inputPeso.value = viewPeso.textContent;
        inputAlergias.value = viewAlergias.textContent;
    };

    btnCancelar.onclick = () => {
        edicao.style.display = "none";
        visualizacao.style.display = "block";
    };

    btnSalvar.onclick = async () => {

        let usuarioAtualizado = {
            nome: inputNome.value,
            telefone: inputTelefone.value
        };

        if (localStorage.getItem("tipoUsuario") === "PACIENTE") {

            usuarioAtualizado.altura = Number(inputAltura.value);
            usuarioAtualizado.peso = Number(inputPeso.value);
            usuarioAtualizado.alergias = inputAlergias.value;
        }

        try {

            const resposta = await fetch("http://localhost:8085/usuarios/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(usuarioAtualizado)
            });

            if (!resposta.ok) {
                alert("Erro ao salvar perfil");
                return;
            }

            const usuario = await resposta.json();

            viewNome.textContent = usuario.nome || "";
            viewTelefone.textContent = usuario.telefone || "";
            viewAltura.textContent = usuario.altura || "";
            viewPeso.textContent = usuario.peso || "";
            viewAlergias.textContent = usuario.alergias || "";

            document.getElementById("msg").style.display = "block";

            setTimeout(() => {
                document.getElementById("msg").style.display = "none";
            }, 2000);

            edicao.style.display = "none";
            visualizacao.style.display = "block";

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };
}

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

            document.getElementById("qtdMedicamentos").textContent =
                medicamentos.length;

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

/* funcao exames */
function iniciarExames() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaExames");
    const btn = document.getElementById("btnAddExame");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarExames();

    btn.onclick = async () => {

        const nome = document.getElementById("nomeExame").value;
        const data = document.getElementById("dataExame").value;
        const arquivo = document.getElementById("arquivoExame").files[0];

        if (!nome || !data || !arquivo) {
            alert("Preencha nome, data e arquivo!");
            return;
        }

        const formData = new FormData();

        formData.append("nome", nome);
        formData.append("observacao", `Data do exame: ${data}`);
        formData.append("arquivo", arquivo);

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/exames"), {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });

            if (!resposta.ok) {
                alert("Erro ao salvar exame");
                return;
            }

            limparCamposExame();

            carregarExames();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarExames() {

        lista.innerHTML = "<p>Carregando exames...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/exames"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar exames.</p>";
                return;
            }

            const exames = await resposta.json();

            lista.innerHTML = "";

            if (exames.length === 0) {
                lista.innerHTML = "<p>Nenhum exame cadastrado ainda.</p>";
                return;
            }

            exames.forEach(exame => {

                const div = document.createElement("div");
                div.classList.add("exame");

                div.innerHTML = `
                    <p><strong>Exame:</strong> ${exame.nome}</p>
                    <p><strong>Registro:</strong> ${exame.observacao}</p>

                    <button class="download">
                        Baixar Arquivo
                    </button>

                    <button class="remover">
                        Remover
                    </button>
                `;

                div.querySelector(".download").onclick = () => {
                    baixarExame(exame.id);
                };

                div.querySelector(".remover").onclick = () => {
                    removerExame(exame.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function baixarExame(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/exames/${id}/download`), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao baixar exame");
                return;
            }

            const blob = await resposta.blob();

            const url = window.URL.createObjectURL(blob);

            window.open(url);

        } catch (erro) {
            console.log(erro);
            alert("Erro ao baixar arquivo");
        }
    }

    async function removerExame(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/exames/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao remover exame");
                return;
            }

            carregarExames();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao remover exame");
        }
    }

    function limparCamposExame() {

        document.getElementById("nomeExame").value = "";
        document.getElementById("dataExame").value = "";
        document.getElementById("arquivoExame").value = "";
    }
}

/* funcao medicamentos */
function iniciarMedicamentos() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaMedicamentos");
    const btn = document.getElementById("btnAddMed");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarMedicamentos();

    btn.onclick = async () => {

        const nome = document.getElementById("nomeMed").value;
        const dosagem = document.getElementById("dosagemMed").value;
        const finalidade = document.getElementById("finalidadeMed").value;
        const horario = document.getElementById("horarioMed").value;
        const tipo = document.getElementById("tipoFreq").value;
        const valor = document.getElementById("valorFreq").value;
        const dataInicio = document.getElementById("dataInicioMed").value;
        const dataFim = document.getElementById("dataFimMed").value;
        const observacoes = document.getElementById("obsMed").value;

        if (!nome || !dosagem || !horario || !dataInicio) {
            alert("Preencha nome, dosagem, horário e data de início!");
            return;
        }

        const medicamento = {
            nome: nome,
            dosagem: dosagem,
            finalidade: finalidade,
            horario: horario,
            tipoFrequencia: tipo,
            valorFrequencia: valor ? Number(valor) : null,
            dataInicio: dataInicio,
            dataFim: dataFim || null,
            observacoes: observacoes,
            ativo: true
        };

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/medicamentos"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify(medicamento)
                }
            );

            if (!resposta.ok) {
                alert("Erro ao salvar medicamento");
                return;
            }

            limparCamposMedicamento();
            carregarMedicamentos();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarMedicamentos() {

        lista.innerHTML = "<p>Carregando medicamentos...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/medicamentos"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar medicamentos.</p>";
                return;
            }

            const medicamentos = await resposta.json();

            lista.innerHTML = "";

            if (medicamentos.length === 0) {
                lista.innerHTML = "<p>Nenhum medicamento cadastrado ainda.</p>";
                return;
            }

            medicamentos.forEach(med => {

                const div = document.createElement("div");
                div.classList.add("med");

                const finalizado =
                    med.ativo === false ||
                    (med.dataFim && new Date(med.dataFim + "T00:00:00") < new Date());

                div.innerHTML = `
                    <div class="med-topo">
                        <div>
                            <h3>${med.nome}</h3>
                            <span class="dosagem">${med.dosagem || "Dosagem não informada"}</span>
                        </div>

                        <span class="status-med ${finalizado ? 'finalizado' : 'ativo'}">
                            ${finalizado ? 'Finalizado' : 'Ativo'}
                        </span>
                    </div>

                    <p><strong>Finalidade:</strong> ${med.finalidade || "Não informado"}</p>
                    <p><strong>Horário:</strong> ${med.horario || "Não informado"}</p>
                    <p><strong>Frequência:</strong> ${formatarFrequencia(med.tipoFrequencia, med.valorFrequencia)}</p>
                    <p><strong>Início:</strong> ${formatarDataMed(med.dataInicio)}</p>
                    <p><strong>Término:</strong> ${formatarDataMed(med.dataFim)}</p>
                    <p><strong>Observações:</strong> ${med.observacoes || "Nenhuma"}</p>

                    <div class="acoes-med">
                        <button class="finalizar">Finalizar tratamento</button>
                        <button class="remover">Remover</button>
                    </div>
                `;

                div.querySelector(".finalizar").onclick = () => {
                    finalizarMedicamento(med);
                };

                div.querySelector(".remover").onclick = () => {
                    removerMedicamento(med.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function finalizarMedicamento(med) {

        const medicamentoAtualizado = {
            ...med,
            ativo: false,
            dataFim: med.dataFim || new Date().toISOString().split("T")[0]
        };

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${med.id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamentoAtualizado)
            });

            if (!resposta.ok) {
                alert("Erro ao finalizar tratamento");
                return;
            }

            carregarMedicamentos();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    async function removerMedicamento(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao remover medicamento");
                return;
            }

            carregarMedicamentos();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    function limparCamposMedicamento() {
        document.getElementById("nomeMed").value = "";
        document.getElementById("dosagemMed").value = "";
        document.getElementById("finalidadeMed").value = "";
        document.getElementById("horarioMed").value = "";
        document.getElementById("tipoFreq").value = "";
        document.getElementById("valorFreq").value = "";
        document.getElementById("dataInicioMed").value = "";
        document.getElementById("dataFimMed").value = "";
        document.getElementById("obsMed").value = "";
    }

    function formatarFrequencia(tipo, valor) {

        if (tipo === "DIARIO") {
            return "Diário";
        }

        if (tipo === "INTERVALO_HORAS") {

            if (!valor) {
                return "Intervalo não informado";
            }

            return `A cada ${valor} horas`;
        }

        if (tipo === "SEMANAL") {
            return "Semanal";
        }

        if (tipo === "MENSAL") {
            return "Mensal";
        }

        return "Não informado";
    }
}

function formatarDataMed(data) {

    if (!data) {
        return "Não informado";
    }

    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

function iniciarSintomas() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaSintomas");
    const btn = document.getElementById("btnAddSintoma");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarSintomas();

    btn.onclick = async () => {

        const localizacao = document.getElementById("localSintoma").value;
        const qualidade = document.getElementById("qualidadeSintoma").value;
        const intensidadeEscala = document.getElementById("intensidadeSintoma").value;
        const incapacitante = document.getElementById("incapacitanteSintoma").value;
        const padraoTempo = document.getElementById("padraoTempoSintoma").value;
        const fatoresAssociados = document.getElementById("fatoresSintoma").value;
        const impactoFuncional = document.getElementById("impactoSintoma").value;
        const dataHoraRegistro = document.getElementById("dataHoraSintoma").value;

        if (!localizacao || !qualidade || !intensidadeEscala || !incapacitante || !padraoTempo || !dataHoraRegistro) {
            alert("Preencha localização, qualidade, intensidade, incapacitante, tempo/padrão e data!");
            return;
        }

        const sintoma = {
            localizacao: localizacao,
            qualidade: qualidade,
            intensidadeEscala: Number(intensidadeEscala),
            incapacitante: incapacitante === "true",
            padraoTempo: padraoTempo,
            fatoresAssociados: fatoresAssociados,
            impactoFuncional: impactoFuncional,
            dataHoraRegistro: dataHoraRegistro
        };

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(sintoma)
            });

            if (!resposta.ok) {
                alert("Erro ao salvar sintoma");
                return;
            }

            limparCamposSintoma();

            carregarSintomas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarSintomas() {

        lista.innerHTML = "<p>Carregando sintomas...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar sintomas.</p>";
                return;
            }

            const sintomas = await resposta.json();

            lista.innerHTML = "";

            if (sintomas.length === 0) {
                lista.innerHTML = "<p>Nenhum sintoma cadastrado ainda.</p>";
                return;
            }

            sintomas.forEach(s => {

                const div = document.createElement("div");
                div.classList.add("sintoma");

                if (s.intensidadeEscala >= 8 || s.incapacitante) {
                    div.classList.add("grave");
                } else if (s.intensidadeEscala >= 4) {
                    div.classList.add("medio");
                } else {
                    div.classList.add("leve");
                }

                div.innerHTML = `
                    <p><strong>Localização:</strong> ${s.localizacao || "Não informado"}</p>
                    <p><strong>Tipo / qualidade:</strong> ${s.qualidade || "Não informado"}</p>
                    <p><strong>Intensidade:</strong> ${s.intensidadeEscala ?? "Não informado"}/10</p>
                    <p><strong>Incapacitante:</strong> ${s.incapacitante ? "Sim" : "Não"}</p>
                    <p><strong>Tempo / padrão:</strong> ${s.padraoTempo || "Não informado"}</p>
                    <p><strong>Fatores associados:</strong> ${s.fatoresAssociados || "Não informado"}</p>
                    <p><strong>Impacto funcional:</strong> ${s.impactoFuncional || "Não informado"}</p>
                    <p><strong>Data:</strong> ${formatarDataSintoma(s.dataHoraRegistro)}</p>
                    ${(s.intensidadeEscala >= 8 || s.incapacitante) ? '<p class="alerta">⚠️ Atenção: sintoma intenso ou incapacitante!</p>' : ""}
                `;

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function limparCamposSintoma() {
        document.getElementById("localSintoma").value = "";
        document.getElementById("qualidadeSintoma").value = "";
        document.getElementById("intensidadeSintoma").value = "";
        document.getElementById("incapacitanteSintoma").value = "";
        document.getElementById("padraoTempoSintoma").value = "";
        document.getElementById("fatoresSintoma").value = "";
        document.getElementById("impactoSintoma").value = "";
        document.getElementById("dataHoraSintoma").value = "";
    }

    function formatarDataSintoma(data) {

        if (!data) {
            return "Não informado";
        }

        return new Date(data).toLocaleString();
    }
}

function iniciarReceitas() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaReceitas");
    const btn = document.getElementById("btnAddReceita");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarReceitas();

    btn.onclick = async () => {

        const observacao = document.getElementById("obsReceita").value;
        const arquivo = document.getElementById("arquivoReceita").files[0];

        if (!observacao || !arquivo) {
            alert("Preencha a observação e selecione um arquivo!");
            return;
        }

        const formData = new FormData();

        formData.append("observacao", observacao);
        formData.append("arquivo", arquivo);

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/receitas"), {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });

            if (!resposta.ok) {
                alert("Erro ao salvar receita");
                return;
            }

            limparCamposReceita();

            carregarReceitas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarReceitas() {

        lista.innerHTML = "<p>Carregando receitas...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/receitas"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar receitas.</p>";
                return;
            }

            const receitas = await resposta.json();

            lista.innerHTML = "";

            if (receitas.length === 0) {
                lista.innerHTML = "<p>Nenhuma receita cadastrada ainda.</p>";
                return;
            }

            receitas.forEach(receita => {

                const div = document.createElement("div");
                div.classList.add("receita");

                div.innerHTML = `
                    <p><strong>Observação:</strong> ${receita.observacao}</p>

                    <button class="btnDownloadReceita">
                        Baixar Arquivo
                    </button>

                    <button class="btnProcessarReceita">
                        Processar Receita
                    </button>

                    <button class="btnRemoverReceita">
                        Remover
                    </button>

                    <div class="resultadoReceita"></div>
                `;

                div.querySelector(".btnDownloadReceita").onclick = () => {
                    baixarReceita(receita.id);
                };

                div.querySelector(".btnProcessarReceita").onclick = () => {
                    processarReceita(receita.id, div.querySelector(".resultadoReceita"));
                };

                div.querySelector(".btnRemoverReceita").onclick = () => {
                    removerReceita(receita.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function baixarReceita(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}/download`), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao baixar receita");
                return;
            }

            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);

            window.open(url);

        } catch (erro) {
            console.log(erro);
            alert("Erro ao baixar arquivo");
        }
    }

    async function processarReceita(id, areaResultado) {

        areaResultado.innerHTML = "<p>Processando receita...</p>";

        try {

            console.log("Token usado:", token);

           const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}/processar`), {
            method: "POST",
            headers: {
            "Authorization": "Bearer " + token
        }
    });

            if (!resposta.ok) {
                const erro = await resposta.text();
                console.log("Erro ao processar receita:", erro);
                areaResultado.innerHTML = `<p>Erro ao processar receita: ${erro}</p>`;
                return;
            }

            const medicamentos = await resposta.json();

            areaResultado.innerHTML = "";

            if (medicamentos.length === 0) {
                areaResultado.innerHTML = "<p>Nenhum medicamento identificado.</p>";
                return;
            }

            medicamentos.forEach(med => {

                const div = document.createElement("div");
                div.classList.add("medicamento-extraido");

                const finalizado =
                med.dataFim &&
                new Date(med.dataFim) < new Date();

                div.innerHTML = `

                    <div class="med-topo">

                        <div>
                            <h3>${med.nome}</h3>
                            <span class="dosagem">
                                ${med.dosagem || "Dosagem não informada"}
                            </span>
                        </div>

                        <span class="status-med ${finalizado ? 'finalizado' : 'ativo'}">
                            ${finalizado ? 'Finalizado' : 'Ativo'}
                        </span>

                    </div>

                    <p>
                        <strong>Finalidade:</strong>
                        ${med.finalidade || "Não informado"}
                    </p>

                    <p>
                        <strong>Horário:</strong>
                        ${med.horario || "Não informado"}
                    </p>

                    <p>
                        <strong>Frequência:</strong>
                        ${formatarFrequencia(
                            med.tipoFrequencia,
                            med.valorFrequencia
                        )}
                    </p>

                    <p>
                        <strong>Início:</strong>
                        ${formatarDataMed(med.dataInicio)}
                    </p>

                    <p>
                        <strong>Término:</strong>
                        ${formatarDataMed(med.dataFim)}
                    </p>

                    <p>
                        <strong>Observações:</strong>
                        ${med.observacoes || "Nenhuma"}
                    </p>

                    <div class="acoes-med">

                        <button class="tomar">
                            Tomado
                        </button>

                        <button class="remover">
                            Remover
                        </button>

                    </div>
                `;

                div.querySelector(".btnAddMedicamentoReceita").onclick = () => {
                    adicionarMedicamentoDaReceita(med);
                };

                areaResultado.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            areaResultado.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function adicionarMedicamentoDaReceita(med) {

        if (!med.nome) {
            alert("Medicamento sem nome identificado");
            return;
        }

        const medicamento = {
            nome: med.nome,
            horario: med.horarioInicial || "08:00",
            tipoFrequencia: med.tipoFrequencia || "dias",
            valorFrequencia: med.valorFrequencia || null,
            dias: med.dias || null
        };

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/medicamentos"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamento)
            });

            if (!resposta.ok) {
                alert("Erro ao adicionar medicamento");
                return;
            }

            alert("Medicamento adicionado com sucesso!");

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    async function removerReceita(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao remover receita");
                return;
            }

            carregarReceitas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao remover receita");
        }
    }

    function limparCamposReceita() {

        document.getElementById("obsReceita").value = "";
        document.getElementById("arquivoReceita").value = "";
    }

    function formatarFrequenciaReceita(tipo, valor) {

        if (tipo === "intervalo") {
            return `A cada ${valor} horas`;
        }

        if (tipo === "dias") {
            return `Por ${valor} dias`;
        }

        if (tipo === "semanal") {
            return "Semanal";
        }

        if (tipo === "quinzenal") {
            return "Quinzenal";
        }

        if (tipo === "mensal") {
            return "Mensal";
        }

        return "Não informado";
    }
}

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

function montarUrlComPaciente(urlBase) {

    const tipoUsuario =
        localStorage.getItem("tipoUsuario");

    const pacienteId =
        localStorage.getItem("pacienteSelecionadoId");

    if (
        tipoUsuario === "CUIDADOR"
        && pacienteId
    ) {

        return `${urlBase}?pacienteId=${pacienteId}`;
    }

    return urlBase;
}

function mostrarAvisoPacienteSelecionado() {

    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const nomePaciente = localStorage.getItem("pacienteSelecionadoNome");

    if (tipoUsuario !== "CUIDADOR" || !nomePaciente) {
        return;
    }

    const conteudo = document.querySelector(".conteudo");

    const aviso = document.createElement("div");
    aviso.classList.add("aviso-paciente");

    aviso.innerHTML = `
        Você está acessando os dados de:
        <strong>${nomePaciente}</strong>
    `;

    conteudo.prepend(aviso);
}