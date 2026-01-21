"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Save, Building2, MapPin, Contact, Search } from "lucide-react";
import { api, CreateFornecedorRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export default function NewSupplierPage() {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isConsulting, setIsConsulting] = useState(false);

    const [formData, setFormData] = useState<CreateFornecedorRequest>({
        nome: "",
        razaoSocial: "",
        cnpj: "",
        email: "",
        telefone: "",
        contato: "",
        pais: "Brasil",
        cep: "",
        endereco: "",
        cidade: "",
        estado: "",
        observacoes: "",
        especialidades: []
    });

    const [especialidadesInput, setEspecialidadesInput] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEspecialidadesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEspecialidadesInput(e.target.value);
        // Split by comma and trim to array
        const specs = e.target.value.split(",").map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => ({ ...prev, especialidades: specs }));
    };

    const handleConsultarCNPJ = async () => {
        const cnpjLimpo = formData.cnpj?.replace(/\D/g, '');
        
        if (!cnpjLimpo || cnpjLimpo.length !== 14) {
             addNotification({
                title: "CNPJ Inválido",
                message: "Por favor, insira um CNPJ válido com 14 dígitos.",
                type: "warning",
                category: "system"
            });
            return;
        }

        setIsConsulting(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({
                    ...prev,
                    razaoSocial: data.razao_social || prev.razaoSocial,
                    nome: data.nome_fantasia || data.razao_social || prev.nome,
                    cep: data.cep || prev.cep,
                    endereco: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''}, ${data.bairro}`,
                    cidade: data.municipio || prev.cidade,
                    estado: data.uf || prev.estado,
                    email: data.email || prev.email,
                    telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : prev.telefone,
                    pais: "Brasil"
                }));
                 addNotification({
                    title: "Sucesso",
                    message: "Dados da empresa encontrados!",
                    type: "success",
                    category: "system"
                });
            } else {
                throw new Error(data.message || "Erro na consulta");
            }
        } catch (error) {
             addNotification({
                title: "Erro na Consulta",
                message: "Não foi possível encontrar dados para este CNPJ.",
                type: "error",
                category: "system"
            });
        } finally {
            setIsConsulting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.email || !formData.pais) {
            addNotification({
                title: "Erro de Validação",
                message: "Por favor, preencha os campos obrigatórios (Nome, Email, País).",
                type: "error",
                category: "system"
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/api/v1/fornecedores", formData);
            addNotification({
                title: "Sucesso",
                message: "Fornecedor cadastrado com sucesso!",
                type: "success",
                category: "system"
            });
            router.push("/suppliers");
        } catch (error: any) {
            console.error("Error creating supplier:", error);
            addNotification({
                title: "Erro ao cadastrar",
                message: error.response?.data?.message || "Ocorreu um erro ao salvar o fornecedor.",
                type: "error",
                category: "system"
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold text-white">Nova Empresa</h1>
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
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome Fantasia *</label>
                                    <Input
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        placeholder="Ex: Tech Solutions"
                                        required
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
                                    <div className="flex gap-2">
                                        <Input
                                            name="cnpj"
                                            value={formData.cnpj}
                                            onChange={handleChange}
                                            placeholder="00.000.000/0000-00"
                                            className="flex-1"
                                        />
                                        <Button 
                                            type="button" 
                                            onClick={handleConsultarCNPJ} 
                                            disabled={isConsulting || !formData.cnpj}
                                            variant="outline"
                                            className="min-w-[120px]"
                                        >
                                            {isConsulting ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <>
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Consultar
                                                </>
                                            )}
                                        </Button>
                                    </div>
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
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contato@empresa.com"
                                        required
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
                                    <label className="block text-sm font-medium text-slate-300 mb-2">País *</label>
                                    <Input
                                        name="pais"
                                        value={formData.pais}
                                        onChange={handleChange}
                                        required
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
                                        Salvar Empresa
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
