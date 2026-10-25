const readline = require("node:readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let cont_projetos = 0;
const projetos = [];
let cont_equipes = 0;
const equipes = [];

let id_equipe = 1000;
let cont_id_equipes = 0;
let id_projetos = 2000;
let cont_id_projetos = 0;


function cadastrar_membros(i, quantidade){
    if (i >= quantidade){
        cont_equipes++;
        return;
    }
    rl.question("Nome do membro: ", (membro) =>{
        if (membro.trim() === "") {
            console.log("Erro: nome inválido");
            return cadastrar_membros(i, quantidade);
        }
        equipes[cont_equipes].membros.push(membro);
        i++;
        cadastrar_membros(i, quantidade);
    });
}

function perguntar_quantidade(){
    rl.question("Quantidade de membros da equipe: ", (quantidade_membros) =>{
        if (quantidade_membros.trim() === "") {
                console.log("Erro: quantidade vazia");
                return perguntar_quantidade();
        }
        if (Number(quantidade_membros) >= 0 && Number.isInteger(Number(quantidade_membros))){
            cadastrar_membros(0, Number(quantidade_membros));
        }
        else {
            console.log("Erro: quantidade inválida");
            return perguntar_quantidade();
        }
    });
}

function post_equipes(){
    rl.question("Líder da equipe: ", (lider) => {
        if (lider.trim() === "") {
        console.log("Erro: líder não pode ser vazio!");
        return post_equipes();
        };
        equipes[cont_equipes] = {};
        equipes[cont_equipes].lider = lider;
        equipes[cont_equipes].id = id_equipe + cont_id_equipes;
        cont_id_equipes++;
        equipes[cont_equipes].membros = [];
        perguntar_quantidade();
    });   
}

function get_equipes(){
    if (cont_equipes === 0){
        console.log("Nenhuma equipe cadastrada")
        return;
    }
    for (let i = 0; i < cont_equipes; i++){
        console.log(`Equipe ${i + 1}:`)
        console.log(`ID: ${equipes[i].id}`)
        console.log(`Líder ${equipes[i].lider}`)
        console.log(`Membros: ${equipes[i].membros.join(", ")}\n`)
    }
}

function get_equipes_id(id){
    let indice = encontrar_equipe(id)
    if (indice >= 0){
        console.log(`Equipe ${indice + 1}:`)
        console.log(`ID: ${equipes[indice].id}`)
        console.log(`Líder ${equipes[indice].lider}`)
        console.log(`Membros: ${equipes[indice].membros.join(", ")}\n`)
        return;
    }
    if (indice === -1 || indice === -2){
       console.log("Erro 404: Not Found") 
    }
    
}

function encontrar_equipe(id){
    let indice = -1
    if (cont_equipes === 0){
        console.log("Nenhuma equipe cadastrada")
        indice = -2;
        return indice;
    }
    for (let i = 0; i < cont_equipes; i++){
        if (Number(id) === equipes[i].id){
            indice = i;
            return indice;
        }
    }
    return indice;  
}

function novo_lider(i){
    rl.question("Novo nome do líder: ", (lider) =>{
        if (lider.trim() === "") {
            console.log("Líder não alterado");
            return novo_membros(i);
        }
        equipes[i].lider = lider;
        novo_membros(i);
    });
}

function novo_membros(i){
    rl.question("O que deseja?\n(1)Inserir membro\n(2)Remover membro\n(3)Sair da função", (opcao) =>{
        if (Number(opcao) === 1){
            inserir_membro(i);
        }
        else if (Number(opcao) === 2){
            remover_membro(i);
        }
        else if (Number(opcao) === 3){
            finalizar_atualizacao_equipe();
        }
        else {
            console.log("Opção inválida. Tente novamente\n");
            novo_membros(i);
        }
    });
}

function inserir_membro(i){
    rl.question("Nome do membro: ", (membro) =>{
        if (membro.trim() === "") {
            console.log("Nome inválido.");
            return inserir_membro(i);
        }
        equipes[i].membros.push(membro);
        novo_membros(i);
    });
}

function remover_membro(id){
    if (equipes[id].membros.length === 0){
        console.log("Essa equipe nao possui membros\n");
        return novo_membros(id);
    }
    rl.question("Nome do membro: ", (membro) =>{
        if (membro.trim() === "") {
            console.log("Nome inválido.");
            return remover_membro(id);
        }
        for (let i = 0; i < equipes[id].membros.length; i++){
            if (membro.trim() === equipes[id].membros[i]){
                equipes[id].membros.splice(i, 1);
                return novo_membros(id);
            }
        }
        console.log("Erro 404: Not Found");
        novo_membros(id);
    });
}

function finalizar_atualizacao_equipe(){
    console.log("Equipe atualizada com sucesso!\n")
}

function put_equipes_id(id){
    let indice = encontrar_equipe(id);
    if (indice === -1 || indice === -2){
        console.log("Erro 404: Not Found")
    }
    else if (indice >= 0){
        novo_lider(indice);
    }
}

function delete_equipes_id(){
    rl.question("Digite o ID da equipe que deseja remover: ", (id) =>{
        let indice = encontrar_equipe(Number(id));
        if (indice === -2){
            return;
        }
        else if(indice === -1 || indice === -2){
            console.log("Erro 404: Not Found");
            return delete_equipes_id();
        }
        else {
            equipes.splice(indice, 1);
            cont_equipes--;
            console.log("Equipe removida com sucesso!");
            for (let i = 0; i < cont_projetos; i++){
                if(projetos[i].idEquipe === Number(id)){
                    projetos[i].idEquipe = null;
                    console.log("Equipe removida dos projetos designados");
                }
            }
            return;
        }
    })
}

function cadastrar_nome(){
    rl.question("Nome do projeto: ", (nome) =>{
        if (nome.trim() === "") {
            console.log("Erro: nome inválido");
            return cadastrar_nome();
        }
        projetos[cont_projetos].nome = nome;
        cadastrar_cliente();
    });
}

function cadastrar_cliente(){
    rl.question("Nome do cliente: ", (cliente) =>{
        if (cliente.trim() === "") {
            console.log("Erro: cliente inválido");
            return cadastrar_cliente();
        }
        projetos[cont_projetos].cliente = cliente;
        dataInicio();
    });
}

function idEquipe_projetos(){
    if (cont_equipes === 0){
        console.log("Nenhuma equipe cadastrada");
        projetos[cont_projetos].idEquipe = null;
        finalizar_projeto();
        return;
    }
    rl.question("ID da equipe: ", (id) =>{
        if (id.trim() === "") {
            projetos[cont_projetos].idEquipe = null;
            finalizar_projeto();
            return;
        } 
        for (let i = 0; i < cont_equipes; i++){
            if (Number(id) === equipes[i].id){
                projetos[cont_projetos].idEquipe = Number(id);
                finalizar_projeto();
                return;
            }
        }
        console.log("Erro 404: Not Found");
        return idEquipe_projetos();
    });
} 

function dataValida(data_user){
    let valido = 1
    const data = new Date(data_user);
    const partes = data_user.split("-");

    if (partes.length !== 3) {
        console.log("Formato inválido. Use AAAA-MM-DD.");
        valido = 0;
        return valido; 
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);


    if (
        Number.isNaN(data.getTime()) ||
        data.getUTCFullYear() !== ano ||
        data.getUTCMonth() !== mes - 1 ||
        data.getUTCDate() !== dia
    ) {
        console.log("Data inválida.");
        valido = 0;
        return valido;
    }

    return valido;
}

function dataInicio(){
    rl.question("Data de início (AAAA-MM-DD): ", (data_inicio) => {
        let valido = dataValida(data_inicio)

        if (valido === 0){
            return dataInicio();
        }

        const data = new Date(data_inicio);
        projetos[cont_projetos].dataInicio = data;
        dataEntrega();
    });
}

function dataEntrega(){
    rl.question("Data de entrega (AAAA-MM-DD): ", (data_entrega) => {
        let valido = dataValida(data_entrega)

        if (valido === 0){
            return dataEntrega();
        }
        const data = new Date(data_entrega);
        
        if (projetos[cont_projetos].dataInicio > data){
            console.log("Data de entrega inválida");
            return dataEntrega();
        }

        projetos[cont_projetos].dataEntrega = data;
        idEquipe_projetos();
    });
}

function finalizar_projeto(){
    console.log("Projeto cadastrado com sucesso!");
    cont_projetos++;
}

function post_projetos(){
    projetos[cont_projetos] = {};
    projetos[cont_projetos].id = id_projetos + cont_id_projetos;
    cont_id_projetos++;
    projetos[cont_projetos].status = "nao iniciado";
    cadastrar_nome();
    
}

function get_projetos(){
    if (cont_projetos === 0){
        console.log("Nenhum projeto cadastrado")
        return;
    }
    for (let i = 0; i < cont_projetos; i++){
        console.log(`Projeto ${i + 1}:`);
        console.log(`ID: ${projetos[i].id}`);
        console.log(`Nome: ${projetos[i].nome}`);
        console.log(`Cliente: ${projetos[i].cliente}`);
        console.log(`Data de Início: ${projetos[i].dataInicio.toISOString().split("T")[0]}`);
        console.log(`Data de Entrega: ${projetos[i].dataEntrega.toISOString().split("T")[0]}`);
        console.log(`Status: ${projetos[i].status}`);
        if(projetos[i].idEquipe === null){
            console.log(`ID Equipe: nenhuma equipe designada`);
        }
        else{
           console.log(`ID Equipe: ${projetos[i].idEquipe}`); 
        }
    }
}

function get_projetos_id(id){
    let indice = encontrar_projeto(id);
    
    if (indice === -1||indice === -2){
        console.log("Erro 404: Not Found")
    }
    else if (indice >= 0){
        console.log(`Projeto ${indice + 1}:`);
        console.log(`ID: ${projetos[indice].id}`);
        console.log(`Nome: ${projetos[indice].nome}`);
        console.log(`Cliente: ${projetos[indice].cliente}`);
        console.log(`Data de Início: ${projetos[indice].dataInicio.toISOString().split("T")[0]}`);
        console.log(`Data de Entrega: ${projetos[indice].dataEntrega.toISOString().split("T")[0]}`);
        console.log(`Status: ${projetos[indice].status}`);
        if(projetos[indice].idEquipe === null){
            console.log(`ID Equipe: nenhuma equipe designada`);
        }
        else{
            console.log(`ID Equipe: ${projetos[indice].idEquipe}`); 
        }
        return;
    }
   
}

function encontrar_projeto(id){
    let indice = -1
    if (cont_projetos === 0){
        console.log("Nenhum projeto cadastrado")
        indice = -2;
        return indice;
    }
    for (let i = 0; i < cont_projetos; i++){
        if (Number(id) === projetos[i].id){
            indice = i;
            return indice;
        }
    }
    return indice;  
}

function novo_nome(i){
    rl.question("Novo nome do projeto: ", (nome) =>{
        if (nome.trim() === "") {
            console.log("Nome não alterado");
            return novo_cliente(i);
        }
        projetos[i].nome = nome;
        novo_cliente(i);
    });
}

function novo_cliente(i){
    rl.question("Novo cliente do projeto: ", (cliente) =>{
        if (cliente.trim() === "") {
            console.log("Cliente não alterado");
            return nova_dataInicio(i);
        }
        projetos[i].cliente = cliente;
        nova_dataInicio(i);
    });
}

function nova_dataInicio(i){
    rl.question(" Nova data de início (AAAA-MM-DD): ", (nova_data_inicio) => {
        if (nova_data_inicio.trim() === "") {
            console.log("Data não alterada");
            return nova_dataEntrega(i);
        }
        let valido = dataValida(nova_data_inicio)

        if (valido === 0){
            return nova_dataInicio(i);
        }
        const data = new Date(nova_data_inicio);
        if (data > projetos[i].dataEntrega){
            console.log("Data de início inválida");
            return nova_dataInicio(i);
        }
        projetos[i].dataInicio = data;
        nova_dataEntrega(i);
    });
}

function nova_dataEntrega(i){
    rl.question(" Nova data de entrega (AAAA-MM-DD): ", (nova_data_entrega) => {
        if (nova_data_entrega.trim() === "") {
            console.log("Data não alterada");
            return novo_idEquipe(i);
        }
        let valido = dataValida(nova_data_entrega)

        if (valido === 0){
            return nova_dataEntrega(i);
        }
        const data = new Date(nova_data_entrega);
        if (projetos[i].dataInicio > data){
            console.log("Data de entrega inválida")
            return nova_dataEntrega(i);
        }
        projetos[i].dataEntrega = data;
        novo_idEquipe(i);
    });
}

function alterar_idEquipe(i){
    if (cont_equipes === 0){
        console.log("Nenhuma equipe cadastrada");
        console.log("Equipe não alterada");
        return novo_status(i);
    }
    rl.question("ID da equipe: ", (id) =>{
        if (id.trim() === "") {
            console.log("Equipe não alterada")
            return novo_status(i);
        } 
        for (let j = 0; j < cont_equipes; j++){
            if (Number(id) === equipes[j].id){
                projetos[i].idEquipe = Number(id);
                return novo_status(i);
            }
        }
        console.log("Erro 404: Not Found");
        return alterar_idEquipe(i);
    });
}

function remover_idEquipe(i){
    projetos[i].idEquipe = null;
    return novo_status(i);
}

function novo_idEquipe(i){
    rl.question("O que deseja?\n(1)Alterar equipe\n(2)Remover equipe\n(3)Não alterar", (opcao) =>{
        if (Number(opcao) === 1){
            alterar_idEquipe(i);
        }
        else if (Number(opcao) === 2){
            remover_idEquipe(i);
        }
        else if (Number(opcao) === 3){
            novo_status(i);
        }
        else {
            console.log("Opção inválida. Tente novamente\n");
            novo_idEquipe(i);
        }
    });
}

function novo_status(i){
    rl.question("Qual é o status desejado?\n(1)Não iniciado\n(2)Em andamento\n(3)Concluido", (progresso) => {
        if (Number(progresso) === 1){
            projetos[i].status = "nao iniciado";
            console.log("Status alterado");
            return finalizar_atualizacao_projeto();
        }
        else if (Number(progresso) === 2){
            projetos[i].status = "em andamento";
            console.log("Status alterado");
            return finalizar_atualizacao_projeto();
        }
        else if (Number(progresso) === 3){
            projetos[i].status = "concluido";
            console.log("Status alterado");
            return finalizar_atualizacao_projeto();
        }
        else if (Number(progresso) === 0){
            console.log("Status não alterado");
            return finalizar_atualizacao_projeto();
        }
        else {
            console.log("Opção inválida");
            console.log("Status não alterado");
            return novo_status(i);
        }

    })
}

function finalizar_atualizacao_projeto(){
    console.log("Projeto atualizado com sucesso!");
}

function put_projetos_id(id){
        let indice = encontrar_projeto(id);
        if (indice === -1 || indice === -2){
            console.log("Erro 404: Not Found")
        }
        else if (indice >= 0){
            novo_nome(indice);
        }
}

function delete_projetos_id(){
    rl.question("Digite o ID do projeto que deseja remover: ", (id) =>{
        let indice = encontrar_projeto(Number(id));
        if (indice === -2){
            return;
        }
        else if(indice === -1 || indice === -2){
            console.log("Erro 404: Not Found");
            return delete_projetos_id();
        }
        else {
            projetos.splice(indice, 1);
            cont_projetos--;
            console.log("Projeto removido com sucesso!");
            return;
        }
    })
}
