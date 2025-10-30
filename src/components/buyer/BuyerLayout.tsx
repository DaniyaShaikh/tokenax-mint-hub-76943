import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BuyerSidebar } from "./BuyerSidebar";

const BuyerLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BuyerSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-xl font-semibold">TokenaX Buyer Portal</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BuyerLayout;
