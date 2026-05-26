function iniciarAjuda() {
    // Definimos a função globalmente para garantir que o onclick funcione
    window.toggleResposta = function(botao) {
        const resposta = botao.nextElementSibling;
        const icon = botao.querySelector("span");

        const categoria = botao.closest(".categoria-ajuda");
        const outrasRespostas = categoria.querySelectorAll(".faq-resposta");
        const outrosBotoes = categoria.querySelectorAll(".faq-pergunta");

        outrasRespostas.forEach((r, index) => {
            if (r !== resposta) {
                r.style.display = "none";
                outrosBotoes[index].querySelector("span").textContent = "+";
            }
        });

        if (resposta.style.display === "none" || !resposta.style.display) {
            resposta.style.display = "block";
            icon.textContent = "-";
        } else {
            resposta.style.display = "none";
            icon.textContent = "+";
        }
    };

    const buscaInput = document.getElementById("buscaAjuda");

    if (buscaInput) {
        buscaInput.addEventListener("keyup", (e) => {
            const termo = e.target.value.toLowerCase();
            const faqs = document.querySelectorAll(".faq-item");

            faqs.forEach(faq => {
                const pergunta = faq.querySelector(".faq-pergunta").textContent.toLowerCase();
                const resposta = faq.querySelector(".faq-resposta").textContent.toLowerCase();

                if (pergunta.includes(termo) || resposta.includes(termo) || termo === "") {
                    faq.style.display = "block";
                } else {
                    faq.style.display = "none";
                }
            });
        });
    }
}
