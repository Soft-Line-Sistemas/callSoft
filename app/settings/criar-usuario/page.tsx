"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../src/lib/api";

import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";

import { Card, CardHeader, CardTitle, CardContent } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../src/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../src/components/ui/dialog";
export default function UsuariosPage() {
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

  /* =========================
     STATES – EDIÇÃO
  ========================== */
  const [usuarioEdit, setUsuarioEdit] = useState<any>(null);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);

  /* =========================
     QUERY – LISTAR
  ========================== */
  const { data: usuarios = [], refetch } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => (await api.get("/usuarios")).data,
  });

  /* =========================
     FUNÇÃO UPLOAD FOTO
  ========================== */
  async function uploadFoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/upload/usuario", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.caminho; // ex: /uploads/usuarios/10.jpg
  }

  /* =========================
     MUTATION – CRIAR
  ========================== */
  const createMutation = useMutation({
    mutationFn: async () => {
      let caminhoFoto = null;

      if (foto) {
        caminhoFoto = await uploadFoto(foto);
      }

      return api.post("/usuarios", {
        Usuario: login,
        Senha: senha,
        EMail: email.toLowerCase(),
        CaminhoFoto: caminhoFoto,

        Op8: op8,
        Op91: op91,
        Op28: op28,
        Op34: op34,
        Op52: op52,
        EstoqueLocal: estoqueLocal,
      });
    },
    onSuccess: () => {
      setLogin("");
      setSenha("");
      setEmail("");
      setFoto(null);
      setPreview(null);
      refetch();
    },
  });

  /* =========================
     MUTATION – EDITAR
  ========================== */
  const updateMutation = useMutation({
    mutationFn: async () => {
      let caminhoFoto = usuarioEdit.caminhoFoto;

      if (novaFoto) {
        caminhoFoto = await uploadFoto(novaFoto);
      }

      return api.put(`/usuarios/${usuarioEdit.codUsu}`, {
        ...usuarioEdit,
        CaminhoFoto: caminhoFoto,
      });
    },
    onSuccess: () => {
      setUsuarioEdit(null);
      setNovaFoto(null);
      refetch();
    },
  });

  /* =========================
     INATIVAR
  ========================== */
  async function inativarUsuario(id: number) {
    await api.patch(`/usuarios/${id}/inativar`);
    refetch();
  }

  /* =========================
     CHECKBOX PADRÃO LEGADO
  ========================== */
  function flag(value: string, setter: Function) {
    return (
      <input
        type="checkbox"
        checked={value === "X"}
        onChange={e => setter(e.target.checked ? "X" : "")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-deep">
      <Sidebar />
      <Header />

      <main className="ml-64 mt-16 p-6 max-w-6xl mx-auto">
        <Tabs defaultValue="criar">
          <TabsList>
            <TabsTrigger value="criar">Criar Usuário</TabsTrigger>
            <TabsTrigger value="listar">Listar Usuários</TabsTrigger>
          </TabsList>

          {/* =========================
             ABA CRIAR
          ========================== */}
          <TabsContent value="criar">
            <Card>
              <CardHeader>
                <CardTitle>Novo Usuário</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Input placeholder="Usuário" value={login} onChange={e => setLogin(e.target.value)} />
                <Input placeholder="Senha (4 números)" value={senha} onChange={e => setSenha(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

                {/* FOTO */}
                <div className="space-y-2">
                  <label className="text-sm">Foto do usuário</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFoto(file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />

                  {preview && (
                    <img
                      src={preview}
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  )}
                </div>

                {/* PERMISSÕES */}
                <div className="grid grid-cols-2 gap-4">
                  <label>{flag(op8, setOp8)} Cadastro Usuários</label>
                  <label>{flag(op91, setOp91)} Administrador</label>
                  <label>{flag(op28, setOp28)} Configurações</label>
                </div>

                <Input placeholder="Op34 (0-4)" value={op34} onChange={e => setOp34(e.target.value)} />
                <Input placeholder="Op52 (0-4)" value={op52} onChange={e => setOp52(e.target.value)} />
                <Input placeholder="EstoqueLocal (0-8)" value={estoqueLocal} onChange={e => setEstoqueLocal(e.target.value)} />

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!login || !/^\d{4}$/.test(senha)}
                >
                  Salvar Usuário
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========================
             ABA LISTAR
          ========================== */}
          <TabsContent value="listar">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u: any) => (
                  <tr key={u.codUsu}>
                    <td>
                      {u.caminhoFoto && (
                        <img
                          src={u.caminhoFoto}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                    </td>
                    <td>{u.login}</td>
                    <td>{u.email}</td>
                    <td>{u.inativo === "X" ? "Não" : "Sim"}</td>
                    <td className="flex gap-2">
                      <Button size="sm" onClick={() => setUsuarioEdit(u)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => inativarUsuario(u.codUsu)}>
                        Inativar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </main>

      {/* =========================
         MODAL EDITAR
      ========================== */}
      <Dialog open={!!usuarioEdit} onOpenChange={() => setUsuarioEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>

          <Input
            value={usuarioEdit?.login || ""}
            onChange={e => setUsuarioEdit({ ...usuarioEdit, login: e.target.value })}
          />

          <Input
            placeholder="Nova senha (4 números)"
            onChange={e => setUsuarioEdit({ ...usuarioEdit, senha: e.target.value })}
          />

          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) setNovaFoto(file);
            }}
          />

          {usuarioEdit?.caminhoFoto && (
            <img
              src={usuarioEdit.caminhoFoto}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}

          <Button onClick={() => updateMutation.mutate()}>
            Salvar Alterações
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}