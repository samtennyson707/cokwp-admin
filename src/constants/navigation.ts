import { Home, Users, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import type { RefAttributes } from "react";

interface NavItem {
    title: string
    href: string
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export const navigationLinks: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
]