"use client";
import { Search, Ticket, Building2 } from "lucide-react";
import { Input } from "../ui/Input";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ticketsApi } from "../../services/tickets.service";
import { empresasApi } from "../../services/empresas.service";
import { useRouter } from "next/navigation";
import type { Ticket as TicketType } from "@/types/ticket.types";
import type { EmpresaResponse } from "../../services/empresas.service";

// Função para destacar texto pesquisado
function highlightText(text: string, searchTerm: string) {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={index} className="bg-yellow-400 text-slate-900 px-0.5 rounded">
                {part}
            </mark>
        ) : (
            part
        )
    );
}

export function SearchDropdown() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce do termo de busca
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Buscar tickets
    const { data: ticketsData } = useQuery({
        queryKey: ['search-tickets', debouncedSearchTerm],
        queryFn: async () => {
            if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return { items: [], total: 0 };
            return await ticketsApi.list({ text: debouncedSearchTerm, pageSize: 5 });
        },
        enabled: debouncedSearchTerm.length >= 2,
    });

    // Buscar empresas
    const { data: empresas } = useQuery({
        queryKey: ['search-empresas', debouncedSearchTerm],
        queryFn: async () => {
            if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
            return await empresasApi.list({ search: debouncedSearchTerm });
        },
        enabled: debouncedSearchTerm.length >= 2,
    });

    const tickets = ticketsData?.items || [];
    const empresasFiltered = (empresas || []).slice(0, 5);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Abrir dropdown quando houver resultados
    useEffect(() => {
        if (debouncedSearchTerm.length >= 2 && (tickets.length > 0 || empresasFiltered.length > 0)) {
            setIsOpen(true);
        } else if (debouncedSearchTerm.length < 2) {
            setIsOpen(false);
        }
    }, [debouncedSearchTerm, tickets.length, empresasFiltered.length]);

    const handleTicketClick = (ticketId: string) => {
        router.push(`/tickets/${ticketId}`);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleEmpresaClick = (codEmp: number) => {
        router.push(`/empresas/${codEmp}`);
        setIsOpen(false);
        setSearchTerm("");
    };

    const hasResults = tickets.length > 0 || empresasFiltered.length > 0;

    return (
        <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
            <Input
                type="search"
                placeholder="Buscar tickets ou empresas..."
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                    if (debouncedSearchTerm.length >= 2 && hasResults) {
                        setIsOpen(true);
                    }
                }}
            />

            {/* Dropdown de resultados */}
            {isOpen && debouncedSearchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50">
                    {!hasResults ? (
                        <div className="p-4 text-center text-slate-400">
                            Nenhum resultado encontrado
                        </div>
                    ) : (
                        <>
                            {/* Tickets */}
                            {tickets.length > 0 && (
                                <div className="border-b border-slate-700">
                                    <div className="px-4 py-2 bg-slate-900 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Tickets
                                    </div>
                                    {tickets.map((ticket: TicketType) => (
                                        <button
                                            key={ticket.id}
                                            onClick={() => handleTicketClick(ticket.id)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-start gap-3 border-b border-slate-700/50 last:border-b-0"
                                        >
                                            <Ticket className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-200 truncate">
                                                    #{ticket.id.slice(0, 8)}
                                                </div>
                                                <div className="text-sm text-slate-400 truncate">
                                                    {highlightText(ticket.nome, debouncedSearchTerm)} - {highlightText(ticket.telefone, debouncedSearchTerm)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 truncate">
                                                    {highlightText(ticket.descricaoSolicitacao, debouncedSearchTerm)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Empresas */}
                            {empresasFiltered.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-slate-900 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Empresas
                                    </div>
                                    {empresasFiltered.map((empresa: EmpresaResponse) => (
                                        <button
                                            key={empresa.codEmp}
                                            onClick={() => handleEmpresaClick(empresa.codEmp)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-start gap-3 border-b border-slate-700/50 last:border-b-0"
                                        >
                                            <Building2 className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-200 truncate">
                                                    {highlightText(empresa.nomeFantasia, debouncedSearchTerm)}
                                                </div>
                                                <div className="text-sm text-slate-400 truncate">
                                                    {highlightText(empresa.razaoSocial, debouncedSearchTerm)}
                                                </div>
                                                {empresa.cnpj && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        CNPJ: {highlightText(empresa.cnpj, debouncedSearchTerm)}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
