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
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    const setAuth = useAuthStore((state) => state.setAuth);
    
    const [tenantTitle, setTenantTitle] = useState("INTERSERVICE USA");
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

    const ROUTE_PERMISSIONS: Array<{ prefix: string; required: string | string[] }> = [
        { prefix: "/dashboard", required: "dashboard:read" },
        { prefix: "/tickets", required: "tickets:read" },
        { prefix: "/kanban", required: "kanban:read" },
        { prefix: "/agenda", required: "kanban:read" },
        { prefix: "/reports", required: "metrics:read" },
        { prefix: "/settings/criar-usuario", required: "usuarios:read" },
        { prefix: "/settings", required: "roles:manage" },
    ];

    const getAllowedRoute = (permissions: string[] | undefined) => {
        const match = ROUTE_PERMISSIONS.find((route) => hasPermission(permissions, route.required));
        return match?.prefix ?? "/dashboard";
    };

    const redirectAfterLogin = async (token: string) => {
        try {
            const me = await authApi.me();
            setAuth(me, token);
            router.push(getAllowedRoute(me.permissions));
        } catch {
            router.push("/dashboard");
        }
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem("firstLoginEmail");
        if (storedEmail) {
            setFirstLoginEmail(storedEmail);
        }
        const storedTenantTitle = localStorage.getItem("tenantTitle");
        if (storedTenantTitle) {
            setTenantTitle(storedTenantTitle);
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
                if (isSoftline) {
                    localStorage.setItem("tenantTitle", "SOFT LINE");
                    setTenantTitle("SOFT LINE");
                } else {
                    localStorage.setItem("tenantTitle", "INTERSERVICE USA");
                    setTenantTitle("INTERSERVICE USA");
                }
                
                addNotification({
                    title: "Bem-vindo!",
                    message: `Login realizado com sucesso. Olá, ${data?.user?.name ?? data?.user?.email ?? "usuário"}!`,
                    type: "success",
                    category: "system"
                });
                await redirectAfterLogin(data.token);
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
            localStorage.setItem("tenantTitle", "SOFT LINE");
            setTenantTitle("SOFT LINE");
            addNotification({
                title: "Primeiro acesso concluído",
                message: "Conta criada com sucesso. Você já está logado.",
                type: "success",
                category: "system"
            });
            setIsFirstLoginOpen(false);
            await redirectAfterLogin(data.token);
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <NeonLinesBackground />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 w-full max-w-[420px] p-4">
                <div className="backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden group">
                    
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                    {/* Header Section */}
                    <div className="text-center mb-10 relative">
                        <div className="mb-2">
                            <h1 className="relative text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                                {tenantTitle}
                            </h1>
                        </div>
                        <p className="text-blue-400/80 text-xs font-bold uppercase tracking-[0.2em]">
                            Gestão Inteligente
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Email Input */}
                        <div className="relative group">
                            <Mail className="absolute left-0 bottom-3 text-slate-500 transition-colors duration-300 group-focus-within:text-blue-400 h-5 w-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block py-2.5 pl-8 w-full text-sm text-slate-100 bg-transparent border-0 border-b border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors duration-300 placeholder-transparent"
                                placeholder="Email"
                            />
                            <label className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-8 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-8 peer-focus:scale-75 peer-focus:-translate-y-6">
                                Email Corporativo
                            </label>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <Lock className="absolute left-0 bottom-3 text-slate-500 transition-colors duration-300 group-focus-within:text-blue-400 h-5 w-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block py-2.5 pl-8 pr-8 w-full text-sm text-slate-100 bg-transparent border-0 border-b border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors duration-300 placeholder-transparent"
                                placeholder="Senha"
                            />
                            <label className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-8 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-8 peer-focus:scale-75 peer-focus:-translate-y-6">
                                Senha
                            </label>
                            
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 bottom-3 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsResetOpen(true)}
                                className="text-xs text-slate-400 hover:text-blue-400 transition-colors hover:underline decoration-blue-400/50 underline-offset-4"
                            >
                                Esqueceu sua senha?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-blue-500/40 relative overflow-hidden group"
                            disabled={isLoading}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Entrando...</span>
                                </div>
                            ) : (
                                "ACESSAR SISTEMA"
                            )}
                        </Button>
                    </form>

                    {/* Features Footer */}
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <div className="flex justify-between px-4">
                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                                    <span className="text-lg">🚀</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider group-hover:text-purple-300 transition-colors">Rápido</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                                    <span className="text-lg">💬</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider group-hover:text-blue-300 transition-colors">WhatsApp</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                                    <span className="text-lg">📊</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider group-hover:text-cyan-300 transition-colors">Metrics</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Copyright */}
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-600">
                            © {new Date().getFullYear()} CallSoft. Todos os direitos reservados.
                        </p>
                    </div>
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
