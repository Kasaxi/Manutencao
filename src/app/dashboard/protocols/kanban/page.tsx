import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import KanbanBoard from './kanban-board'

export default async function KanbanPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('service_orders')
    .select('id, code, title, status, severity, requires_approval, properties(nickname)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-12 text-red-500 font-mono">[ERRO] Falha ao carregar protocolos.</div>
  }

  return (
    <div className="flex-1 p-8 md:p-12 h-screen flex flex-col relative w-full overflow-hidden">
      <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-6 w-full shrink-0">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               FLUXO_KANBAN
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Arraste os cards para mudar o status • Clique para abrir detalhes
            </p>
         </div>
         <Link href="/dashboard/protocols" className="text-xs font-bold uppercase tracking-widest px-6 py-3 border border-zinc-800 hover:border-[#FF4500] hover:text-[#FF4500] transition-all">
            Visão de Lista
         </Link>
      </div>

      <KanbanBoard orders={orders || []} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}} />
    </div>
  )
}
