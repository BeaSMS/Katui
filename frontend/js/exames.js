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