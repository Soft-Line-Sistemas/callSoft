-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SERVICO" (
    "pedido" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Data" DATETIME NOT NULL,
    "horaProposta" TEXT,
    "Contato" TEXT,
    "TellResp" TEXT,
    "Responsavel" TEXT,
    "Reclamado" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Solicitado',
    "CanalOrigem" TEXT NOT NULL DEFAULT 'WEB',
    "observacao" TEXT,
    "codEmp" INTEGER,
    "CodUsu" INTEGER,
    CONSTRAINT "SERVICO_codEmp_fkey" FOREIGN KEY ("codEmp") REFERENCES "EMPRESA" ("codEmp") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SERVICO_CodUsu_fkey" FOREIGN KEY ("CodUsu") REFERENCES "USUARIO" ("codUsu") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SERVICO" ("CodUsu", "Contato", "Data", "Reclamado", "Responsavel", "TellResp", "codEmp", "horaProposta", "observacao", "pedido", "status") SELECT "CodUsu", "Contato", "Data", "Reclamado", "Responsavel", "TellResp", "codEmp", "horaProposta", "observacao", "pedido", "status" FROM "SERVICO";
DROP TABLE "SERVICO";
ALTER TABLE "new_SERVICO" RENAME TO "SERVICO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
