"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, Download, Plus, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { empresasApi, type EmpresaResponse } from "@/services/empresas.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

export default function EmpresasPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");

    const { data: empresas = [], isLoading } = useQuery<EmpresaResponse[]>({
        queryKey: ["empresas", searchText],
        queryFn: () => empresasApi.list({ search: searchText || undefined }),
    });

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center justify-between animate-slide-up">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Empresas</h1>
                            <p className="mt-2 text-slate-400">
                                Gerencie sua base de empresas e parceiros
                            </p>
                        </div>
                        <Button variant="gradient" onClick={() => router.push("/settings/criar-empresa")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Empresa
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="glass rounded-lg p-4 mb-6 animate-slide-up">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="search"
                                    placeholder="Buscar por nome, razão social ou CNPJ..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    leftIcon={<Search className="h-4 w-4" />}
                                    className="w-full"
                                />
                            </div>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* Lista de Empresas */}
                    <div className="glass rounded-lg overflow-hidden animate-slide-up">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">Nome / Razão Social</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">Contato</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">Localização</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400">Carregando empresas...</td>
                                        </tr>
                                    ) : empresas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma empresa encontrada.</td>
                                        </tr>
                                    ) : (
                                        empresas.map((empresa) => (
                                            <tr
                                                key={empresa.codEmp}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/empresas/${empresa.codEmp}`)}
                                            >
                                                <td className="p-4">
                                                    <div>
                                                        <p className="text-white font-medium">{empresa.nomeFantasia || "—"}</p>
                                                        {empresa.razaoSocial && (
                                                            <p className="text-xs text-slate-400">{empresa.razaoSocial}</p>
                                                        )}
                                                        {empresa.cnpj && (
                                                            <p className="text-xs text-slate-500 font-mono mt-1">{empresa.cnpj}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-sm text-slate-300">
                                                            <Mail className="h-3 w-3 mr-2 text-slate-500" />
                                                            {empresa.telefoneSec ?? "--"}
                                                        </div>
                                                        {empresa.telefone && (
                                                            <div className="flex items-center text-sm text-slate-300">
                                                                <Phone className="h-3 w-3 mr-2 text-slate-500" />
                                                                {empresa.telefone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-start text-sm text-slate-300">
                                                        <MapPin className="h-3 w-3 mr-2 mt-1 text-slate-500" />
                                                        <div>
                                                            <p>{empresa.cidade ? `${empresa.cidade}, ${empresa.estado || ""}` : "-"}</p>
                                                            <p className="text-xs text-slate-400">{empresa.endereco ?? "--"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={empresa.ativo ? "success" : "secondary"}>
                                                        {empresa.ativo ? "Ativo" : "Inativo"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
