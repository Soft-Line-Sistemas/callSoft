"use client";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";
import { useNotificationStore } from "@/store/notificationStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NeonLinesBackground } from "@/components/ui/NeonLinesBackground";
import { resolveTenantIdFromEmail } from "@/lib/tenant";
import { authApi } from "@/services/auth.service";

export default function LoginPage() {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetPhone, setResetPhone] = useState("");
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [isFirstLoginOpen, setIsFirstLoginOpen] = useState(false);
    const [firstLoginEmail, setFirstLoginEmail] = useState("");
    const [legacyLogin, setLegacyLogin] = useState("");
    const [legacySenha, setLegacySenha] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isFirstLoginLoading, setIsFirstLoginLoading] = useState(false);
    const [firstLoginError, setFirstLoginError] = useState<string | null>(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem("firstLoginEmail");
        if (storedEmail) {
            setFirstLoginEmail(storedEmail);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const tenantId = resolveTenantIdFromEmail(email);
            if (!tenantId) {
                throw new Error("Não foi possível identificar o tenant a partir do e-mail.");
            }
            const isSoftline = tenantId.toLowerCase() === "softlineinfo";
            let res;
            try {
                res = await api.post("/api/v1/auth/login", {
                    email,
                    password,
                    tenantId
                });
            } catch (loginError: any) {
                const errorCode = loginError?.response?.data?.error?.code;
                if (isSoftline && errorCode === "AUTH_026") {
                    localStorage.setItem("firstLoginEmail", email);
                    setFirstLoginEmail(email);
                    setFirstLoginError(null);
                    setIsFirstLoginOpen(true);
                    return;
                }
                throw loginError;
            }

            const { success, data } = res.data;
            
            if (success && data?.token) {
                setAuthToken(data.token);
                
                addNotification({
                    title: "Bem-vindo!",
                    message: `Login realizado com sucesso. Olá, ${data?.user?.name ?? data?.user?.email ?? "usuário"}!`,
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

    const handleFirstLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setFirstLoginError("A nova senha e a confirmação devem ser iguais.");
            return;
        }

        setIsFirstLoginLoading(true);
        setFirstLoginError(null);
        try {
            const data = await authApi.firstLogin({
                login: legacyLogin,
                senha: legacySenha,
                newPassword,
                tenantId: "softlineinfo"
            });

            if (!data?.token) {
                throw new Error("Resposta inválida do servidor");
            }

            setAuthToken(data.token);
            addNotification({
                title: "Primeiro acesso concluído",
                message: "Conta criada com sucesso. Você já está logado.",
                type: "success",
                category: "system"
            });
            setIsFirstLoginOpen(false);
            router.push("/dashboard");
        } catch (error: any) {
            setFirstLoginError(
                error.response?.data?.error?.message || "Falha ao concluir o primeiro acesso."
            );
        } finally {
            setIsFirstLoginLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetLoading(true);
        try {
            const tenantId = resolveTenantIdFromEmail(resetEmail);
            if (!tenantId) {
                throw new Error("Não foi possível identificar o tenant a partir do e-mail.");
            }
            await api.post("/api/v1/auth/password-reset/request", {
                email: resetEmail,
                phone: resetPhone,
                tenantId
            });
            addNotification({
                title: "WhatsApp Enviado",
                message: "Verifique seu WhatsApp para redefinir a senha.",
                type: "success",
                category: "system"
            });
            setIsResetOpen(false);
            setResetEmail("");
            setResetPhone("");
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
                <NeonLinesBackground />
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
                        Digite seu email e telefone cadastrado para receber o link de redefinição.
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
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Telefone cadastrado</label>
                            <Input 
                                type="tel" 
                                placeholder="(XX) 9XXXX-XXXX"
                                value={resetPhone} 
                                onChange={e => setResetPhone(e.target.value)}
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

            <Dialog open={isFirstLoginOpen} onOpenChange={setIsFirstLoginOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Primeiro acesso</DialogTitle>
                    </DialogHeader>
                        <p className="text-slate-400 mb-4 text-sm">
                        Use o usuario e senha do sistema Enterprise para criar sua nova senha.
                    </p>
                    <form onSubmit={handleFirstLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <Input
                                type="email"
                                value={firstLoginEmail}
                                readOnly
                                className="bg-slate-900/50 border-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Usuario</label>
                            <Input
                                type="text"
                                placeholder="Usuario do Enterprise"
                                value={legacyLogin}
                                onChange={(e) => setLegacyLogin(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                            <Input
                                type="password"
                                placeholder="Senha do Enterprise"
                                value={legacySenha}
                                onChange={(e) => setLegacySenha(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nova senha</label>
                            <Input
                                type="password"
                                placeholder="Nova senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar nova senha</label>
                            <Input
                                type="password"
                                placeholder="Confirmar nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFirstLoginOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="gradient" isLoading={isFirstLoginLoading}>Criar acesso</Button>
                        </div>
                        {firstLoginError && (
                            <p className="text-sm text-red-400">{firstLoginError}</p>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
