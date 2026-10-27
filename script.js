
const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");

const titulo = document.getElementById("titulo");
const subtitulo = document.getElementById("subtitulo");
const mensagem = document.getElementById("mensagem");

const emailLogin = document.getElementById("emailLogin");
const senhaLogin = document.getElementById("senhaLogin");
const emailCadastro = document.getElementById("emailCadastro");
const senhaCadastro = document.getElementById("senhaCadastro");
const botaoLogin = document.getElementById("botaoLogin");

const LIMITE_TENTATIVAS = 6;
const CHAVE_CONTAS = "pinkLoginContas";
const CHAVE_TENTATIVAS = "pinkLoginTentativas";
const CHAVE_BLOQUEIO = "pinkLoginBloqueado";

function carregarContas() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_CONTAS) || "[]"
        );

        if (!Array.isArray(dados)) return [];

        return dados.filter(
            conta =>
                conta &&
                typeof conta.email === "string" &&
                typeof conta.senha === "string"
        );
    } catch {
        return [];
    }
}

let contas = carregarContas();
let tentativas =
    Number(sessionStorage.getItem(CHAVE_TENTATIVAS)) || 0;

let bloqueado =
    sessionStorage.getItem(CHAVE_BLOQUEIO) === "true";

if (!Number.isInteger(tentativas) || tentativas < 0) {
    tentativas = 0;
}

if (tentativas >= LIMITE_TENTATIVAS) {
    bloqueado = true;
}

function salvarContas() {
    try {
        localStorage.setItem(
            CHAVE_CONTAS,
            JSON.stringify(contas)
        );
        return true;
    } catch {
        mostrarMensagem(
            "Não foi possível salvar a conta neste navegador.",
            "erro"
        );
        return false;
    }
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "mensagem";
}

function emailValido(email) {
    return /^[^\s@]+@gmail\.com$/i.test(email);
}

function mostrarLogin(email = "") {
    formCadastro.hidden = true;
    formLogin.hidden = false;

    titulo.textContent = "Bem-vinda de volta.";
    subtitulo.textContent =
        "Entre para descobrir seu universo exclusivo.";

    emailLogin.value = email;
    senhaLogin.value = "";

    limparMensagem();
    atualizarBloqueio();
}

function mostrarCadastro() {
    formLogin.hidden = true;
    formCadastro.hidden = false;

    titulo.textContent = "Faça parte da maison.";
    subtitulo.textContent =
        "Crie sua conta e descubra uma nova forma de elegância.";

    emailCadastro.value = "";
    senhaCadastro.value = "";

    limparMensagem();
}

function atualizarBloqueio() {
    botaoLogin.disabled = bloqueado;
    emailLogin.disabled = bloqueado;
    senhaLogin.disabled = bloqueado;

    if (bloqueado) {
        mostrarMensagem(
            "Acesso bloqueado após 6 tentativas incorretas. " +
            "Este é um bloqueio demonstrativo do navegador.",
            "erro"
        );
    }
}

// Navegação entre login e cadastro.

document.getElementById("irCadastro").addEventListener(
    "click",
    event => {
        event.preventDefault();
        mostrarCadastro();
    }
);

document.getElementById("irLogin").addEventListener(
    "click",
    event => {
        event.preventDefault();
        mostrarLogin();
    }
);

// Cadastro de novas contas.

formCadastro.addEventListener("submit", event => {
    event.preventDefault();
    limparMensagem();

    const email = emailCadastro.value.trim().toLowerCase();
    const senha = senhaCadastro.value;

    if (!emailValido(email)) {
        mostrarMensagem(
            "E-mail inválido. Utilize um endereço terminado em @gmail.com.",
            "erro"
        );
        return;
    }

    if (senha.length < 6 || senha.length > 8) {
        mostrarMensagem(
            "Sua senha deve conter de 6 a 8 caracteres.",
            "erro"
        );
        return;
    }

    const emailExiste = contas.some(
        conta => conta.email === email
    );

    if (emailExiste) {
        mostrarMensagem(
            "Este e-mail já possui um cadastro. Utilize outro.",
            "erro"
        );
        return;
    }

    contas.push({ email, senha });

    if (!salvarContas()) {
        contas.pop();
        return;
    }

    mostrarLogin(email);

    mostrarMensagem(
        "Conta criada com sucesso. Faça login para continuar.",
        "sucesso"
    );
});

// Validação do login.

formLogin.addEventListener("submit", event => {
    event.preventDefault();

    if (bloqueado) {
        atualizarBloqueio();
        return;
    }

    limparMensagem();

    const email = emailLogin.value.trim().toLowerCase();
    const senha = senhaLogin.value;

    if (!emailValido(email)) {
        mostrarMensagem(
            "E-mail inválido. O endereço deve terminar em @gmail.com.",
            "erro"
        );
        return;
    }

    if (senha.length < 6 || senha.length > 8) {
        mostrarMensagem(
            "A senha precisa ter entre 6 e 8 caracteres.",
            "erro"
        );
        return;
    }

    const conta = contas.find(
        item => item.email === email && item.senha === senha
    );

    if (conta) {
        tentativas = 0;

        sessionStorage.removeItem(CHAVE_TENTATIVAS);
        sessionStorage.removeItem(CHAVE_BLOQUEIO);

        senhaLogin.value = "";

        mostrarMensagem(
            "Login realizado com sucesso. Bem-vinda à BIBI.",
            "sucesso"
        );
        return;
    }

    tentativas++;

    sessionStorage.setItem(
        CHAVE_TENTATIVAS,
        String(tentativas)
    );

    senhaLogin.value = "";

    const restantes = LIMITE_TENTATIVAS - tentativas;

    if (restantes <= 0) {
        bloqueado = true;

        sessionStorage.setItem(CHAVE_BLOQUEIO, "true");

        atualizarBloqueio();

        mostrarMensagem(
            "Acesso bloqueado após 6 tentativas incorretas.",
            "erro"
        );
        return;
    }

    mostrarMensagem(
        `E-mail ou senha incorretos. Restam ${restantes} ` +
        (restantes === 1 ? "tentativa." : "tentativas."),
        "erro"
    );
});

atualizarBloqueio();
