"use client";
import { Search, Bell, User } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/button";

export function Header() {
    return (
        <header className="fixed left-64 right-0 top-0 z-30 h-16 glass border-b border-white/10">
            <div className="flex h-full items-center justify-between px-6">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <Input
                        type="search"
                        placeholder="Buscar tickets, clientes, pedidos..."
                        leftIcon={<Search className="h-4 w-4" />}
                        className="w-full"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Button variant="ghost-glass" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>

                    {/* User Menu */}
                    <Button variant="ghost-glass" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
