"use client";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/button";
import { useState, useEffect } from "react";

export default function WhatsAppConfigPage() {
  const [menu1, setMenu1] = useState("Solicitar Chamado");
  const [menu2, setMenu2] = useState("Consultar Chamado");
  const [menu3, setMenu3] = useState("Falar com Operador");
  const [boasVindas, setBoasVindas] = useState("Olá! Envie 'Oi' para ver o menu.");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wpp_config");
      if (saved) {
        const cfg = JSON.parse(saved);
        setMenu1(cfg.menu1 || menu1);
        setMenu2(cfg.menu2 || menu2);
        setMenu3(cfg.menu3 || menu3);
        setBoasVindas(cfg.boasVindas || boasVindas);
      }
    }
  }, []);

  const save = () => {
    const cfg = { menu1, menu2, menu3, boasVindas };
    localStorage.setItem("wpp_config", JSON.stringify(cfg));
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-8">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Configurações do Chatbot WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Mensagem de boas-vindas" value={boasVindas} onChange={(e) => setBoasVindas(e.target.value)} />
            <Input placeholder="Menu 1" value={menu1} onChange={(e) => setMenu1(e.target.value)} />
            <Input placeholder="Menu 2" value={menu2} onChange={(e) => setMenu2(e.target.value)} />
            <Input placeholder="Menu 3" value={menu3} onChange={(e) => setMenu3(e.target.value)} />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="gradient" onClick={save}>Salvar</Button>
            <Button variant="outline" onClick={() => { setBoasVindas("Olá! Envie 'Oi' para ver o menu."); setMenu1("Solicitar Chamado"); setMenu2("Consultar Chamado"); setMenu3("Falar com Operador"); }}>Resetar</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
