/*Menu e Rodapé*/

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

        carregarPagina('paginas/dashboard.html');

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

        const usuarioAtualizado = {
            nome: inputNome.value,
            telefone: inputTelefone.value,
            altura: Number(inputAltura.value),
            peso: Number(inputPeso.value),
            alergias: inputAlergias.value
        };

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

    async function carregarMedicamentos() {

        try {

            const resposta = await fetch(
                "http://localhost:8085/medicamentos",
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
                "http://localhost:8085/sintomas",
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

    // consultas ainda fake por enquanto
    document.getElementById("qtdConsultas").textContent = "0";
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

            const resposta = await fetch("http://localhost:8085/consultas", {
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

            const resposta = await fetch("http://localhost:8085/consultas", {
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

            const resposta = await fetch(`http://localhost:8085/consultas/${id}`, {
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

            const resposta = await fetch("http://localhost:8085/exames", {
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

            const resposta = await fetch("http://localhost:8085/exames", {
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

            const resposta = await fetch(`http://localhost:8085/exames/${id}/download`, {
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

            const resposta = await fetch(`http://localhost:8085/exames/${id}`, {
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
        const horario = document.getElementById("horarioMed").value;
        const tipo = document.getElementById("tipoFreq").value;
        const valor = document.getElementById("valorFreq").value;

        if (!nome || !horario || !tipo) {
            alert("Preencha nome, horário e tipo!");
            return;
        }

        const medicamento = {
            nome: nome,
            horario: horario,
            tipoFrequencia: tipo,
            valorFrequencia: valor ? Number(valor) : null
        };

        try {

            const resposta = await fetch("http://localhost:8085/medicamentos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamento)
            });

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

            const resposta = await fetch("http://localhost:8085/medicamentos", {
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

                div.innerHTML = `
                    <p><strong>Medicamento:</strong> ${med.nome}</p>
                    <p><strong>Horário:</strong> ${med.horario}</p>
                    <p><strong>Frequência:</strong> ${formatarFrequencia(med.tipoFrequencia, med.valorFrequencia)}</p>

                    <button class="tomar">Tomado</button>
                    <button class="remover">Remover</button>
                `;

                div.querySelector(".tomar").onclick = () => {
                    div.classList.toggle("tomado");
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

    async function removerMedicamento(id) {

        try {

            const resposta = await fetch(`http://localhost:8085/medicamentos/${id}`, {
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
        document.getElementById("horarioMed").value = "";
        document.getElementById("tipoFreq").value = "";
        document.getElementById("valorFreq").value = "";
    }

    function formatarFrequencia(tipo, valor) {

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

        const descricao = document.getElementById("descSintoma").value;
        const categoria = document.getElementById("categoriaSintoma").value;
        const intensidade = document.getElementById("nivelSintoma").value;
        const data = document.getElementById("dataSintoma").value;
        const tipo = document.getElementById("tipoSintoma").value;

        if (!descricao || !categoria || !intensidade || !data || !tipo) {
            alert("Preencha todos os campos!");
            return;
        }

        const sintoma = {
            descricao: descricao,
            categoria: categoria,
            intensidade: intensidade,
            data: data,
            tipo: tipo
        };

        try {

            const resposta = await fetch("http://localhost:8085/sintomas", {
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

            const resposta = await fetch("http://localhost:8085/sintomas", {
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
                div.classList.add("sintoma", s.intensidade);

                div.innerHTML = `
                    <p><strong>Descrição:</strong> ${s.descricao}</p>
                    <p><strong>Categoria:</strong> ${s.categoria}</p>
                    <p><strong>Intensidade:</strong> ${formatarIntensidade(s.intensidade)}</p>
                    <p><strong>Quando ocorreu:</strong> ${formatarData(s.data)}</p>
                    <p><strong>Tipo:</strong> ${s.tipo}</p>
                    ${s.intensidade === "grave" ? '<p class="alerta">⚠️ Sintoma grave!</p>' : ""}
                `;

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function limparCamposSintoma() {
        document.getElementById("descSintoma").value = "";
        document.getElementById("categoriaSintoma").value = "";
        document.getElementById("nivelSintoma").value = "";
        document.getElementById("dataSintoma").value = "";
        document.getElementById("tipoSintoma").value = "";
    }

    function formatarIntensidade(intensidade) {

        if (intensidade === "leve") {
            return "Leve";
        }

        if (intensidade === "medio") {
            return "Médio";
        }

        if (intensidade === "grave") {
            return "Grave";
        }

        return "Não informado";
    }

    function formatarData(data) {

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

            const resposta = await fetch("http://localhost:8085/receitas", {
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

            const resposta = await fetch("http://localhost:8085/receitas", {
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

            const resposta = await fetch(`http://localhost:8085/receitas/${id}/download`, {
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

           const resposta = await fetch(`http://localhost:8085/receitas/${id}/processar`, {
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

                div.innerHTML = `
                    <p><strong>Medicamento:</strong> ${med.nome || "Não identificado"}</p>
                    <p><strong>Frequência:</strong> ${formatarFrequenciaReceita(med.tipoFrequencia, med.valorFrequencia)}</p>
                    <p><strong>Horário inicial:</strong> ${med.horarioInicial || "Não informado"}</p>

                    <button class="btnAddMedicamentoReceita">
                        Adicionar aos Medicamentos
                    </button>
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

            const resposta = await fetch("http://localhost:8085/medicamentos", {
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

            const resposta = await fetch(`http://localhost:8085/receitas/${id}`, {
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