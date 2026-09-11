document.getElementById('btnCadastrar').addEventListener('click', async (event) => {
    event.preventDefault();

    const nomeClinica = document.getElementById('nomeClinica').value;
    const cnpj = document.getElementById('cnpj').value;
    const usuario = document.getElementById('usuario').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // tipo = 1 MASTER || tipo = 2 USUARIO NORMAL
    const tipo = 1

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    const API_URL = 'http://localhost:5000';

    try {
        // Cadastra a Clínica
        const resClinica = await fetch(`${API_URL}/clinicas/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nomeClinica, cnpj: cnpj })
        });

        const dataClinica = await resClinica.json();

        if (!resClinica.ok) {
            // mensagem  do express-validator ou controller
            const msg = dataClinica.message || (dataClinica.errors && dataClinica.errors[0]?.msg) || JSON.stringify(dataClinica);
            throw new Error(`Erro na Clínica: ${msg}`);
        }

        // Cadastra o Usuário
        const resUser = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: usuario,
                email: email,
                senha: senha,
                tipo: tipo,
                clinica_cnpj: cnpj
            })
        });

        const dataUser = await resUser.json();

        if (!resUser.ok) {
            // mensagem do express-validator ou controller
            const msg = dataUser.message || (dataUser.errors && dataUser.errors[0]?.msg) || JSON.stringify(dataUser);
            throw new Error(`Erro no Usuário: ${msg}`);
        }

        alert('Clínica e Usuário cadastrados com sucesso!');
        window.location.href = '../views/indexs.html';

    } catch (error) {
        console.error('Detalhes do Erro:', error);
        alert(error.message);
    }
});