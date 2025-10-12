import { Home, Users, BookOpen, ListChecks, BarChart2, type LucideProps } from "lucide-react";
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
    {
        title: 'Quizzes',
        href: '/quizzes',
        icon: BookOpen,
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
    },
]