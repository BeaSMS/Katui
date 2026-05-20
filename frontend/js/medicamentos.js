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