import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom"
// import Header from "./Header"
// import Header from "./Header"

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-hidden">
        <SidebarTrigger />
        <div className="flex-1 flex flex-col sm:gap-4 sm:py-4 overflow-hidden">
          {/* <Header /> */}
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}