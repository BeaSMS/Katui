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