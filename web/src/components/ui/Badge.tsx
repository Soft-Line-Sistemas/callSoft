import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all",
    {
        variants: {
            variant: {
                success: "bg-green-500/10 text-green-400 border border-green-500/20",
                warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                error: "bg-red-500/10 text-red-400 border border-red-500/20",
                info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                default: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
                whatsapp: "bg-whatsapp/10 text-whatsapp border border-whatsapp/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
