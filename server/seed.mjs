import { prisma } from "./src/config/prisma.js";
import bcrypt from "bcrypt";

async function main() {
    const senhaHash = await bcrypt.hash("admin123", 10);
    await prisma.usuario.upsert({
        where: { login: "admin" },
        update: {},
        create: { login: "admin", senhaHash, op91: "X" }
    });
    await prisma.empresa.upsert({
        where: { codEmp: 1 },
        update: {},
        create: { nomeFantasia: "Intercity", razaoSocial: "Intercity Logistics", ativo: true }
    });
    console.log("✅ Seed executado com sucesso!");
}

main().finally(async () => {
    await prisma.$disconnect();
});
