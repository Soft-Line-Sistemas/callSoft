"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface StatusData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Index signature for Recharts compatibility
}

interface StatusPieChartProps {
    data?: StatusData[];
}

// Cores do design system CALLSOFT
const STATUS_COLORS: Record<string, string> = {
    Solicitado: "#a855f7",      // Roxo - Primary
    "Em Atendimento": "#3b82f6", // Azul
    "Pendente Atendimento": "#f59e0b", // Âmbar - Warning
    Concluido: "#22c55e",       // Verde - Success
    Cancelado: "#ef4444",       // Vermelho - Danger
};

export function StatusPieChart({ data = [] }: StatusPieChartProps) {
    const total = data.reduce((acc, item) => acc + item.value, 0);

    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Sem dados para exibir
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="transparent"
                        />
                    ))}
                </Pie>
                <Legend
                    wrapperStyle={{ color: "#94a3b8" }}
                    formatter={(value) => (
                        <span className="text-slate-300 text-sm">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
