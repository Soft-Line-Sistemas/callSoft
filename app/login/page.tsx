"use client";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "../../src/lib/api";
import { setAuthToken } from "../../src/lib/auth";
import { useNotificationStore } from "../../src/store/notificationStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../src/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../src/components/ui/dialog";

export default function LoginPage() {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isResetLoading, setIsResetLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post("/api/v1/auth/login", {
                email,
                password,
                tenantId: process.env.NEXT_PUBLIC_TENANT_ID
            });

            const { success, data } = res.data;
            
            if (success && data?.token) {
                setAuthToken(data.token);
                
                addNotification({
                    title: "Bem-vindo!",
                    message: `Login realizado com sucesso. Olá, ${data.user.name}!`,
                    type: "success",
                    category: "system"
                });
                router.push("/dashboard"); 
            } else {
                throw new Error("Resposta inválida do servidor");
            }

        } catch (error: any) {
            console.error("Login error:", error);
            addNotification({
                title: "Erro no Login",
                message: error.response?.data?.message || "Falha ao autenticar. Verifique suas credenciais.",
                type: "error",
                category: "security"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetLoading(true);
        try {
            await api.post("/api/v1/auth/password-reset/request", {
                email: resetEmail,
                tenantId: process.env.NEXT_PUBLIC_TENANT_ID
            });
            addNotification({
                title: "Email Enviado",
                message: "Verifique sua caixa de entrada para redefinir a senha.",
                type: "success",
                category: "system"
            });
            setIsResetOpen(false);
            setResetEmail("");
        } catch (error: any) {
             addNotification({
                title: "Erro",
                message: error.response?.data?.message || "Falha ao solicitar redefinição.",
                type: "error",
                category: "system"
            });
        } finally {
            setIsResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Left Side - Brand / Info */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 text-white">
                <div className="max-w-lg animate-slide-up">
                    <div className="mb-8 inline-block">
                         <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                            CALLSOFT
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-6 text-slate-100">
                        Gestão Inteligente de Tickets
                    </h2>
                    
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                        Centralize seu atendimento, automatize processos e integre com WhatsApp em uma única plataforma moderna e eficiente.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-purple-400 text-xl">🚀</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-200">Alta Performance</h3>
                                <p className="text-sm text-slate-500">Otimizado para agilidade no atendimento</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 group">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-blue-400 text-xl">💬</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-200">WhatsApp Integrado</h3>
                                <p className="text-sm text-slate-500">Conecte-se diretamente com seus clientes</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-cyan-400 text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-200">Dashboard em Tempo Real</h3>
                                <p className="text-sm text-slate-500">Métricas e KPIs atualizados instantaneamente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "200ms" }}>
                    <Card variant="glass-blue" className="border-slate-800/50 shadow-2xl backdrop-blur-xl">
                        <CardHeader className="pb-2 text-center">
                            <div className="lg:hidden mb-4">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    CALLSOFT
                                </h1>
                            </div>
                            <CardTitle className="text-2xl text-white">Bem-vindo de volta</CardTitle>
                            <CardDescription className="text-slate-400">
                                Acesse sua conta para continuar
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Senha</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetOpen(true)}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                                        >
                                            Esqueceu a senha?
                                        </button>
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        }
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-6 shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Entrando...</span>
                                        </div>
                                    ) : (
                                        "Acessar Sistema"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        
                        <CardFooter className="justify-center pt-2 pb-6">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} CallSoft. Todos os direitos reservados.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-400 mb-4 text-sm">
                        Digite seu email para receber o link de redefinição.
                    </p>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <Input 
                                type="email" 
                                placeholder="seu@email.com" 
                                value={resetEmail} 
                                onChange={e => setResetEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="gradient" isLoading={isResetLoading}>Enviar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
