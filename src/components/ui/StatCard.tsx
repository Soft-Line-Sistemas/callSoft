"use client";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/Card";
import { cn } from "../../lib/utils";

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "glass" | "glass-blue" | "glass-purple" | "glass-cyan" | "glass-pink" | "glass-orange";
}

const iconGradients = {
    glass: "bg-white/10",
    "glass-blue": "bg-blue-500/20 text-blue-400",
    "glass-purple": "bg-purple-500/20 text-purple-400",
    "glass-cyan": "bg-cyan-500/20 text-cyan-400",
    "glass-pink": "bg-pink-500/20 text-pink-400",
    "glass-orange": "bg-orange-500/20 text-orange-400",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "glass" }: StatCardProps) {
    return (
        <Card variant={variant} hoverable className="flex flex-col h-full overflow-hidden border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md",
                    iconGradients[variant]
                )}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-white mt-4">{value}</div>
            </CardContent>
            {trend && (
                <CardFooter className="pt-0 mt-auto">
                    <div className="flex items-center gap-2">
                         <span className={cn(
                            "text-sm font-bold px-2 py-0.5 rounded-full",
                            trend.isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {trend.value}%
                        </span>
                        <span className="text-xs text-slate-500">vs último mês</span>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
