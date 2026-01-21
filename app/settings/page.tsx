"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useNotificationStore, NotificationCategory } from "@/store/notificationStore";
import { rolesApi } from "@/services/roles.service";
import { usersApi } from "@/services/users.service";
import { Bell, Shield, Users, Server, DollarSign, MessageSquare, Kanban } from "lucide-react";
import WhatsAppContatosPage from "../whatsapp/contatos/page";
import { getKanbanSyncEnabled, setKanbanSyncDisabled } from "@/lib/kanban-sync";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const { preferences, togglePreference } = useNotificationStore();
  const [newRoleName, setNewRoleName] = useState("");
  const [roleEdits, setRoleEdits] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserRoleIds, setSelectedUserRoleIds] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [rolesMessage, setRolesMessage] = useState("");
  const [usersMessage, setUsersMessage] = useState("");
  const [permissionsMessage, setPermissionsMessage] = useState("");
  const [kanbanSyncEnabled, setKanbanSyncEnabled] = useState(getKanbanSyncEnabled());

  const notificationSettings = [
    {
      id: 'users',
      title: 'Gerenciamento de Usuários',
      description: 'Receba alertas sobre criação, edição e exclusão de usuários.',
      icon: Users,
    },
    {
      id: 'system',
      title: 'Sistema e Manutenção',
      description: 'Avisos sobre status do sistema, atualizações e manutenções.',
      icon: Server,
    },
    {
      id: 'security',
      title: 'Segurança',
      description: 'Alertas de login, tentativas de acesso e alterações de senha.',
      icon: Shield,
    },
    {
      id: 'financial',
      title: 'Financeiro',
      description: 'Notificações sobre faturas, pagamentos e relatórios.',
      icon: DollarSign,
    },
    {
      id: 'tickets',
      title: 'Tickets e Suporte',
      description: 'Atualizações sobre chamados e interações de suporte.',
      icon: MessageSquare,
    },
  ];

  const {
    data: roles = [],
    refetch: refetchRoles,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ["roles-permissions"],
    queryFn: () => rolesApi.listPermissions(),
  });

  const {
    data: usersResponse,
    refetch: refetchUsers,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list({ page: 1, pageSize: 200 }),
  });

  const users = usersResponse?.items ?? [];

  const roleNameToId = useMemo(() => {
    return new Map(roles.map((role) => [role.name, role.id]));
  }, [roles]);

  const sortedPermissions = useMemo(() => [...permissions].sort(), [permissions]);
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {};
    sortedPermissions.forEach((permission) => {
      const groupKey = permission === "*" ? "Sistema" : permission.split(":")[0];
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(permission);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [sortedPermissions]);

  useEffect(() => {
    setRoleEdits((prev) => {
      const next: Record<string, string> = {};
      roles.forEach((role) => {
        next[role.id] = prev[role.id] ?? role.name;
      });
      return next;
    });
  }, [roles]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserRoleIds([]);
      return;
    }

    const user = users.find((item) => item.id === selectedUserId);
    const roleIds = (user?.roles ?? [])
      .map((roleName) => roleNameToId.get(roleName))
      .filter((roleId): roleId is string => Boolean(roleId));
    setSelectedUserRoleIds(roleIds);
  }, [selectedUserId, users, roleNameToId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedRolePermissions([]);
      return;
    }
    const role = roles.find((item) => item.id === selectedRoleId);
    setSelectedRolePermissions(role?.permissions ?? []);
    setPermissionsMessage("");
  }, [selectedRoleId, roles]);

  useEffect(() => {
    setUsersMessage("");
  }, [selectedUserId]);

  const createRoleMutation = useMutation({
    mutationFn: () => rolesApi.create({ name: newRoleName.trim() }),
    onSuccess: () => {
      setNewRoleName("");
      setRolesMessage("Cargo criado com sucesso.");
      void refetchRoles();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: { name?: string; permissions?: string[] } }) =>
      rolesApi.update(roleId, payload),
    onSuccess: () => {
      setRolesMessage("Cargo atualizado com sucesso.");
      void refetchRoles();
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      rolesApi.update(roleId, { permissions }),
    onSuccess: () => {
      setPermissionsMessage("Permissões atualizadas.");
      void refetchRoles();
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => rolesApi.remove(roleId),
    onSuccess: () => {
      setRolesMessage("Cargo removido.");
      void refetchRoles();
    },
  });

  const updateUserRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) => usersApi.updateRoles(userId, roleIds),
    onSuccess: () => {
      setUsersMessage("Cargos do usuário atualizados.");
      void refetchUsers();
    },
  });

  const handleKanbanSyncToggle = () => {
    const newValue = !kanbanSyncEnabled;
    setKanbanSyncEnabled(newValue);
    setKanbanSyncDisabled(!newValue);
    toast.success(
      newValue
        ? "Sincronização com Kanban ativada."
        : "Sincronização com Kanban desativada."
    );
  };

  return (
    <div className="min-h-screen bg-navy-deep">
      <Sidebar />
      <Header />

      <main className="ml-64 mt-16 p-8 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Configurações</h1>
          <p className="text-slate-400 mt-2">Gerencie as preferências do sistema</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-slate-800/50 p-1 border border-slate-700/50">
            <TabsTrigger 
              value="general"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Notificações
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Segurança
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              WhatsApp
            </TabsTrigger>
            <TabsTrigger 
              value="roles"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Cargos
            </TabsTrigger>
            <TabsTrigger 
              value="permissions"
              className="px-6 py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha quais tipos de alertas você deseja receber no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-slate-700/50">
                  {notificationSettings.map((setting) => {
                    const Icon = setting.icon;
                    return (
                      <div key={setting.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{setting.title}</p>
                            <p className="text-sm text-slate-400">{setting.description}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={preferences[setting.id as NotificationCategory]}
                          onCheckedChange={() => void togglePreference(setting.id as NotificationCategory)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Kanban className="w-5 h-5 text-purple-400" />
                  Integrações
                </CardTitle>
                <CardDescription>
                  Configure como diferentes partes do sistema interagem entre si.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-slate-700/50">
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300">
                        <Kanban size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">Sincronização com Kanban</p>
                        <p className="text-sm text-slate-400">
                          Quando o status de um ticket mudar, perguntar se deseja mover o cartão correspondente no Kanban
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={kanbanSyncEnabled}
                      onCheckedChange={handleKanbanSyncToggle}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center text-slate-400">
                <p>Configurações de segurança em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="whatsapp">
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center text-slate-400">
               <WhatsAppContatosPage />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="space-y-6">
              <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Gerenciar cargos</CardTitle>
                  <CardDescription>Crie, renomeie e remova cargos da sua organização.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      placeholder="Nome do cargo"
                      value={newRoleName}
                      onChange={(event) => setNewRoleName(event.target.value)}
                      className="sm:max-w-xs"
                    />
                    <Button
                      variant="gradient"
                      onClick={() => createRoleMutation.mutate()}
                      disabled={!newRoleName.trim() || createRoleMutation.isPending}
                      isLoading={createRoleMutation.isPending}
                    >
                      Adicionar cargo
                    </Button>
                  </div>
                  {rolesMessage ? <p className="text-sm text-emerald-300">{rolesMessage}</p> : null}
                  <div className="divide-y divide-slate-700/50">
                    {rolesLoading ? (
                      <div className="py-4 text-sm text-slate-400">Carregando cargos...</div>
                    ) : roles.length === 0 ? (
                      <div className="py-4 text-sm text-slate-400">Nenhum cargo cadastrado.</div>
                    ) : (
                      roles.map((role) => {
                        const editedName = roleEdits[role.id] ?? role.name;
                        const canSave = editedName.trim() && editedName.trim() !== role.name;
                        const isAdmin = role.name.toLowerCase() === "admin";
                        return (
                          <div key={role.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                              <Input
                                value={editedName}
                                onChange={(event) =>
                                  setRoleEdits((prev) => ({ ...prev, [role.id]: event.target.value }))
                                }
                                className="sm:max-w-xs"
                              />
                              <span className="text-xs text-slate-400">
                                {role.permissions.length} permissões
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!canSave || updateRoleMutation.isPending}
                                onClick={() =>
                                  updateRoleMutation.mutate({ roleId: role.id, payload: { name: editedName.trim() } })
                                }
                              >
                                Salvar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isAdmin || deleteRoleMutation.isPending}
                                onClick={() => deleteRoleMutation.mutate(role.id)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Atribuir cargos aos usuários</CardTitle>
                  <CardDescription>Selecione um usuário e ajuste seus cargos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:max-w-md"
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                    >
                      <option value="">Selecione um usuário</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="gradient"
                      onClick={() =>
                        selectedUserId &&
                        updateUserRolesMutation.mutate({ userId: selectedUserId, roleIds: selectedUserRoleIds })
                      }
                      disabled={!selectedUserId || updateUserRolesMutation.isPending}
                      isLoading={updateUserRolesMutation.isPending}
                    >
                      Salvar cargos
                    </Button>
                  </div>
                  {usersMessage ? <p className="text-sm text-emerald-300">{usersMessage}</p> : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {usersLoading ? (
                      <div className="text-sm text-slate-400">Carregando usuários...</div>
                    ) : (
                      roles.map((role) => {
                        const checked = selectedUserRoleIds.includes(role.id);
                        return (
                          <label
                            key={role.id}
                            className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-sm text-slate-200"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                              checked={checked}
                              onChange={() =>
                                setSelectedUserRoleIds((prev) =>
                                  checked ? prev.filter((id) => id !== role.id) : [...prev, role.id],
                                )
                              }
                              disabled={!selectedUserId}
                            />
                            <span>{role.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Permissões por cargo</CardTitle>
                <CardDescription>
                  Selecione um cargo e ajuste as permissões disponíveis na aplicação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:max-w-md"
                    value={selectedRoleId}
                    onChange={(event) => setSelectedRoleId(event.target.value)}
                  >
                    <option value="">Selecione um cargo</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="gradient"
                    onClick={() =>
                      selectedRoleId &&
                      updatePermissionsMutation.mutate({
                        roleId: selectedRoleId,
                        permissions: selectedRolePermissions,
                      })
                    }
                    disabled={!selectedRoleId || updatePermissionsMutation.isPending}
                    isLoading={updatePermissionsMutation.isPending}
                  >
                    Salvar permissões
                  </Button>
                </div>
                {permissionsMessage ? <p className="text-sm text-emerald-300">{permissionsMessage}</p> : null}
                <div className="text-xs text-slate-400">
                  As permissões são aplicadas em novos logins. Usuários ativos precisam sair e entrar novamente.
                </div>
                <div className="space-y-3">
                  {groupedPermissions.map(([group, groupPermissions]) => {
                    const allSelected = groupPermissions.every((perm) => selectedRolePermissions.includes(perm));
                    return (
                      <details
                        key={group}
                        className="rounded-lg border border-slate-700/50 bg-slate-900/40"
                      >
                        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-slate-200">
                          <span className="font-medium">{group}</span>
                          <button
                            type="button"
                            className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700/60"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setSelectedRolePermissions((prev) => {
                                if (allSelected) {
                                  return prev.filter((perm) => !groupPermissions.includes(perm));
                                }
                                const merged = new Set([...prev, ...groupPermissions]);
                                return Array.from(merged);
                              });
                            }}
                            disabled={!selectedRoleId}
                          >
                            {allSelected ? "Remover tudo" : "Selecionar tudo"}
                          </button>
                        </summary>
                        <div className="grid gap-3 border-t border-slate-700/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                          {groupPermissions.map((permission) => {
                            const checked = selectedRolePermissions.includes(permission);
                            return (
                              <label
                                key={permission}
                                className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-sm text-slate-200"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                                  checked={checked}
                                  onChange={() =>
                                    setSelectedRolePermissions((prev) =>
                                      checked ? prev.filter((item) => item !== permission) : [...prev, permission],
                                    )
                                  }
                                  disabled={!selectedRoleId}
                                />
                                <span>{permission}</span>
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
