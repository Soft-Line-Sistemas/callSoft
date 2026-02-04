"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Bot, MessageSquare, Clock, Plus, Trash2, Save, Zap, PhoneForwarded, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { useUpdateWhatsAppConfig, useWhatsAppConfig } from "@/hooks/whatsapp";
import type { MenuOption, WhatsappBotConfig } from "@/types/whatsapp-config.types";

export default function WhatsAppConfigPage() {
    const { addNotification } = useNotificationStore();
    const { data: configData, isLoading } = useWhatsAppConfig();
    const updateConfig = useUpdateWhatsAppConfig();
    const isSaving = updateConfig.isPending;
    const [config, setConfig] = useState<WhatsappBotConfig | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (configData && !hasUnsavedChanges) {
            setConfig(configData);
        }
    }, [configData, hasUnsavedChanges]);

    const handleChange = (field: keyof WhatsappBotConfig, value: any) => {
        setConfig(prev => prev ? ({ ...prev, [field]: value }) : prev);
        setHasUnsavedChanges(true);
    };

    const handleBusinessHoursChange = (field: string, value: any) => {
        setConfig(prev => prev ? ({
            ...prev,
            businessHours: { ...prev.businessHours, [field]: value }
        }) : prev);
        setHasUnsavedChanges(true);
    };

    const handleAddOption = () => {
        const newOption: MenuOption = {
            id: Date.now().toString(),
            trigger: ((config?.menuOptions.length ?? 0) + 1).toString(),
            label: "Nova Opção",
            action: "message",
            response: ""
        };
        setConfig(prev => prev ? ({
            ...prev,
            menuOptions: [...prev.menuOptions, newOption]
        }) : prev);
        setHasUnsavedChanges(true);
    };

    const handleRemoveOption = (id: string) => {
        setConfig(prev => prev ? ({
            ...prev,
            menuOptions: prev.menuOptions.filter(opt => opt.id !== id)
        }) : prev);
        setHasUnsavedChanges(true);
    };

    const handleOptionChange = (id: string, field: keyof MenuOption, value: any) => {
        setConfig(prev => prev ? ({
            ...prev,
            menuOptions: prev.menuOptions.map(opt => 
                opt.id === id ? { ...opt, [field]: value } : opt
            )
        }) : prev);
        setHasUnsavedChanges(true);
    };

    const save = async () => {
        if (!config) return;
        try {
            await updateConfig.mutateAsync(config);
            setHasUnsavedChanges(false);
            await addNotification({
                title: "Configurações Salvas",
                message: "As alterações no fluxo do chatbot foram aplicadas com sucesso.",
                type: "success",
                category: "system"
            });
        } catch (error) {
            await addNotification({
                title: "Erro ao salvar",
                message: "Não foi possível salvar as configurações do chatbot.",
                type: "error",
                category: "system"
            });
        }
    };

    if (isLoading || !config) {
        return (
            <div className="min-h-screen">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 p-8">
                    <div className="text-slate-400">Carregando configurações...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-16 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Fluxo do Chatbot</h1>
                            <p className="text-slate-400">Configure o comportamento automático do seu assistente WhatsApp.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {hasUnsavedChanges && (
                                <span className="text-amber-400 text-sm animate-pulse">
                                    Alterações não salvas
                                </span>
                            )}
                            <Button 
                                variant="gradient" 
                                onClick={save}
                                className="gap-2"
                                disabled={isSaving}
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="bg-slate-800/50 p-1 border border-slate-700/50">
                            <TabsTrigger value="general" className="gap-2">
                                <Bot className="w-4 h-4" /> Geral
                            </TabsTrigger>
                            <TabsTrigger value="flow" className="gap-2">
                                <Zap className="w-4 h-4" /> Fluxo de Menu
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="gap-2">
                                <Clock className="w-4 h-4" /> Horários
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general">
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle>Configurações Gerais</CardTitle>
                                    <CardDescription>Defina a identidade e o comportamento básico do bot.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white">Status do Chatbot</label>
                                            <p className="text-xs text-slate-400">Ative ou desative as respostas automáticas.</p>
                                        </div>
                                        <Switch 
                                            checked={config.isActive} 
                                            onCheckedChange={(c) => handleChange("isActive", c)} 
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Nome do Assistente</label>
                                            <Input 
                                                value={config.botName}
                                                onChange={(e) => handleChange("botName", e.target.value)}
                                                placeholder="Ex: Interservice Bot"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Gatilhos de Início</label>
                                            <Input 
                                                value={config.triggerKeywords}
                                                onChange={(e) => handleChange("triggerKeywords", e.target.value)}
                                                placeholder="Separe por vírgulas (ex: oi, menu, ajuda)"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Mensagem de Boas-vindas</label>
                                        <textarea 
                                            className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                            value={config.welcomeMessage}
                                            onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                                            placeholder="Digite a mensagem inicial..."
                                        />
                                        <p className="text-xs text-slate-500">Esta mensagem será enviada quando o usuário digitar um dos gatilhos.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Mensagem de Erro (Fallback)</label>
                                        <Input 
                                            value={config.fallbackMessage}
                                            onChange={(e) => handleChange("fallbackMessage", e.target.value)}
                                            placeholder="Mensagem quando a opção não é reconhecida"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="flow">
                            <Card variant="glass">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Opções do Menu Principal</CardTitle>
                                        <CardDescription>Configure as opções numéricas que o usuário pode escolher.</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={handleAddOption} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                        <Plus className="w-4 h-4" /> Nova Opção
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {config.menuOptions.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                            Nenhuma opção configurada. Adicione uma para começar.
                                        </div>
                                    ) : (
                                        config.menuOptions.map((option, index) => (
                                            <div key={option.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 transition-all hover:border-slate-600">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-12 pt-2 text-center">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mx-auto">
                                                            {option.trigger}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-4">
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium text-slate-400">Rótulo do Botão</label>
                                                                <Input 
                                                                    value={option.label} 
                                                                    onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
                                                                    placeholder="Ex: Falar com Suporte"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium text-slate-400">Ação</label>
                                                                <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                                                                    <button 
                                                                        onClick={() => handleOptionChange(option.id, "action", "message")}
                                                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${option.action === 'message' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                                                    >
                                                                        <MessageSquare className="w-3 h-3" /> Msg
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleOptionChange(option.id, "action", "transfer")}
                                                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${option.action === 'transfer' ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                                                    >
                                                                        <PhoneForwarded className="w-3 h-3" /> Transf.
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleOptionChange(option.id, "action", "link")}
                                                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${option.action === 'link' ? 'bg-purple-600/20 text-purple-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                                                    >
                                                                        <LinkIcon className="w-3 h-3" /> Link
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-xs font-medium text-slate-400">
                                                                {option.action === 'message' && "Resposta Automática"}
                                                                {option.action === 'transfer' && "Mensagem de Transferência"}
                                                                {option.action === 'link' && "URL de Destino"}
                                                            </label>
                                                            <Input 
                                                                value={option.response}
                                                                onChange={(e) => handleOptionChange(option.id, "response", e.target.value)}
                                                                placeholder={
                                                                    option.action === 'link' ? "https://..." : "Digite a mensagem..."
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => handleRemoveOption(option.id)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                                        title="Remover opção"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule">
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle>Horário de Atendimento</CardTitle>
                                    <CardDescription>Configure respostas automáticas para fora do expediente.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white">Restrição de Horário</label>
                                            <p className="text-xs text-slate-400">Enviar mensagem de ausência fora do horário comercial.</p>
                                        </div>
                                        <Switch 
                                            checked={config.businessHours.enabled} 
                                            onCheckedChange={(c) => handleBusinessHoursChange("enabled", c)} 
                                        />
                                    </div>

                                    <div className={`space-y-6 transition-opacity ${config.businessHours.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Início do Expediente</label>
                                                <Input 
                                                    type="time" 
                                                    value={config.businessHours.start}
                                                    onChange={(e) => handleBusinessHoursChange("start", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Fim do Expediente</label>
                                                <Input 
                                                    type="time" 
                                                    value={config.businessHours.end}
                                                    onChange={(e) => handleBusinessHoursChange("end", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Dias de Funcionamento</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((day) => (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            const days = config.businessHours.days.includes(day)
                                                                ? config.businessHours.days.filter(d => d !== day)
                                                                : [...config.businessHours.days, day];
                                                            handleBusinessHoursChange("days", days);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                            config.businessHours.days.includes(day)
                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {day.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Mensagem de Ausência</label>
                                            <textarea 
                                                className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                                value={config.businessHours.outOfHoursMessage}
                                                onChange={(e) => handleBusinessHoursChange("outOfHoursMessage", e.target.value)}
                                                placeholder="Digite a mensagem para fora do horário..."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
