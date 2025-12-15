import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputVariants = cva(
    "flex w-full rounded-lg border px-4 py-2.5 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-slate-dark border-slate-700 text-slate-100 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent",
                error:
                    "bg-slate-dark border-red-500 text-slate-100 focus-visible:ring-2 focus-visible:ring-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, type, leftIcon, rightIcon, ...props }, ref) => {
        if (leftIcon || rightIcon) {
            return (
                <div className="relative w-full">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            inputVariants({ variant }),
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <input
                type={type}
                className={cn(inputVariants({ variant }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
