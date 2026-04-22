'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  LogOut, 
  LayoutGrid, 
  Building2, 
  Wrench, 
  FileArchive, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'VISÃO_GERAL', icon: LayoutGrid },
    { href: '/dashboard/properties', label: 'IMÓVEIS', icon: Building2 },
    { href: '/dashboard/protocols', label: 'PROTOCOLOS', icon: Wrench },
    { href: '/dashboard/protocols/kanban', label: 'QUADRO_KANBAN', icon: LayoutGrid },
    { href: '/dashboard/reports', label: 'RELATÓRIOS', icon: FileArchive },
  ]

  return (
    <aside 
      className={cn(
        "border-r border-zinc-800 flex-col justify-between hidden lg:flex shrink-0 bg-[#0A0A0B] z-20 relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none"></div>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-500 hover:text-[#FF4500] hover:border-[#FF4500]/50 transition-all z-30 group"
      >
        {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </button>

      <div className={cn("p-8 z-10 transition-all", isCollapsed && "px-4")}>
         <div className={cn(
           "text-2xl font-black tracking-tighter uppercase text-zinc-100 flex items-center gap-3 mb-16 selection:bg-[#FF4500] selection:text-white transition-all",
           isCollapsed && "justify-center"
         )}>
           <span className="w-4 h-4 bg-[#FF4500] transform rotate-45 border border-red-950 shrink-0"></span>
           {!isCollapsed && <span>M_PRO</span>}
         </div>

         <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "group py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center relative transition-all",
                  isCollapsed ? "justify-center px-0" : "px-4 gap-4"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                <item.icon size={16} className="opacity-50 group-hover:opacity-100 shrink-0" /> 
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
         </nav>
      </div>

      <div className={cn("border-t border-zinc-800/50 bg-[#111113] z-10 transition-all", isCollapsed ? "p-4" : "p-8")}>
         <form action="/auth/signout" method="post">
           <button className={cn(
             "flex w-full items-center text-xs font-bold tracking-[0.2em] uppercase text-zinc-600 hover:text-[#FF4500] transition-colors transition-all",
             isCollapsed ? "justify-center px-0" : "px-4 gap-4"
           )}>
             <LogOut size={16} className="shrink-0" /> 
             {!isCollapsed && <span>ENCERRAR_SESSÃO</span>}
           </button>
         </form>
         
         {!isCollapsed && (
           <div className="mt-8 px-4 border-l border-zinc-800">
              <p className="text-[9px] text-zinc-700 tracking-[0.2em] font-bold uppercase mb-1">OPERADOR</p>
              <p className="text-[11px] text-zinc-400 font-mono truncate">{userEmail}</p>
           </div>
         )}
      </div>
    </aside>
  )
}
