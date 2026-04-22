import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProtocolsPage() {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('service_orders')
    .select('*, properties(nickname)')
    .order('created_at', { ascending: false })
    
  const statusLabel: Record<string, string> = {
    'open': 'Aberto',
    'analyzing': 'Em Análise',
    'quote_pending': 'Orçamento',
    'approved': 'Aprovado',
    'in_progress': 'Em Execução',
    'completed': 'Concluído',
    'validated': 'Validado',
    'cancelled': 'Cancelado'
  }

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 border-b border-zinc-800 pb-6 w-full gap-6">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               PROTOCOLOS
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Ordens de Serviço & Controle de SLA
            </p>
         </div>
         
         <Link 
            href="/dashboard/protocols/new" 
            className="flex items-center gap-2 bg-zinc-100 text-zinc-950 font-bold uppercase tracking-widest px-6 py-4 text-xs hover:bg-[#FF4500] hover:text-white transition-all w-fit"
         >
            <Plus size={16} /> NOVO_PROTOCOLO
         </Link>
      </div>

      {error && (
         <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-500 font-mono text-sm mb-8">
            [ERRO] Falha ao carregar protocolos.
         </div>
      )}

      {!orders || orders.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 w-full p-12">
            <span className="text-zinc-600 font-mono text-sm uppercase tracking-widest">NENHUM_PROTOCOLO_ATIVO</span>
         </div>
      ) : (
         <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
               <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-sm tracking-widest uppercase">
                     <th className="font-normal py-4 px-4">Título / ID</th>
                     <th className="font-normal py-4 px-4">Imóvel</th>
                     <th className="font-normal py-4 px-4">Gravidade</th>
                     <th className="font-normal py-4 px-4">Status</th>
                     <th className="font-normal py-4 px-4 text-right">Ação</th>
                  </tr>
               </thead>
               <tbody>
                  {orders.map((order) => (
                     <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-[#111113] transition-colors group">
                        <td className="py-4 px-4">
                           <div className="font-bold text-zinc-100 text-base mb-1">{order.title}</div>
                           <div className="text-[11px] text-zinc-600 truncate max-w-xs">{order.id}</div>
                        </td>
                        <td className="py-4 px-4 uppercase text-sm text-zinc-400">
                           {order.properties?.nickname || 'NÃO_ATRIBUÍDO'}
                        </td>
                        <td className="py-4 px-4">
                           <span className={`inline-block px-2.5 py-1 text-xs uppercase tracking-wider border ${
                              order.severity === 'critical' ? 'border-red-900 text-red-500 bg-red-950/30' :
                              order.severity === 'high' ? 'border-orange-900 text-orange-500 bg-orange-950/30' :
                              order.severity === 'medium' ? 'border-amber-900 text-amber-500 bg-amber-950/30' :
                              'border-blue-900 text-blue-500 bg-blue-950/30'
                           }`}>
                              {order.severity === 'critical' ? 'Crítico' : order.severity === 'high' ? 'Alto' : order.severity === 'medium' ? 'Médio' : 'Baixo'}
                           </span>
                        </td>
                        <td className="py-4 px-4">
                           <span className="inline-block px-2.5 py-1 text-xs uppercase tracking-wider border border-zinc-700 text-zinc-400 bg-zinc-900">
                              {statusLabel[order.status.toLowerCase()] || order.status}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                           <Link 
                              href={`/dashboard/protocols/${order.id}`}
                              className="text-sm tracking-widest uppercase text-zinc-500 hover:text-[#FF4500] group-hover:opacity-100 opacity-50 transition-all font-bold"
                           >
                              [ABRIR]
                           </Link>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}
    </div>
  )
}
