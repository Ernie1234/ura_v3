import React from "react";
import Sidebar from "@/components/nav/Sidebar";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center gap-4 bg-slate-100 mt-16 p-4 w-full h-[calc(100vh-4rem)]">
      <div className="md:block hidden">
        <Sidebar />
      </div>
      <main className="flex bg-slate-100 rounded-lg w-full h-full max-h-min">
        {children}
      </main>
    </div>
  );
}

export default layout;
