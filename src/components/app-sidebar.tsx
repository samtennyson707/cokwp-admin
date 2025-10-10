import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigationLinks } from "../constants/navigation"
import { Link } from "react-router-dom"
import { UserIcon } from "lucide-react";
import { useSessionStore } from "@/store/session";
import { Button } from "./ui/button";

export function AppSidebar() {
  const { userSession, handleSignOut } = useSessionStore()

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
                <Link to={link.href} className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span>{link.title}</span>
                </Link>
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