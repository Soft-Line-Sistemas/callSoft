"use client";
import { AlertCircle } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon?: React.ReactNode;
    variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
    default: "from-purple-500/20 to-blue-500/20 border-purple-500/30",
    warning: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    danger: "from-red-500/20 to-pink-500/20 border-red-500/30",
    success: "from-green-500/20 to-emerald-500/20 border-green-500/30",
};

const iconVariantStyles = {
    default: "bg-purple-500/20 text-purple-400",
    warning: "bg-amber-500/20 text-amber-400",
    danger: "bg-red-500/20 text-red-400",
    success: "bg-green-500/20 text-green-400",
};

export function KpiCard({
    title,
    value,
    description,
    icon,
    variant = "default",
}: KpiCardProps) {
    return (
        <div
            className={`glass rounded-lg p-6 bg-gradient-to-br ${variantStyles[variant]} border transition-all duration-300 hover:scale-[1.02]`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <p className="text-4xl font-bold text-white">{value}</p>
                    {description && (
                        <p className="text-sm text-slate-400 mt-2">{description}</p>
                    )}
                </div>
                {icon && (
                    <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${iconVariantStyles[variant]}`}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente específico para "Chamados em Aberto"
interface OpenTicketsKpiProps {
    count: number;
}

export function OpenTicketsKpi({ count = 57 }: OpenTicketsKpiProps) {
    return (
        <KpiCard
            title="Chamados em Aberto"
            value={count}
            description="Aguardando atendimento"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="warning"
        />
    );
}
