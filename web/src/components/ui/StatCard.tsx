"use client";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "primary" | "secondary" | "accent";
}

const gradients = {
    primary: "gradient-primary",
    secondary: "gradient-secondary",
    accent: "gradient-accent",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "primary" }: StatCardProps) {
    return (
        <Card variant="glass" hoverable className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-400">{title}</p>
                        <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>

                        {trend && (
                            <p className={cn(
                                "mt-2 text-sm font-medium",
                                trend.isPositive ? "text-green-400" : "text-red-400"
                            )}>
                                {trend.isPositive ? "+" : ""}{trend.value}%
                                <span className="ml-1 text-slate-500">vs último mês</span>
                            </p>
                        )}
                    </div>

                    {/* Icon with Gradient Background */}
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        gradients[variant]
                    )}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
