"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Save, Plus, Trash2, ShoppingCart, Calendar, DollarSign, Truck } from "lucide-react";
import { api, CreateCotacaoRequest, ItemCotacao } from "@/lib/api";
import { empresasApi, type EmpresaResponse } from "@/services/empresas.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";

export default function NewQuotePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Empresas
    const { data: empresasData = [] } = useQuery<EmpresaResponse[]>({
        queryKey: ["empresas-list"],
        queryFn: () => empresasApi.list()
    });

    type QuoteFormData = Omit<CreateCotacaoRequest, "fornecedorId" | "empresaId"> & { empresaId: string };
    const clampNonNegative = (value: number) => Math.max(0, value);

    const [formData, setFormData] = useState<QuoteFormData>({
        ticketId: params.id,
        empresaId: "",
        itens: [
            { descricao: "", quantidade: 1, unidade: "UN", codigoPeca: "", precoUnitario: 0 }
        ],
        descontoGlobal: 0,
        descontoTipo: "VALOR_ABSOLUTO",
        prazoEntregaDias: undefined,
        dataExpiracao: undefined,
        observacoes: ""
    });

    // Item Management
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            itens: [...prev.itens, { descricao: "", quantidade: 1, unidade: "UN", codigoPeca: "", precoUnitario: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.itens.length === 1) return;
        setFormData(prev => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: keyof ItemCotacao, value: any) => {
        const newItems = [...formData.itens];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, itens: newItems }));
    };

    const subtotal = formData.itens.reduce((sum, item) => {
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario = Number(item.precoUnitario) || 0;
        return sum + quantidade * precoUnitario;
    }, 0);
    const totalItens = formData.itens.reduce((sum, item) => {
        const quantidade = Number(item.quantidade) || 0;
        return sum + quantidade;
    }, 0);
    const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

    const valorGlobal = (() => {
        const desconto = Number(formData.descontoGlobal) || 0;
        if (!desconto) return subtotal;
        if (formData.descontoTipo === "PERCENTUAL") {
            return subtotal * (1 - desconto / 100);
        }
        return Math.max(0, subtotal - desconto);
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.empresaId) {
            addNotification({
                title: "Erro de Validação",
                message: "Selecione uma empresa.",
                type: "error",
                category: "system"
            });
            return;
        }

        if (formData.itens.some(i => !i.descricao || i.quantidade <= 0)) {
            addNotification({
                title: "Erro de Validação",
                message: "Verifique os itens da cotação. Descrição e quantidade são obrigatórios.",
                type: "error",
                category: "system"
            });
            return;
        }
        if (formData.itens.some(i => (Number(i.precoUnitario) || 0) < 0) || (Number(formData.descontoGlobal) || 0) < 0) {
            addNotification({
                title: "Erro de Validação",
                message: "Não são permitidos valores negativos na cotação.",
                type: "error",
                category: "system"
            });
            return;
        }

        setIsLoading(true);
        try {
            const { empresaId, ...rest } = formData;
            const payload: CreateCotacaoRequest = {
                ...rest,
                empresaId: Number(empresaId)
            };
            await api.post("/api/v1/cotacoes", payload);
            addNotification({
                title: "Sucesso",
                message: "Cotação criada com sucesso!",
                type: "success",
                category: "system"
            });
            router.push(`/tickets/${params.id}`);
        } catch (error: any) {
            console.error("Error creating quote:", error);
            addNotification({
                title: "Erro ao criar",
                message: error.response?.data?.message || "Ocorreu um erro ao salvar a cotação.",
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
                <div className="p-8 w-full">
                    <div className="mb-6 flex items-center gap-4 animate-slide-up">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold text-white">Nova Cotação</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
                        
                        {/* Empresa */}
                        <Card variant="glass">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <CardTitle>Empresa</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Selecione a Empresa *</label>
                                <select
                                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    value={formData.empresaId}
                                    onChange={(e) => setFormData({...formData, empresaId: e.target.value})}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {empresasData.map((empresa) => (
                                        <option key={empresa.codEmp} value={String(empresa.codEmp)}>
                                            {empresa.nomeFantasia || empresa.razaoSocial} {empresa.cnpj ? `(${empresa.cnpj})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </CardContent>
                        </Card>

                        {/* Itens */}
                        <Card variant="glass">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <ShoppingCart className="h-5 w-5 text-green-400" />
                                    </div>
                                    <CardTitle>Itens da Cotação</CardTitle>
                                </div>
                                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                        {formData.itens.map((item, index) => (
                          <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-2">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-2">
                              <label className="block text-xs text-slate-400 mb-1">Código</label>
                              <Input
                                value={item.codigoPeca || ""}
                                onChange={(e) => updateItem(index, "codigoPeca", e.target.value)}
                                placeholder="SKU-123"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-slate-400 mb-1">Descrição *</label>
                              <Input
                                value={item.descricao}
                                onChange={(e) => updateItem(index, "descricao", e.target.value)}
                                placeholder="Descrição do produto/serviço"
                                required
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-slate-400 mb-1">Qtd *</label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantidade}
                                onChange={(e) => {
                                  const quantidade = Number.parseInt(e.target.value, 10);
                                  if (Number.isNaN(quantidade)) {
                                    updateItem(index, "quantidade", 1);
                                    return;
                                  }
                                  updateItem(index, "quantidade", Math.max(1, quantidade));
                                }}
                                required
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-slate-400 mb-1">Un</label>
                              <Input
                                value={item.unidade || "UN"}
                                onChange={(e) => updateItem(index, "unidade", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-slate-400 mb-1">Valor Unit. (USD) *</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.precoUnitario}
                                onChange={(e) => {
                                  const precoUnitario = Number.parseFloat(e.target.value);
                                  updateItem(index, "precoUnitario", Number.isNaN(precoUnitario) ? 0 : clampNonNegative(precoUnitario));
                                }}
                                placeholder="0.00"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-slate-400 mb-1">Total Item</label>
                              <Input
                                type="text"
                                value={usdFormatter.format((Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0))}
                                readOnly
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={formData.itens.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300">
                            Cálculo: {item.quantidade || 0} x {usdFormatter.format(Number(item.precoUnitario) || 0)} ={" "}
                            <span className="font-semibold text-emerald-400">
                              {usdFormatter.format((Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0))}
                            </span>
                          </p>
                          </div>
                        ))}

                        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs text-slate-400">Total de Itens (quantidades)</p>
                                    <p className="text-lg font-semibold text-white">{totalItens}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Subtotal dos Itens (USD)</p>
                                    <p className="text-lg font-semibold text-emerald-400">{usdFormatter.format(subtotal)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Valor Global (USD)</p>
                                    <p className="text-lg font-semibold text-purple-300">{usdFormatter.format(valorGlobal)}</p>
                                </div>
                            </div>
                        </div>

                      </CardContent>
                        </Card>

                        {/* Condições */}
                        <Card variant="glass">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <CardTitle>Condições e Prazos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Prazo de Entrega (dias)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.prazoEntregaDias || ""}
                                        onChange={(e) => setFormData({...formData, prazoEntregaDias: parseInt(e.target.value) || undefined})}
                                        placeholder="Ex: 15"
                                        leftIcon={<Truck className="h-4 w-4" />}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Validade da Proposta</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.dataExpiracao || ""}
                                        onChange={(e) => setFormData({...formData, dataExpiracao: e.target.value})}
                                        leftIcon={<Calendar className="h-4 w-4" />}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Desconto Global (USD)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.descontoGlobal || ""}
                                            onChange={(e) => {
                                                const desconto = Number.parseFloat(e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    descontoGlobal: Number.isNaN(desconto) ? 0 : clampNonNegative(desconto)
                                                });
                                            }}
                                            placeholder="0.00"
                                            className="flex-1"
                                        />
                                        <select
                                            className="rounded-lg bg-slate-900/50 border border-slate-700 p-2 text-slate-100 text-sm"
                                            value={formData.descontoTipo}
                                            onChange={(e) => setFormData({...formData, descontoTipo: e.target.value as any})}
                                        >
                                            <option value="VALOR_ABSOLUTO">$</option>
                                            <option value="PERCENTUAL">%</option>
                                        </select>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">
                                        {formData.descontoTipo === "VALOR_ABSOLUTO"
                                            ? `Equivalente a ${
                                                subtotal > 0
                                                    ? `${((Number(formData.descontoGlobal) || 0) / subtotal * 100).toFixed(2)}%`
                                                    : "0.00%"
                                            } do subtotal`
                                            : `Equivalente a ${usdFormatter.format(
                                                subtotal * ((Number(formData.descontoGlobal) || 0) / 100)
                                            )} de desconto`}
                                    </p>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                                    <textarea
                                        value={formData.observacoes}
                                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                                        rows={3}
                                        className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="Condições de pagamento, frete, etc..."
                                    />
                                </div>
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
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Criar Cotação
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
