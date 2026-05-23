function mostrarToast(mensagem) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = mensagem;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}