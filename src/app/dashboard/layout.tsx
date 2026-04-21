import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogOut, LayoutGrid, Building2, Wrench, FileArchive } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-zinc-100 font-mono antialiased overflow-hidden">
      {/* Sidebar - Thick borders, raw shapes */}
      <aside className="w-72 border-r border-zinc-800 flex-col justify-between hidden lg:flex shrink-0 bg-[#0A0A0B] z-10 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none"></div>
        <div className="p-8 z-10">
           <div className="text-2xl font-black tracking-tighter uppercase text-zinc-100 flex items-center gap-3 mb-16 selection:bg-[#FF4500] selection:text-white">
             <span className="w-4 h-4 bg-[#FF4500] transform rotate-45 border border-red-950"></span>
             M_PRO
           </div>
                       <nav className="flex flex-col space-y-4">
               {/* Navigation Links - brutalist hover effects */}
               <Link href="/dashboard" className="group px-4 py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-4 relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                 <LayoutGrid size={16} className="opacity-50 group-hover:opacity-100" /> VISÃO_GERAL
               </Link>
               <Link href="/dashboard/properties" className="group px-4 py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-4 relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                 <Building2 size={16} className="opacity-50 group-hover:opacity-100" /> IMÓVEIS
               </Link>
               <Link href="/dashboard/protocols" className="group px-4 py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-4 relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                 <Wrench size={16} className="opacity-50 group-hover:opacity-100" /> PROTOCOLOS
               </Link>
               <Link href="/dashboard/protocols/kanban" className="group px-4 py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-4 relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                 <LayoutGrid size={16} className="opacity-50 group-hover:opacity-100" /> QUADRO_KANBAN
               </Link>
               <Link href="/dashboard/reports" className="group px-4 py-3 text-xs tracking-[0.2em] font-bold uppercase text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-4 relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#FF4500] transition-all group-hover:h-full"></span>
                 <FileArchive size={16} className="opacity-50 group-hover:opacity-100" /> RELATÓRIOS
               </Link>
             </nav>
          </div>
  
          <div className="p-8 border-t border-zinc-800/50 bg-[#111113] z-10">
             <form action="/auth/signout" method="post">
               <button className="flex w-full items-center gap-4 px-4 py-3 text-xs font-bold tracking-[0.2em] uppercase text-zinc-600 hover:text-[#FF4500] transition-colors">
                 <LogOut size={16} /> ENCERRAR_SESSÃO
               </button>
             </form>
             <div className="mt-8 px-4 border-l border-zinc-800">
                <p className="text-[9px] text-zinc-700 tracking-[0.2em] font-bold  uppercase mb-1">OPERADOR</p>
                <p className="text-[11px] text-zinc-400 font-mono truncate">{user.email}</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden w-full relative bg-[#0A0A0B]">
         {/* Mobile Header */}
         <div className="lg:hidden p-4 border-b border-zinc-800 flex justify-between items-center bg-[#111113] sticky top-0 z-50">
            <div className="text-xl font-black tracking-tighter uppercase text-zinc-100 flex items-center gap-2">
               <span className="w-3 h-3 bg-[#FF4500] transform rotate-45"></span>
               M_PRO
            </div>
            <form action="/auth/signout" method="post">
               <button className="text-zinc-500 hover:text-[#FF4500]">
                  <LogOut size={20} />
               </button>
            </form>
         </div>
         {children}
      </main>
    </div>
  )
}
