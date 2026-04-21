import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LayoutGrid, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react'

export default async function KanbanPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('service_orders')
    .select('*, properties(nickname)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-12 text-red-500 font-mono">[ERRO] Falha ao carregar protocolos.</div>
  }

  const columns = [
    { id: 'open', title: 'ABERTO', color: 'zinc' },
    { id: 'analyzing', title: 'EM_ANÁLISE', color: 'blue' },
    { id: 'quote_pending', title: 'ORÇAMENTO', color: 'orange' },
    { id: 'approved', title: 'APROVADO', color: 'emerald' },
    { id: 'in_progress', title: 'EM_EXECUÇÃO', color: 'amber' },
    { id: 'completed', title: 'CONCLUÍDO', color: 'zinc' }
  ]

  const getOrdersByStatus = (status: string) => orders?.filter(o => o.status === status) || []

  return (
    <div className="flex-1 p-8 md:p-12 h-screen flex flex-col relative w-full overflow-hidden">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-6 w-full shrink-0">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               FLUXO_KANBAN
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Controle de execução em tempo real
            </p>
         </div>
         <Link href="/dashboard/protocols" className="text-xs font-bold uppercase tracking-widest px-6 py-3 border border-zinc-800 hover:border-[#FF4500] hover:text-[#FF4500] transition-all">
            Visão de Lista
         </Link>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x">
        {columns.map(col => {
          const colOrders = getOrdersByStatus(col.id)
          return (
            <div key={col.id} className="w-[320px] shrink-0 flex flex-col snap-start">
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-xs font-black tracking-[0.2em] text-zinc-500 flex items-center gap-3">
                   <span className={`w-2 h-2 ${
                     col.id === 'open' ? 'bg-zinc-700' :
                     col.id === 'analyzing' ? 'bg-blue-500' :
                     col.id === 'quote_pending' ? 'bg-orange-500' :
                     col.id === 'approved' ? 'bg-emerald-500' :
                     col.id === 'in_progress' ? 'bg-amber-500' : 'bg-zinc-400'
                   }`}></span>
                   {col.title}
                 </h2>
                 <span className="text-[10px] font-mono text-zinc-700 font-bold bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    {colOrders.length}
                 </span>
              </div>

              <div className="flex-1 bg-[#111113]/50 border border-zinc-900 p-2 space-y-4 overflow-y-auto custom-scrollbar">
                {colOrders.map(order => (
                  <Link 
                    key={order.id} 
                    href={`/dashboard/protocols/${order.id}`}
                    className="block bg-[#111113] border border-zinc-800 p-4 hover:border-[#FF4500] hover:translate-y-[-2px] transition-all group relative overflow-hidden"
                  >
                    {order.severity === 'critical' && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-red-600/10 border-b border-l border-red-900 flex items-center justify-center">
                           <AlertCircle size={14} className="text-red-500" />
                        </div>
                    )}
                    
                    <div className="text-[9px] font-mono text-zinc-600 mb-2 uppercase tracking-widest flex justify-between">
                       #{order.code || order.id.slice(0,8)}
                       {order.requires_approval && <span className="text-orange-500 font-bold">REQUER_APROV</span>}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-tight mb-3 group-hover:text-white">
                      {order.title}
                    </h3>

                    <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                       <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter truncate max-w-[150px]">
                         {order.properties?.nickname}
                       </span>
                       <div className="flex items-center gap-1.5 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                          {order.status === 'completed' || order.status === 'validated' ? 
                             <CheckCircle2 size={12} className="text-emerald-500" /> : 
                             <Clock size={12} className="text-zinc-500" />
                          }
                       </div>
                    </div>
                  </Link>
                ))}
                
                {colOrders.length === 0 && (
                   <div className="h-32 border border-zinc-900 border-dashed flex items-center justify-center">
                      <span className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest">Vazio</span>
                   </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
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
