-- CreateTable
CREATE TABLE "Projeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataEntrega" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nao iniciado',
    "idEquipe" INTEGER,
    CONSTRAINT "Projeto_idEquipe_fkey" FOREIGN KEY ("idEquipe") REFERENCES "Equipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
