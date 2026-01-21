"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Save, Building2, MapPin, Contact, Search } from "lucide-react";
import { api, UpdateFornecedorRequest, Fornecedor } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { useQuery } from "@tanstack/react-query";

export default function EditSupplierPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isConsulting, setIsConsulting] = useState(false);
    const { id } = params;

    const [formData, setFormData] = useState<UpdateFornecedorRequest>({
        nome: "",
        razaoSocial: "",
        cnpj: "",
        email: "",
        telefone: "",
        contato: "",
        pais: "",
        cep: "",
        endereco: "",
        cidade: "",
        estado: "",
        observacoes: "",
        especialidades: []
    });

    const [especialidadesInput, setEspecialidadesInput] = useState("");

    // Fetch Supplier Data
    const { data: supplier, isLoading: isFetching } = useQuery<Fornecedor>({
        queryKey: ["supplier", id],
        queryFn: async () => {
            const res = await api.get(`/api/v1/fornecedores/${id}`);
            return res.data;
        }
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                nome: supplier.nome,
                razaoSocial: supplier.razaoSocial,
                cnpj: supplier.cnpj,
                email: supplier.email,
                telefone: supplier.telefone,
                contato: supplier.contato,
                pais: supplier.pais,
                cep: supplier.cep,
                endereco: supplier.endereco,
                cidade: supplier.cidade,
                estado: supplier.estado,
                observacoes: supplier.observacoes,
                especialidades: supplier.especialidades || []
            });
            setEspecialidadesInput(supplier.especialidades?.join(", ") || "");
        }
    }, [supplier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEspecialidadesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEspecialidadesInput(e.target.value);
        const specs = e.target.value.split(",").map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => ({ ...prev, especialidades: specs }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        try {
            await api.put(`/api/v1/fornecedores/${id}`, formData);
            addNotification({
                title: "Sucesso",
                message: "Fornecedor atualizado com sucesso!",
                type: "success",
                category: "system"
            });
            router.push(`/suppliers/${id}`);
        } catch (error: any) {
            console.error("Error updating supplier:", error);
            addNotification({
                title: "Erro ao atualizar",
                message: error.response?.data?.message || "Ocorreu um erro ao atualizar o fornecedor.",
                type: "error",
                category: "system"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 p-8">
                    <div className="text-slate-400">Carregando...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8 max-w-5xl mx-auto">
                    <div className="mb-6 flex items-center gap-4 animate-slide-up">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold text-white">Editar Fornecedor</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
                        
                        {/* Dados da Empresa */}
                        <Card variant="glass">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <CardTitle>Dados da Empresa</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome Fantasia</label>
                                    <Input
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        placeholder="Ex: Tech Solutions"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Razão Social</label>
                                    <Input
                                        name="razaoSocial"
                                        value={formData.razaoSocial}
                                        onChange={handleChange}
                                        placeholder="Ex: Tech Solutions LTDA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ</label>
                                    <Input
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Especialidades (separadas por vírgula)</label>
                                    <Input
                                        value={especialidadesInput}
                                        onChange={handleEspecialidadesChange}
                                        placeholder="Ex: Hardware, Software, Consultoria"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.especialidades?.map((spec, i) => (
                                            <span key={i} className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contato */}
                        <Card variant="glass">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <Contact className="h-5 w-5 text-green-400" />
                                    </div>
                                    <CardTitle>Contato</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                                    <Input
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleChange}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Pessoa de Contato</label>
                                    <Input
                                        name="contato"
                                        value={formData.contato}
                                        onChange={handleChange}
                                        placeholder="Nome do responsável"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Endereço */}
                        <Card variant="glass">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <CardTitle>Endereço</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">CEP</label>
                                    <Input
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleChange}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                                    <Input
                                        name="endereco"
                                        value={formData.endereco}
                                        onChange={handleChange}
                                        placeholder="Rua, Número, Bairro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                                    <Input
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                                    <Input
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        placeholder="UF"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">País</label>
                                    <Input
                                        name="pais"
                                        value={formData.pais}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Observações */}
                        <Card variant="glass">
                            <CardContent className="pt-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                                <textarea
                                    name="observacoes"
                                    value={formData.observacoes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="Informações adicionais..."
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="gradient" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
