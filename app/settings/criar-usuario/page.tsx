"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User, Lock, Mail, Upload, X, Image as ImageIcon, Shield, Settings, Database } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/Badge";
import { useNotificationStore } from "@/store/notificationStore";
import { resolveUserPhotoUrl } from "@/lib/media";
import { resolveTenantIdFromEmail } from "@/lib/tenant";
import { useAuthStore } from "@/store/authStore";

export default function UsuariosPage() {
  const { addNotification } = useNotificationStore();
  const authTenantId = useAuthStore((state) => state.user?.tenantId ?? null);
  const authTenantName = useAuthStore((state) => state.user?.tenantName ?? null);
  /* =========================
     STATES – FORM CRIAÇÃO
  ========================== */
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [email, setEmail] = useState("");

  const [op8, setOp8] = useState("");
  const [op91, setOp91] = useState("");
  const [op28, setOp28] = useState("");
  const [op34, setOp34] = useState("0");
  const [op52, setOp52] = useState("0");
  const [estoqueLocal, setEstoqueLocal] = useState("0");

  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedTenantId = email ? resolveTenantIdFromEmail(email) : null;
  const emailTenantMismatch =
    Boolean(email) &&
    Boolean(authTenantId) &&
    Boolean(resolvedTenantId) &&
    resolvedTenantId !== authTenantId;
  const emailTenantInvalid = Boolean(email) && !resolvedTenantId;

  /* =========================
     STATES – EDIÇÃO
  ========================== */
  const [usuarioEdit, setUsuarioEdit] = useState<any>(null);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);

  /* =========================
     QUERY – LISTAR
  ========================== */
  const { data: usuarios = [], refetch, error: usuariosError } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => (await api.get("/api/v1/usuarios")).data.data,
  });

  useEffect(() => {
    if (!usuariosError) return;
    const err = usuariosError as any;
    addNotification({
      title: "Erro",
      message: err?.response?.data?.message || "Falha ao carregar usuários.",
      type: "error",
      category: "users"
    });
  }, [usuariosError, addNotification]);

  /* =========================
     FUNÇÃO UPLOAD FOTO
  ========================== */
  async function uploadFoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/v1/upload/usuario", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.data.caminho; // ex: /uploads/users/tenant/10.jpg
  }

  async function uploadFotoParaUsuario(codUsu: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/api/v1/usuarios/${codUsu}/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.data.caminho;
  }

  /* =========================
     HANDLERS - DRAG AND DROP
  ========================== */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addNotification({
        title: "Atenção",
        message: "Selecione um arquivo de imagem válido.",
        type: "warning",
        category: "users"
      });
      return;
    }
    
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFoto(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     MUTATION – CRIAR
  ========================== */
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        login,
        senha,
        email: email ? email.toLowerCase() : null,
        op8,
        op91,
        op28,
        op34,
        op52,
        estoqueLocal,
      };

      const res = await api.post("/api/v1/usuarios", payload);
      
      // Se houver foto, fazer upload e associar (se a API permitir update logo em seguida)
      if (foto && res.data.success && res.data.data.codUsu) {
          try {
             await uploadFotoParaUsuario(res.data.data.codUsu, foto);
          } catch (e) {
             console.error("Erro ao fazer upload da foto após registro", e);
             addNotification({
               title: "Atenção",
               message: "Usuário criado, mas falhou o upload da foto.",
               type: "warning",
               category: "users"
             });
          }
      }
      
      return res;
    },
    onSuccess: () => {
      setLogin("");
      setSenha("");
      setEmail("");
      setFoto(null);
      setPreview(null);
      // Resetar outros campos legados visualmente
      setOp8("");
      setOp91("");
      setOp28("");
      setOp34("0");
      setOp52("0");
      setEstoqueLocal("0");
      
      refetch();
      addNotification({
        title: "Sucesso",
        message: "Usuário criado com sucesso!",
        type: "success",
        category: "users"
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error.response?.data?.message || "Falha ao criar usuário. Verifique os dados.",
        type: "error",
        category: "users"
      });
    },
  });

  /* =========================
     MUTATION – EDITAR
  ========================== */
  const updateMutation = useMutation({
    mutationFn: async () => {
      let caminhoWeb = usuarioEdit.caminhoWeb;

      if (novaFoto) {
        caminhoWeb = await uploadFotoParaUsuario(usuarioEdit.codUsu, novaFoto);
      }

      return api.put(`/api/v1/usuarios/${usuarioEdit.codUsu}`, {
        login: usuarioEdit.login,
        senha: usuarioEdit.senha || undefined,
        email: usuarioEdit.email ? String(usuarioEdit.email).toLowerCase() : null,
        caminhoWeb,
      });
    },
    onSuccess: () => {
      setUsuarioEdit(null);
      setNovaFoto(null);
      refetch();
      addNotification({
        title: "Sucesso",
        message: "Usuário atualizado com sucesso!",
        type: "success",
        category: "system"
      });
    },
    onError: () => {
      addNotification({
        title: "Erro",
        message: "Falha ao atualizar usuário.",
        type: "error",
        category: "system"
      });
    },
  });

  /* =========================
     INATIVAR
  ========================== */
  async function inativarUsuario(id: number) {
    try {
      await api.patch(`/api/v1/usuarios/${id}/inativar`);
      refetch();
      addNotification({
        title: "Sucesso",
        message: "Usuário inativado.",
        type: "success",
        category: "users"
      });
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao inativar usuário.",
        type: "error",
        category: "users"
      });
    }
  }

  /* =========================
     COMPONENTE SWITCH CUSTOMIZADO
  ========================== */
  function SwitchCard({ 
    label, 
    checked, 
    onChange, 
    icon: Icon 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: (val: boolean) => void;
    icon: any;
  }) {
    return (
      <div 
        onClick={() => onChange(!checked)}
        className={`
          cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
          ${checked 
            ? "bg-purple-500/10 border-purple-500/50" 
            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"}
        `}
      >
        <div className={`
          p-2 rounded-lg transition-colors
          ${checked ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-400"}
        `}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${checked ? "text-purple-400" : "text-slate-300"}`}>
            {label}
          </p>
        </div>
        <div className={`
          w-5 h-5 rounded border flex items-center justify-center transition-colors
          ${checked ? "bg-purple-500 border-purple-500" : "border-slate-600"}
        `}>
          {checked && <X size={14} className="text-white rotate-45 transform origin-center scale-125" style={{ transform: "rotate(0deg)" }} />}
          {/* Using X but styled as checkmark or just filled box */}
          {checked && <div className="w-2.5 h-2.5 bg-white rounded-[1px]" />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-deep">
      <Sidebar />
      <Header />

      <main className="ml-64 mt-16 p-8 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Gerenciamento de Usuários</h1>
          <p className="text-slate-400 mt-2">Crie e gerencie o acesso ao sistema</p>
        </div>

        <Tabs defaultValue="criar">
          <TabsList className="mb-8 bg-slate-800/50 p-1 border border-slate-700/50">
            <TabsTrigger 
              value="criar" 
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Novo Usuário
            </TabsTrigger>
            <TabsTrigger 
              value="listar" 
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Listar Usuários
            </TabsTrigger>
          </TabsList>

          {/* =========================
             ABA CRIAR
          ========================== */}
          <TabsContent value="criar" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* DADOS BÁSICOS: FOTO E CREDENCIAIS LADO A LADO */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* FOTO (ESQUERDA) */}
                <div className="md:col-span-5 lg:col-span-4">
                  <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm overflow-hidden h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Foto do Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                          flex flex-col items-center justify-center gap-4 group overflow-hidden
                          ${isDragging 
                            ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
                            : "border-slate-700 hover:border-slate-500 hover:bg-slate-700/30 bg-slate-900/50"}
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />

                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-medium flex items-center gap-2">
                                <Upload size={18} /> Alterar foto
                              </p>
                            </div>
                            <button
                              onClick={removePhoto}
                              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-6 space-y-4">
                            <div className={`
                              w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto transition-colors
                              ${isDragging ? "bg-purple-500 text-white" : "text-slate-400 group-hover:text-purple-400"}
                            `}>
                              <Upload size={32} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-200">Arraste uma foto aqui</p>
                              <p className="text-sm text-slate-500 mt-1">ou clique para selecionar</p>
                            </div>
                            <p className="text-xs text-slate-600">JPG, PNG até 5MB</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CREDENCIAIS (DIREITA) */}
                <div className="md:col-span-7 lg:col-span-8">
                  <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Credenciais de Acesso
                      </CardTitle>
                      <CardDescription>Defina o login e senha para este usuário</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Nome de Usuário</label>
                        <Input 
                          placeholder="Ex: joaosilva" 
                          value={login} 
                          onChange={e => setLogin(e.target.value)}
                          leftIcon={<User size={18} />}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Senha de Acesso</label>
                        <Input 
                          placeholder="Mínimo 8 caracteres" 
                          value={senha} 
                          onChange={e => setSenha(e.target.value)}
                          leftIcon={<Lock size={18} />}
                          type="password"
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Email Corporativo</label>
                        <Input 
                          placeholder="joao@empresa.com" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)}
                          leftIcon={<Mail size={18} />}
                          type="email"
                        />
                        {emailTenantInvalid && (
                          <p className="text-xs text-amber-400">
                            Informe um email válido no formato usuario@tenant.com.
                          </p>
                        )}
                        {emailTenantMismatch && (
                          <p className="text-xs text-amber-400">
                            O domínio do email não corresponde a {(authTenantName || authTenantId) ?? "este tenant"}.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* PERMISSÕES (ABAIXO) */}
              <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Permissões e Acesso
                  </CardTitle>
                  <CardDescription>Defina o que este usuário pode acessar no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <SwitchCard 
                      label="Cadastrar Usuários" 
                      checked={op8 === "X"} 
                      onChange={checked => setOp8(checked ? "X" : "")}
                      icon={User}
                    />
                    <SwitchCard 
                      label="Administrador" 
                      checked={op91 === "X"} 
                      onChange={checked => setOp91(checked ? "X" : "")}
                      icon={Shield}
                    />
                    <SwitchCard 
                      label="Configurações" 
                      checked={op28 === "X"} 
                      onChange={checked => setOp28(checked ? "X" : "")}
                      icon={Settings}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Settings size={14} /> Nível Op. 34 (0-4)
                      </label>
                      <Input 
                        value={op34} 
                        onChange={e => setOp34(e.target.value)}
                        className="text-center font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Settings size={14} /> Nível Op. 52 (0-4)
                      </label>
                      <Input 
                        value={op52} 
                        onChange={e => setOp52(e.target.value)}
                        className="text-center font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Database size={14} /> Estoque Local (0-8)
                      </label>
                      <Input 
                        value={estoqueLocal} 
                        onChange={e => setEstoqueLocal(e.target.value)}
                        className="text-center font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={
                    !login.trim() ||
                    !email ||
                    senha.length < 8 ||
                    emailTenantMismatch ||
                    emailTenantInvalid ||
                    createMutation.isPending
                  }
                  className="w-full md:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/20"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* =========================
             ABA LISTAR
          ========================== */}
          <TabsContent value="listar">
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {usuarios.map((u: any) => (
                      <tr key={u.codUsu} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {u.caminhoWeb ? (
                              <img
                                src={resolveUserPhotoUrl(u.caminhoWeb) || undefined}
                                className="w-10 h-10 rounded-full object-cover border border-slate-600"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                <User size={20} />
                              </div>
                            )}
                            <span className="font-medium text-slate-200">{u.login}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{u.email || "-"}</td>
                        <td className="px-6 py-4">
                          {u.inativo === "X" ? (
                             <Badge variant="error">Inativo</Badge>
                          ) : (
                             <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Ativo</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => setUsuarioEdit(u)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" onClick={() => inativarUsuario(u.codUsu)}>
                            Inativar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* =========================
         MODAL EDITAR
      ========================== */}
      <Dialog open={!!usuarioEdit} onOpenChange={() => setUsuarioEdit(null)}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 justify-center mb-6">
                 {usuarioEdit?.caminhoWeb && !novaFoto && (
                    <img
                      src={resolveUserPhotoUrl(usuarioEdit.caminhoWeb) || undefined}
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                    />
                  )}
                  {novaFoto && (
                     <img
                      src={URL.createObjectURL(novaFoto)}
                      className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                    />
                  )}
                  
                  <div className="flex flex-col gap-2">
                     <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm border border-slate-600 transition-colors text-center">
                        Alterar Foto
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) setNovaFoto(file);
                            }}
                        />
                     </label>
                  </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-slate-400">Usuário</label>
                <Input
                    value={usuarioEdit?.login || ""}
                    onChange={e => setUsuarioEdit({ ...usuarioEdit, login: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-slate-400">Nova Senha</label>
                <Input
                    placeholder="Deixe em branco para manter a atual"
                    type="password"
                    onChange={e => setUsuarioEdit({ ...usuarioEdit, senha: e.target.value })}
                />
            </div>

            <Button onClick={() => updateMutation.mutate()} className="w-full mt-4 bg-purple-600 hover:bg-purple-500">
                Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
