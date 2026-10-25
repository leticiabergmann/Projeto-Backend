import { prisma } from "./prisma/prisma";

async function testarConexao() {
  try {
    const totalEquipes = await prisma.equipe.count();

    console.log("Conexão com o banco funcionando!");
    console.log("Quantidade de equipes:", totalEquipes);
  } catch (erro) {
    console.error("Erro ao conectar ao banco:", erro);
  } finally {
    await prisma.$disconnect();
  }
}

testarConexao();