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
import { useProfileStore } from "@/store/profile-store";

export function AppSidebar() {
  const { handleSignOut } = useSessionStore()
  const { profile } = useProfileStore()

  const handleLogout = async () => {
    await handleSignOut()
  }
  const filteredNavigation = navigationLinks.filter(item =>
    item.roles.includes(profile?.isAdmin ? 'admin' : 'student')
  );
  const renderProfileRole = () => {
    const baseClass = 'text-lg uppercase rounded-full font-medium border border-green-500 px-2 w-fit'
    return (
      profile?.isAdmin ?
        <div className={`${baseClass} text-green-500`}>Admin</div>
        : <div className={`${baseClass} text-blue-500`}>Student</div>
    )
  }
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          {filteredNavigation.map((link) => {
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
        <div className="text-xs text-foreground/80 mb-2">
          {renderProfileRole()}
        </div>
        <div className="text-sm font-medium text-foreground line-clamp-1 mb-2">
          {profile?.email || ""}
        </div>
        <Button variant={"destructive"} onClick={handleLogout}>Logout</Button>
      </SidebarFooter>
    </Sidebar>
  )
}