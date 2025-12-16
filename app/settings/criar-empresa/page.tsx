"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../src/lib/api";

import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "../../../src/components/ui/Card";

import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/button";

import { Building2, Search, Phone, MapPin } from "lucide-react";

export default function CriarEmpresaPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [cnpj, setCnpj] = useState("");
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [inscEstadual, setInscEstadual] = useState("");
  const [im, setIm] = useState("");

  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [telefone, setTelefone] = useState("");
  const [telefoneSec, setTelefoneSec] = useState("");
  const [cabecalho, setCabecalho] = useState("");
  const [observacao, setObservacao] = useState("");

  // ======================================================
  // BUSCA CNPJ (API PÚBLICA)
  // ======================================================

  async function buscarCnpj() {
    if (cnpj.length < 14) return;

    try {
      setLoadingCnpj(true);

      // Remove máscara
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      // BrasilAPI (estável)
      const res = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
      );

      if (!res.ok) throw new Error("CNPJ não encontrado");

      const data = await res.json();

      // Preenche automaticamente
      setRazaoSocial(data.razao_social || "");
      setNomeFantasia(data.nome_fantasia || "");
      setCep(data.cep || "");
      setEndereco(
        `${data.logradouro || ""} ${data.numero || ""}`.trim()
      );
      setBairro(data.bairro || "");
      setCidade(data.municipio || "");
      setEstado(data.uf || "");
      setTelefone(data.ddd_telefone_1 || "");
    } catch (err) {
      alert("Erro ao consultar CNPJ");
    } finally {
      setLoadingCnpj(false);
    }
  }

  // ======================================================
  // MUTATION – CRIAR EMPRESA
  // ======================================================

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/empresas", {
        nomeFantasia,
        razaoSocial,
        cnpj: cnpj || null,
        inscEstadual: inscEstadual || null,
        im: im || null,
        cep: cep || null,
        endereco: endereco || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        telefone: telefone || null,
        telefoneSec: telefoneSec || null,
        cabecalho: cabecalho || null,
        observacao: observacao || null
      });
    }
  });

  const disabled = !cnpj || !razaoSocial;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-navy-deep">
      <Sidebar />
      <Header />

      <main className="ml-64 mt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Criar Empresa
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ================= CNPJ ================= */}
              <div className="flex gap-2">
                <Input
                  placeholder="CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  onBlur={buscarCnpj}
                />
                <Button
                  type="button"
                  onClick={buscarCnpj}
                  disabled={loadingCnpj}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* ================= DADOS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Razão Social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
                <Input placeholder="Nome Fantasia" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Inscrição Estadual" value={inscEstadual} onChange={(e) => setInscEstadual(e.target.value)} />
                <Input placeholder="Inscrição Municipal" value={im} onChange={(e) => setIm(e.target.value)} />
                <Input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
              </div>

              {/* ================= ENDEREÇO ================= */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  className="md:col-span-2"
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
                <Input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                <Input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Estado (UF)" value={estado} onChange={(e) => setEstado(e.target.value)} />
                <Input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} leftIcon={<Phone className="h-4 w-4" />} />
              </div>

              <Input placeholder="Telefone Secundário" value={telefoneSec} onChange={(e) => setTelefoneSec(e.target.value)} />
              <Input placeholder="Cabeçalho de Relatórios" value={cabecalho} onChange={(e) => setCabecalho(e.target.value)} />
              <Input placeholder="Observações" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </CardContent>

            <CardFooter>
              <Button
                variant="gradient"
                onClick={() => mutation.mutate()}
                isLoading={mutation.isPending}
                disabled={disabled}
              >
                Salvar Empresa
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
