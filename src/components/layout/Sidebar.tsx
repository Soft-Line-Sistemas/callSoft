"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Ticket,
    BarChart3,
    Settings,
    Building2,
    LucideIcon,
    User2Icon,
    LogOut,
    KanbanSquare,
    CalendarDays,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { clearAuthToken } from "../../lib/auth";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Empresas", href: "/empresas", icon: Building2 },
    { name: "Kanban", href: "/kanban", icon: KanbanSquare },
    { name: "Agenda", href: "/agenda", icon: CalendarDays },
    // { name: "Contatos WhatsApp", href: "/whatsapp/contatos", icon: ListChecks },
    { name: "Config Chatbot", href: "/whatsapp/config", icon: Settings },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Configurações", href: "/settings", icon: Settings },
    // { name: "Criar Empresa", href: "/settings/criar-empresa", icon: Building2 },
    { name: "Usuario", href: "/settings/criar-usuario", icon: User2Icon },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post("/api/v1/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            clearAuthToken();
            router.push("/login");
        }
    };

    const { data: userProfile } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const res = await api.get('/api/v1/auth/me');
            return res.data;
        },
        retry: false
    });

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass border-r border-white/10">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-white/10">
                <h1 className="text-2xl font-bold gradient-text">CALLSOFT</h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "gradient-primary text-white shadow-lg"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section - User Profile */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-xl p-3 shadow-lg group hover:bg-slate-800/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                            {userProfile?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                            {userProfile?.name || "Usuário"}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${userProfile?.isActive ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-slate-500'}`} />
                                <p className="text-xs text-slate-400 truncate">
                                    {userProfile?.role === 'admin' ? 'Administrador' : (userProfile?.role || 'Online')}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-medium transition-all group-hover:translate-y-0 opacity-80 hover:opacity-100"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
