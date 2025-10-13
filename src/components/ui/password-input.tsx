import * as React from "react"
import { Eye, EyeOff } from "lucide-react";

function PasswordInput() {
    //   return (
    //     <input
    //       className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
    //       type={type}
    //       {...props}
    //     />
    //   )

    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pr-10" // Add padding to make space for the icon
            />
            <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </span>
        </div>
    );
}

export { PasswordInput }