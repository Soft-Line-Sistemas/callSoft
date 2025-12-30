"use client";

import { useRef, useEffect, useState } from "react";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { clearAuthToken } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { UserProfileModal } from "../modals/UserProfileModal";
import { resolveUserPhotoUrl } from "../../lib/media";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Only close if modal is NOT open, otherwise clicking inside modal might trigger this if logic is weird,
        // but actually the modal is an overlay. 
        // If modal is open, we generally don't want the dropdown close logic to interfere or maybe we do want the dropdown to be closed already.
        // If I open the modal, I should probably close the dropdown manually.
        if (!isProfileModalOpen) {
            onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isProfileModalOpen]);

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await api.get('/api/v1/auth/me');
      return res.data?.data;
    },
    retry: false
  });
  const photoUrl = resolveUserPhotoUrl(user?.profilePhotoUrl);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearAuthToken();
      router.push("/login");
      onClose();
    }
  };

  const handleOpenProfile = () => {
      setIsProfileModalOpen(true);
      // We keep the dropdown open? Or close it?
      // If we close it, this component might return null if I don't change the render logic.
      // Strategy: Keep this component rendered but return null for the dropdown part if !isOpen.
      // But keep the Modal part rendered if isProfileModalOpen.
      onClose(); // Close dropdown visual
  };

  return (
    <>
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user}
        isLoadingData={false}
      />
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-16 right-6 w-72 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        >
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 shrink-0 overflow-hidden">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={user?.name || "Usuário"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() ||
                            user?.email?.charAt(0).toUpperCase() ||
                            "U"
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.name || "Usuário"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                {user?.role && (
                    <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 w-fit">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-medium text-purple-300 uppercase">
                            {user.role === 'admin' ? 'Administrador' : user.role}
                        </span>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="p-2 flex flex-col gap-1">
                <button 
                    onClick={handleOpenProfile}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors w-full text-left"
                >
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                </button>
                
                <Link 
                    href="/settings" 
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                </Link>

                <div className="h-px bg-slate-700/50 my-1" />

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </div>
      )}
    </>
  );
}
