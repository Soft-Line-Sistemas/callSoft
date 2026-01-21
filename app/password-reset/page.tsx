"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import Link from "next/link";

export default function PasswordResetPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { addNotification } = useNotificationStore();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            addNotification({
                title: "Token Inválido",
                message: "O link de redefinição é inválido ou expirou.",
                type: "error",
                category: "security"
            });
            // router.push("/login"); // Optional: redirect immediately or let them see the error
        }
    }, [token, addNotification, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            addNotification({
                title: "Erro",
                message: "As senhas não coincidem.",
                type: "error",
                category: "security"
            });
            return;
        }

        if (password.length < 8) {
             addNotification({
                title: "Erro",
                message: "A senha deve ter no mínimo 8 caracteres.",
                type: "error",
                category: "security"
            });
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/api/v1/auth/password-reset/confirm", {
                token,
                newPassword: password
            });

            addNotification({
                title: "Sucesso",
                message: "Sua senha foi redefinida com sucesso. Faça login.",
                type: "success",
                category: "system"
            });
            router.push("/login");

        } catch (error: any) {
            console.error("Reset error:", error);
            addNotification({
                title: "Erro",
                message: error.response?.data?.message || "Falha ao redefinir senha.",
                type: "error",
                category: "security"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Link Inválido</h2>
                    <p className="text-slate-400 mb-6">Não foi possível verificar o token de redefinição.</p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">Voltar para Login</Button>
                    </Link>
                </div>
             </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
             {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />

            <div className="glass rounded-2xl p-8 max-w-md w-full animate-slide-up z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Redefinir Senha</h1>
                    <p className="text-slate-400">
                        Crie uma nova senha segura para sua conta
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nova Senha
                        </label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 8 caracteres"
                            leftIcon={<Lock className="h-4 w-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            }
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirmar Senha
                        </label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirme a nova senha"
                            leftIcon={<Lock className="h-4 w-4" />}
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                        disabled={isLoading}
                    >
                        {isLoading ? "Redefinindo..." : "Salvar Nova Senha"}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
