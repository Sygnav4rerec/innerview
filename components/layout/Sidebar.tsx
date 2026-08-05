"use client";

import { ScriptInput } from "@/components/stage/ScriptInput";

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={[
        "h-full shrink-0 overflow-hidden border-r border-white/10 bg-neutral-950 transition-all duration-300",
        open ? "w-full md:w-96" : "w-0",
      ].join(" ")}
    >
      <div className="flex h-full w-full flex-col p-4 md:w-96">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Script</h2>
        <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3">
          <ScriptInput />
        </div>
      </div>
    </aside>
  );
}
