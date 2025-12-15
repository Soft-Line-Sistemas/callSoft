"use client";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/button";
import { Building2, FileText, Phone } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../src/lib/api";
import { useState } from "react";

export default function CriarEmpresaPage() {
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacao, setObservacao] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/empresas", {
        nomeFantasia,
        razaoSocial,
        cnpj: cnpj || null,
        telefone: telefone || null,
        observacao: observacao || null
      });
      return res.data;
    }
  });

  const disabled = !nomeFantasia || !razaoSocial;

  return (
    <div className="min-h-screen bg-navy-deep">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-3xl mx-auto">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Criar Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nome Fantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  leftIcon={<Building2 className="h-4 w-4" />}
                />
                <Input
                  placeholder="Razão Social"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  leftIcon={<FileText className="h-4 w-4" />}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="CNPJ (opcional)"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
                <Input
                  placeholder="Telefone (opcional)"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>
              <Input
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="gradient" onClick={() => mutation.mutate()} isLoading={mutation.isPending} disabled={disabled}>
                Salvar
              </Button>
              <Button variant="outline" onClick={() => { setNomeFantasia(""); setRazaoSocial(""); setCnpj(""); setTelefone(""); setObservacao(""); }}>
                Limpar
              </Button>
            </CardFooter>
          </Card>

          {mutation.data && (
            <Card variant="solid" className="mt-6">
              <CardHeader>
                <CardTitle>Empresa criada</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto">{JSON.stringify(mutation.data, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
