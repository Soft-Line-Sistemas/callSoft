"use client";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Gradient */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
                <div className="max-w-md animate-slide-up">
                    <h1 className="text-5xl font-bold text-white mb-6">CALLSOFT</h1>
                    <p className="text-xl text-white/90 mb-8">
                        Sistema de Gestão de Tickets e Integração WhatsApp
                    </p>
                    <div className="space-y-4 text-white/80">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                ✓
                            </div>
                            <p>Gerencie tickets de forma eficiente</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                ✓
                            </div>
                            <p>Integração completa com WhatsApp</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                ✓
                            </div>
                            <p>Relatórios detalhados em tempo real</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-dark">
                <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "100ms" }}>
                    <div className="glass rounded-2xl p-8">
                        {/* Logo Mobile */}
                        <div className="text-center mb-8 lg:hidden">
                            <h1 className="text-3xl font-bold gradient-text">CALLSOFT</h1>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                        <p className="text-slate-400 mb-8">
                            Entre com suas credenciais para acessar o sistema
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Login */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Login
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Digite seu login"
                                    leftIcon={<Mail className="h-4 w-4" />}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Senha
                                </label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                                />
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-700 bg-slate-dark text-purple-600 focus:ring-purple-500 focus:ring-offset-navy-deep"
                                    />
                                    Lembrar-me
                                </label>
                                <a
                                    href="#"
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Esqueceu a senha?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="gradient"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Não tem uma conta?{" "}
                            <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">
                                Entre em contato
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
