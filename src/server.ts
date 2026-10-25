import fastify from "fastify";
import { z } from "zod";
import { prisma } from "./prisma/prisma";

const server = fastify({ //cria servidor
  logger: true
});

const esquemaProjeto = z.object({ //define as restricoes de cada campo
  nome: z.string().trim().min(1, "O nome é obrigatório"),
  cliente: z.string().trim().min(1, "O cliente é obrigatório"),
  dataInicio: z.iso.date(),
  dataEntrega: z.iso.date(),
  idEquipe: z.number().int().positive().nullable().optional()
});

const esquemaAtualizacaoProjeto = z.object({ //define as restricoes para a atualizacao de dados
  nome: z.string().trim().min(1, "O nome é obrigatório").optional(),
  cliente: z.string().trim().min(1, "O cliente é obrigatório").optional(),
  dataInicio: z.iso.date().optional(),
  dataEntrega: z.iso.date().optional(),
  status: z.enum(["nao iniciado", "em andamento", "concluido"]).optional(),
  idEquipe: z.number().int().positive().nullable().optional()
}).refine(
  (dados) => Object.keys(dados).length > 0,
  { message: "Envie pelo menos um campo para atualizar." 

  });

const esquemaEquipe = z.object({ //define restricoes para equipes
  lider: z.string().trim().min(1, "O líder é obrigatório"),
  membros: z.array(
    z.string().trim().min(1, "O nome do membro não pode ser vazio")
  ).optional()
});

const esquemaAtualizacaoEquipe = z.object({ //define restricoes para atualizacao de equipes
  lider: z.string().trim().min(1, "O líder é obrigatório").optional(),
  membros: z.array(
    z.string().trim().min(1, "O nome do membro não pode ser vazio")
  ).optional()
}).refine(
  (dados) => Object.keys(dados).length > 0,
  { message: "Envie pelo menos um campo para atualizar." 

  });

server.post("/projetos", async (request, reply) => { //POST /projetos
  const resultado = esquemaProjeto.safeParse(request.body); //verifica restricoes do projeto

  if (!resultado.success) {
    return reply.code(400).send({ //(bad request) + mensagem
      erro: "Dados inválidos",
      detalhes: resultado.error.issues.map((erro) => ({
        campo: erro.path.join("."),
        mensagem: erro.message
      }))
    });
  }

  try {
    if (resultado.data.idEquipe !== undefined && resultado.data.idEquipe !== null) {
      const equipeExistente = await prisma.equipe.findUnique({ //busca se a equipe informada existe
        where: { id: resultado.data.idEquipe } //chave de busca
      });

      if (equipeExistente === null) {
        return reply.code(400).send({ //(bad request) + mensagem 
          mensagem: "A equipe informada não existe."
        });
      }
    }

    const novoProjeto = await prisma.projeto.create({ //cria o novo projeto
      data: {
        nome: resultado.data.nome,
        cliente: resultado.data.cliente,
        dataInicio: resultado.data.dataInicio,
        dataEntrega: resultado.data.dataEntrega,
        status: "nao iniciado",
        idEquipe: resultado.data.idEquipe ?? null
      }
    });

    return reply.code(201).send(novoProjeto); //(created) + print projeto
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao cadastrar projeto."
    });
  }
});

server.get("/projetos", async (request, reply) => {
  try {
    const projetos = await prisma.projeto.findMany(); //busca todos os projetos no banco de dados

    if (projetos.length === 0) {
      return reply.code(200).send({ //funcao executada(OK) + mensagem
        mensagem: "Nenhum projeto cadastrado."
      });
    }

    return reply.code(200).send(projetos); //funcao executada(OK) + print projetos
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + projetos
      mensagem: "Erro ao buscar projetos."
    });
  }
});

server.get<{ Params: { id: string } }>("/projetos/:id", async (request, reply) => {//GET /projetos/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) { //verifica se id e valido
    return reply.code(400).send({ //(bad request) + mensagem
      mensagem: "O ID informado é inválido."
    });
  }

  try {
    const projetoEncontrado = await prisma.projeto.findUnique({ //busca um unico projeto no banco de dados
      where: { id: id } //chave de busca
    });

    if (projetoEncontrado === null) {
      return reply.code(404).send({ //(not found) + mensagem
        mensagem: "Projeto não encontrado."
      });
    }

    return reply.code(200).send(projetoEncontrado); //funcao executada(OK) + print projeto
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao buscar projeto."
    });
  }
});

server.put<{ Params: { id: string } }>("/projetos/:id", async (request, reply) => { //PUT /projetos/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) { //verifica se o id e valido
    return reply.code(400).send({ //(bad request) + mensagem
      mensagem: "O ID informado é inválido."
    });
  }

  const resultado = esquemaAtualizacaoProjeto.safeParse(request.body); //verifica as restricoes de projeto 

  if (!resultado.success) {
    return reply.code(400).send({ //(bad request) + mensagem
      erro: "Dados inválidos",
      detalhes: resultado.error.issues.map((erro) => ({
        campo: erro.path.join("."),
        mensagem: erro.message
      }))
    });
  }

  try {
    const projetoExistente = await prisma.projeto.findUnique({ //verifica se o projeto existe
      where: { id: id } //chave de busca
    });

    if (projetoExistente === null) {
      return reply.code(404).send({ //(not found) + mensagem
        mensagem: "Projeto não encontrado."
      });
    }

    if (resultado.data.idEquipe !== undefined && resultado.data.idEquipe !== null) {
      const equipeExistente = await prisma.equipe.findUnique({ //verifica se o idEquipe digitado existe
        where: { id: resultado.data.idEquipe } //chave de busca
      });

      if (equipeExistente === null) {
        return reply.code(400).send({ //(bad request) + mensagem
          mensagem: "A equipe informada não existe."
        });
      }
    }

    const dadosAtualizacao: { //restricoes de atualizacao
      nome?: string;
      cliente?: string;
      dataInicio?: string;
      dataEntrega?: string;
      status?: string;
      idEquipe?: number | null;
    } = {};

    if (resultado.data.nome !== undefined) { //atualiza nome
      dadosAtualizacao.nome = resultado.data.nome;
    }

    if (resultado.data.cliente !== undefined) { //atualiza cliente
      dadosAtualizacao.cliente = resultado.data.cliente;
    }

    if (resultado.data.dataInicio !== undefined) { //atualiza data inicio
      dadosAtualizacao.dataInicio = resultado.data.dataInicio;
    }

    if (resultado.data.dataEntrega !== undefined) { // atualiza data entrega
      dadosAtualizacao.dataEntrega = resultado.data.dataEntrega;
    }

    if (resultado.data.status !== undefined) { //atualiza status
      dadosAtualizacao.status = resultado.data.status;
    }

    if (resultado.data.idEquipe !== undefined) { //atualiza idEquipe
      dadosAtualizacao.idEquipe = resultado.data.idEquipe;
    }

    const projetoAtualizado = await prisma.projeto.update({ //atualiza o projeto no banco de dados
      where: { id: id },
      data: dadosAtualizacao
    });

    return reply.code(200).send(projetoAtualizado); //funcao executada(OK) + print projeto
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem 
      mensagem: "Erro ao atualizar projeto."
    });
  }
});

server.delete<{ Params: { id: string } }>("/projetos/:id", async (request, reply) => { //DELETE /projetos/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) { //verifica se o id e valido
    return reply.code(400).send({ //(bad request) + mensagem
      mensagem: "O ID informado é inválido."
    });
  }

  try {
    const projetoExistente = await prisma.projeto.findUnique({ //busca o projeto no banco de dados
      where: { id: id } //chave de busca
    });

    if (projetoExistente === null) {
      return reply.code(404).send({ //(not found) + mensagem
        mensagem: "Projeto não encontrado."
      });
    }

    await prisma.projeto.delete({ //exclui o projeto do banco de dados 
      where: { id: id } //chave de busca
    });

    return reply.code(200).send({ //funcao executada(OK) + mensagem
      mensagem: "Projeto removido com sucesso."
    });
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao remover projeto."
    });
  }
});

server.post("/equipes", async (request, reply) => { //POST /equipes
  const resultado = esquemaEquipe.safeParse(request.body); //verifica restricoes de equipe

  if (!resultado.success) {
    return reply.code(400).send({ //erro (bad request) + mensagem 
      erro: "Dados inválidos",
      detalhes: resultado.error.issues.map((erro) => ({
        campo: erro.path.join("."),
        mensagem: erro.message
      }))
    });
  }

  try {
    const novaEquipe = await prisma.equipe.create({ //cria equipe no banco de dados
      data: {
        lider: resultado.data.lider, //cria lider
        membros: JSON.stringify(resultado.data.membros ?? []) //transforma o array membros em string
      }
    });

    const equipeResposta = { 
      ...novaEquipe, //carrega dados da equipe 
      membros: JSON.parse(novaEquipe.membros) //transforma a string membros em array
    };

    return reply.code(201).send(equipeResposta); // (created) + print equipe
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao cadastrar equipe."
    });
  }
});

server.get("/equipes", async (request, reply) => { //GET /equipes
  try {
    const equipesBanco = await prisma.equipe.findMany(); //pega as equipes do banco de dados

    const equipes = equipesBanco.map((equipe) => ({
      ...equipe, //carrega os dados de cada equipe
      membros: JSON.parse(equipe.membros) //converte o texto de membros para array
    }));

    if (equipes.length === 0) {
      return reply.code(200).send({ //funcao executada(OK) + mensagem
        mensagem: "Nenhuma equipe cadastrada."
      });
    }

    return reply.code(200).send(equipes); //funcao executada(OK) + print equipes
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro na consulta ou na conversão dos membros
      mensagem: "Erro ao buscar equipes."
    });
  }
});

server.get<{ Params: { id: string } }>("/equipes/:id", async (request, reply) => { //GET /equipes/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) { //verifica se o id e valido
    return reply.code(400).send({ //(bad request) + mensagem 
      mensagem: "O ID informado é inválido."
    });
  }

  try {
    const equipeEncontrada = await prisma.equipe.findUnique({ //procura a unica equipee
      where: { id: id } //chave de busca
    });

    if (equipeEncontrada === null) {
      return reply.code(404).send({ //erro (not found) + mensagem
        mensagem: "Equipe não encontrada."
      });
    }

    const equipeResposta = {
      ...equipeEncontrada, //carrega os dados da equipe desejada
      membros: JSON.parse(equipeEncontrada.membros) //converte a string membros em array
    };

    return reply.code(200).send(equipeResposta); //funcao executada(OK) + print equipe
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem 
      mensagem: "Erro ao buscar equipe."
    });
  }
});

server.put<{ Params: { id: string } }>("/equipes/:id", async (request, reply) => { //PUT /equipes/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) { //verifica se o id e valido
    return reply.code(400).send({
      mensagem: "O ID informado é inválido."
    });
  }

  const resultado = esquemaAtualizacaoEquipe.safeParse(request.body); //verifica restricoes de equipe

  if (!resultado.success) {
    return reply.code(400).send({ //(bad request) + mensagem
      erro: "Dados inválidos",
      detalhes: resultado.error.issues.map((erro) => ({
        campo: erro.path.join("."),
        mensagem: erro.message
      }))
    });
  }

  try {
    const equipeExistente = await prisma.equipe.findUnique({ //busca unica equipe
      where: { id: id } //chave de busca
    });

    if (equipeExistente === null) {
      return reply.code(404).send({ //(not found) + mensagem
        mensagem: "Equipe não encontrada."
      });
    }

    const dadosAtualizacao: { //prepara os dados para atualizacao
      lider?: string;
      membros?: string;
    } = {};

    if (resultado.data.lider !== undefined) {
      dadosAtualizacao.lider = resultado.data.lider; //atualiza lider
    }

    if (resultado.data.membros !== undefined) {
      dadosAtualizacao.membros = JSON.stringify(resultado.data.membros); //atualiza membros como string
    }

    const equipeAtualizada = await prisma.equipe.update({ //atualiza os dados no banco
      where: { id: id }, //chave de busca
      data: dadosAtualizacao
    });

    const equipeResposta = {
      ...equipeAtualizada, //carrega dados da equipe atualizada
      membros: JSON.parse(equipeAtualizada.membros) //converte a string membros em array
    };

    return reply.code(200).send(equipeResposta); //funcao executada(OK) + print equipe
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao atualizar equipe."
    });
  }
});

server.delete<{ Params: { id: string } }>("/equipes/:id", async (request, reply) => { //DELETE /equipes/:id
  const id = Number(request.params.id); //id numerico

  if (!Number.isInteger(id) || id <= 0) {
    return reply.code(400).send({ //(bad request) + mensagem
      mensagem: "O ID informado é inválido."
    });
  }

  try {
    const equipeEncontrada = await prisma.equipe.findUnique({ //busca a unica equipe
      where: { id: id } //chave de busca
    });

    if (equipeEncontrada === null) {
      return reply.code(404).send({ //(not found) + mensagem 
        mensagem: "Equipe não encontrada."
      });
    }

    await prisma.projeto.updateMany({ //atualiza os projetos associados a equipe
      where: { idEquipe: id }, //chave de busca
      data: { idEquipe: null } //define a equipe como null
    });

    await prisma.equipe.delete({ //exclui a equipe
      where: { id: id } //chave de busca
    });

    return reply.code(200).send("Equipe removida com sucesso."); //funcao executada(OK) + mensagem
  } catch (erro) {
    console.error(erro);

    return reply.code(500).send({ //erro + mensagem
      mensagem: "Erro ao remover equipe."
    });
  }
});


server.get("/", async () => { //mensagem para api rodando
  return {
    mensagem: "API Gerenciadora de Projetos funcionando!"
  };
});

const iniciarServidor = async () => { //inicia o servidor 
  try {
    await server.listen({ port: 3000 });
  } catch (erro) {
    server.log.error(erro);
    process.exit(1);
  }
}

iniciarServidor();