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

    const lista = document.getElementById("listaConsultas");
    const btn = document.getElementById("btnAddConsulta");

    if (!btn) return;

    btn.onclick = () => {

        const data = document.getElementById("dataConsulta").value;
        const medico = document.getElementById("medicoConsulta").value;
        const esp = document.getElementById("espConsulta").value;

        if (!data || !medico || !esp) {
            alert("Preencha tudo!");
            return;
        }

        const div = document.createElement("div");
        div.classList.add("consulta");

        div.innerHTML = `
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Médico:</strong> ${medico}</p>
            <p><strong>Especialidade:</strong> ${esp}</p>
            <button class="remover">Remover</button>
        `;

        div.querySelector(".remover").onclick = () => {
            div.remove();
        };

        lista.appendChild(div);

        // limpa inputs
        document.getElementById("dataConsulta").value = "";
        document.getElementById("medicoConsulta").value = "";
        document.getElementById("espConsulta").value = "";
    };
}

/* funcao exames */
function iniciarExames() {

    const lista = document.getElementById("listaExames");
    const btn = document.getElementById("btnAddExame");

    if (!btn) return;

    btn.onclick = () => {

        const nome = document.getElementById("nomeExame").value;
        const data = document.getElementById("dataExame").value;
        const resultado = document.getElementById("resultadoExame").value;

        if (!nome || !data || !resultado) {
            alert("Preencha todos os campos!");
            return;
        }

        const div = document.createElement("div");
        div.classList.add("exame");

        div.innerHTML = `
            <p><strong>Exame:</strong> ${nome}</p>
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Resultado:</strong> ${resultado}</p>
            <button class="remover">Remover</button>
        `;

        div.querySelector(".remover").onclick = () => {
            div.remove();
        };

        lista.appendChild(div);

        // limpar campos
        document.getElementById("nomeExame").value = "";
        document.getElementById("dataExame").value = "";
        document.getElementById("resultadoExame").value = "";
    };
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