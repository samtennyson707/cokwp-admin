import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigationLinks } from "../constants/navigation"
import { NavLink } from "react-router-dom"
import { useSessionStore } from "@/store/session";
import { Button } from "./ui/button";

export function AppSidebar() {
  const { handleSignOut } = useSessionStore()

  const handleLogout = async () => {
    await handleSignOut()
  }
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <SidebarMenuItem key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2 py-1.5 ${isActive ? 'bg-muted text-foreground' : 'text-foreground/80 hover:text-foreground'}`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.title}</span>
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant={"destructive"} onClick={handleLogout}>Logout</Button>
      </SidebarFooter>
    </Sidebar>
  )
}