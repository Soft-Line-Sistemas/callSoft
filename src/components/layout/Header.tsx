"use client";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useNotificationStore } from "../../store/notificationStore";
import { NotificationDropdown } from "./NotificationDropdown";
import { useEffect, useState } from "react";
import { UserDropdown } from "./UserDropdown";
import { SearchDropdown } from "./SearchDropdown";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { resolveUserPhotoUrl } from "../../lib/media";

export function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { unreadCount, initialize } = useNotificationStore();

   const [isDropdownOpenUser, setIsDropdownOpenUser] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const res = await api.get('/api/v1/auth/me');
            return res.data?.data;
        },
        retry: false
    });
    const photoUrl = resolveUserPhotoUrl(user?.profilePhotoUrl);

    useEffect(() => {
        void initialize();
    }, [initialize]);
    

    return (
        <header className="fixed left-64 right-0 top-0 z-30 h-16 glass border-b border-white/10">
            <div className="flex h-full items-center justify-between px-6">
                {/* Search Bar */}
                <SearchDropdown />

                {/* Actions */}
                <div className="flex items-center gap-3 relative">
                    {/* Notifications */}
                    <Button 
                        variant="ghost-glass" 
                        size="icon" 
                        className="relative"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </Button>

                    <NotificationDropdown 
                        isOpen={isDropdownOpen} 
                        onClose={() => setIsDropdownOpen(false)} 
                    />

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpenUser(!isDropdownOpenUser)}
                            className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-shadow overflow-hidden ring-2 ring-slate-700/50"
                        >
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={user?.name || "Usuário"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </button>

                        <UserDropdown
                            isOpen={isDropdownOpenUser}
                            onClose={() => setIsDropdownOpenUser(false)}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
