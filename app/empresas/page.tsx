"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, Download, Plus, MapPin, Phone, Mail, FileText, FileSpreadsheet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { empresasApi, type EmpresaResponse } from "@/services/empresas.service";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { exportEmpresasToCSV, exportEmpresasToPDF } from "@/lib/exportEmpresas";
import { useAuth } from "@/hooks/auth";

export default function EmpresasPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const { data: authUser } = useAuth();

    const { data: empresas = [], isLoading } = useQuery<EmpresaResponse[]>({
        queryKey: ["empresas", searchText],
        queryFn: () => empresasApi.list({ search: searchText || undefined }),
    });

    const tenantLabel = authUser?.tenantId ?? "INTERSERVICE USA";

    function capitalizeFirstLetter(text: string) {
        if (!text) return text;
        return text.toUpperCase();
    }

    const tenantName = capitalizeFirstLetter(tenantLabel);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };

        if (isExportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

    const handleExport = (format: 'pdf' | 'csv') => {
        setIsExporting(true);
        setIsExportMenuOpen(false);

        try {
            if (format === 'pdf') {
                exportEmpresasToPDF(empresas, tenantName);
            } else {
                exportEmpresasToCSV(empresas, tenantName);
            }
        } catch (error) {
            console.error('Error exporting:', error);
            alert('Erro ao exportar. Por favor, tente novamente.');
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };

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
                            <div className="relative" ref={exportMenuRef}>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                    disabled={isExporting}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isExporting ? 'Exportando...' : 'Exportar'}
                                </Button>

                                {isExportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <div className="py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleExport('pdf');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Exportar como PDF
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleExport('csv');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                                Exportar como CSV
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
