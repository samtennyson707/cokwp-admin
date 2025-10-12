import { Home, Users, BookOpen, ListChecks, BarChart2, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import type { RefAttributes } from "react";

interface NavItem {
    title: string
    href: string
    roles: string[]
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export const navigationLinks: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['admin', 'student']
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        roles: ['admin']
    },
    {
        title: 'Quizzes',
        href: '/quizzes',
        icon: BookOpen,
        roles: ['admin', 'student']
    },
    // {
    //     title: 'Questions',
    //     href: '/questions',
    //     icon: ListChecks,
    // },
    {
        title: 'Results',
        href: '/results',
        icon: BarChart2,
        roles: ['admin', 'student']
    },
]