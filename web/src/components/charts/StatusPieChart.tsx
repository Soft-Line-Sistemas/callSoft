"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

// Dados mock para desenvolvimento
const mockData: StatusData[] = [
    { name: "Solicitado", value: 45, color: STATUS_COLORS.Solicitado },
    { name: "Em Atendimento", value: 28, color: STATUS_COLORS["Em Atendimento"] },
    { name: "Pendente Atendimento", value: 12, color: STATUS_COLORS["Pendente Atendimento"] },
    { name: "Concluido", value: 89, color: STATUS_COLORS.Concluido },
    { name: "Cancelado", value: 5, color: STATUS_COLORS.Cancelado },
];

export function StatusPieChart({ data = mockData }: StatusPieChartProps) {
    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
                Distribuição por Status
            </h2>
            <div className="h-[300px]">
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
                            label={({ name, percent }) =>
                                `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                            }
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            formatter={(value: number) => [
                                `${value} tickets (${((value / total) * 100).toFixed(1)}%)`,
                                "",
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ color: "#94a3b8" }}
                            formatter={(value) => (
                                <span className="text-slate-300 text-sm">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
