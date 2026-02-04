"use client";

import { useState } from "react";
import { Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { NeonLinesBackground } from "@/components/ui/NeonLinesBackground";
import { authApi } from "@/services/auth.service";
import { useNotificationStore } from "@/store/notificationStore";
import { setAuthToken } from "@/lib/auth";

const LEGACY_TENANT_ID = "softlineinfo";

export default function FirstLoginPage() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addNotification({
        title: "Senhas diferentes",
        message: "A nova senha e a confirmação devem ser iguais.",
        type: "error",
        category: "security",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.firstLogin({
        login,
        senha,
        newPassword,
        tenantId: LEGACY_TENANT_ID,
      });

      if (!data?.token) {
        throw new Error("Resposta inválida do servidor");
      }

      setAuthToken(data.token);
      addNotification({
        title: "Primeiro acesso concluido",
        message: "Sua conta foi criada. Você já está logado.",
        type: "success",
        category: "system",
      });

      router.push("/dashboard");
    } catch (error: any) {
      addNotification({
        title: "Falha no primeiro acesso",
        message: error.response?.data?.message || "Nao foi possivel concluir o primeiro acesso.",
        type: "error",
        category: "security",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <NeonLinesBackground />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Card variant="glass-blue" className="border-slate-800/50 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl text-white">Primeiro acesso</CardTitle>
            <CardDescription className="text-slate-400">
              Disponivel apenas para o tenant {LEGACY_TENANT_ID}.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Usuario (legado)</label>
                <Input
                  type="text"
                  placeholder="Usuario"
                  leftIcon={<User className="h-4 w-4 text-slate-400" />}
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Senha (legado)</label>
                <Input
                  type="password"
                  placeholder="Senha"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Nova senha</label>
                <Input
                  type="password"
                  placeholder="Nova senha"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Confirmar nova senha</label>
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-6 shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Criar acesso"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors hover:underline"
                >
                  Voltar para login
                </Link>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center pt-2 pb-6">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} Interservice USA.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
