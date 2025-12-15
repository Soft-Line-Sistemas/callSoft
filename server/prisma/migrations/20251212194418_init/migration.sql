-- CreateTable
CREATE TABLE "EMPRESA" (
    "codEmp" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Empresa" TEXT NOT NULL,
    "Razao" TEXT NOT NULL,
    "CGC" TEXT,
    "IE" TEXT,
    "IM" TEXT,
    "cep" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "Tel" TEXT,
    "Tel2" TEXT,
    "cabecalho" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "USUARIO" (
    "codUsu" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Usuario" TEXT NOT NULL,
    "Senha" TEXT NOT NULL,
    "EMail" TEXT,
    "CaminhoFoto" TEXT,
    "Op91" TEXT NOT NULL DEFAULT '',
    "Op28" TEXT NOT NULL DEFAULT '',
    "Op34" TEXT NOT NULL DEFAULT '0',
    "Op52" TEXT NOT NULL DEFAULT '0',
    "EstoqueLocal" TEXT NOT NULL DEFAULT '0',
    "Inativo" TEXT NOT NULL DEFAULT '',
    "DataCad" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "HoraCad" TEXT NOT NULL DEFAULT '00:00'
);

-- CreateTable
CREATE TABLE "SERVICO" (
    "pedido" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Data" DATETIME NOT NULL,
    "horaProposta" TEXT,
    "Contato" TEXT,
    "TellResp" TEXT,
    "Responsavel" TEXT,
    "Reclamado" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Solicitado',
    "observacao" TEXT,
    "codEmp" INTEGER,
    "CodUsu" INTEGER,
    CONSTRAINT "SERVICO_codEmp_fkey" FOREIGN KEY ("codEmp") REFERENCES "EMPRESA" ("codEmp") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SERVICO_CodUsu_fkey" FOREIGN KEY ("CodUsu") REFERENCES "USUARIO" ("codUsu") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SERVICO_HIS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Pedido" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "hora" TEXT NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT,
    "Historico" TEXT NOT NULL,
    "codUsu" INTEGER,
    CONSTRAINT "SERVICO_HIS_Pedido_fkey" FOREIGN KEY ("Pedido") REFERENCES "SERVICO" ("pedido") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SERVICO_HIS_codUsu_fkey" FOREIGN KEY ("codUsu") REFERENCES "USUARIO" ("codUsu") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_Usuario_key" ON "USUARIO"("Usuario");
