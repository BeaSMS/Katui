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