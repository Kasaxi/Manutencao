import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react'
import MaterialsSection from './materials-section'

export default async function ProtocolDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('service_orders')
    .select('*, properties(nickname, address_street), profiles!service_orders_assigned_to_fkey(full_name)')
    .eq('id', params.id)
    .single()

  const { data: user } = await supabase.auth.getUser()
  let isAdmin = false
  if (user?.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  const { data: materials } = await supabase
    .from('order_materials')
    .select('*')
    .eq('service_order_id', params.id)
    .order('name', { ascending: true })


  if (error || !order) {
    return <div className="p-12 text-red-500 font-mono">[ERRO] Protocolo não encontrado.</div>
  }

  const statusMap: Record<string, string> = {
    'open': 'Aberto',
    'in_progress': 'Em Andamento',
    'pending_approval': 'Aprov. Pendente',
    'completed': 'Concluído',
    'validated': 'Validado'
  }

  const severityMap: Record<string, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'critical': 'Crítica'
  }

  const isOverdue = order.sla_deadline && new Date(order.sla_deadline) < new Date() && order.status !== 'completed' && order.status !== 'validated'

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full overflow-y-auto">
      <div className="flex items-center gap-6 mb-12 border-b border-zinc-800 pb-6 w-full">
         <Link href="/dashboard/protocols" className="text-zinc-500 hover:text-[#FF4500] transition-colors p-2 border border-zinc-800 hover:border-[#FF4500] group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
         </Link>
         <div className="flex-1 flex justify-between items-end gap-4 overflow-hidden">
            <div className="max-w-2xl">
               <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                     order.severity === 'critical' ? 'border-red-900 text-red-500 bg-red-950/20' :
                     order.severity === 'high' ? 'border-orange-900 text-orange-500 bg-orange-950/20' :
                     order.severity === 'medium' ? 'border-amber-900 text-amber-500 bg-amber-950/20' :
                     'border-blue-900 text-blue-500 bg-blue-950/20'
                  }`}>
                     PRIORIDADE: {severityMap[order.severity] || order.severity}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 border border-zinc-800 bg-zinc-900">
                     STATUS: {statusMap[order.status] || order.status}
                  </span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90 truncate">
                  {order.title}
               </h1>
            </div>
            
            {/* SLA Block */}
            <div className={`p-4 border text-right font-mono shrink-0 ${isOverdue ? 'border-red-900 bg-red-950/10' : 'border-zinc-800 bg-[#111113]'}`}>
               <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isOverdue ? 'text-red-500' : 'text-zinc-500'}`}>
                  Prazo de SLA
               </div>
               <div className={`text-xl font-black uppercase tracking-tighter flex items-center justify-end gap-2 ${isOverdue ? 'text-red-500' : 'text-zinc-100'}`}>
                  {isOverdue ? <ShieldAlert size={20}/> : <Clock size={20} className="opacity-50" />}
                  {new Date(order.sla_deadline).toLocaleString()}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 font-mono">
         <div className="lg:col-span-2 space-y-12">
            <section className="bg-[#111113] p-8 border border-zinc-800 relative">
               <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4 mb-6">Diagnóstico</h2>
               <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed tracking-wide">
                  {order.description}
               </div>
            </section>

            {/* Workflow Control - Simplificado */}
            <section className="bg-[#111113] p-8 border border-zinc-800 relative">
               <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4 mb-6">Execução</h2>
               <div className="flex gap-4 items-center">
                  <div className="flex-1 p-4 border border-zinc-800/50 bg-[#0A0A0B]">
                     <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Operador Atribuído</div>
                     <div className="text-sm text-zinc-100 uppercase font-bold">{order.profiles?.full_name || 'NÃO_ATRIBUÍDO'}</div>
                  </div>
                  {(order.status === 'open' || order.status === 'approved') && (
                     <form>
                        <button disabled={order.requires_approval && order.status !== 'approved'} className="bg-zinc-100 text-zinc-950 px-6 py-4 font-bold text-xs uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500">
                           {order.status === 'approved' ? 'Iniciar Execução' : 'Assumir OS'}
                        </button>
                     </form>
                  )}
               </div>
            </section>

            <MaterialsSection 
                orderId={order.id}
                initialMaterials={materials || []}
                estimatedTotal={Number(order.estimated_total)}
                status={order.status}
                requiresApproval={order.requires_approval}
                isAdmin={isAdmin}
            />
         </div>

         <div className="space-y-8">
            <section className="bg-[#111113] p-8 border border-zinc-800">
               <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4 mb-6">Metadados</h2>
               
               <div className="space-y-6">
                  <div>
                     <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1 font-bold">ID do Protocolo</div>
                     <div className="text-xs text-zinc-400 tracking-wider truncate">{order.id}</div>
                  </div>
                  <div>
                     <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1 font-bold">Imóvel Alvo</div>
                     <div className="text-sm text-zinc-100 font-bold uppercase tracking-widest">{order.properties?.nickname}</div>
                     <div className="text-xs text-zinc-500 tracking-wider">{order.properties?.address_street}</div>
                  </div>
                  <div>
                     <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1 font-bold">Categoria</div>
                     <div className="text-sm text-zinc-100 uppercase tracking-widest">{
                        order.category === 'hidraulica' ? 'Hidráulica' :
                        order.category === 'eletrica' ? 'Elétrica' :
                        order.category === 'alvenaria' ? 'Alvenaria' :
                        order.category === 'pintura' ? 'Pintura' :
                        order.category === 'ar_cond' ? 'Ar Condicionado' :
                        order.category === 'outros' ? 'Outros' : order.category
                     }</div>
                  </div>
                  <div>
                     <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1 font-bold">Data de Abertura</div>
                     <div className="text-sm text-zinc-100 uppercase tracking-widest">{new Date(order.created_at).toLocaleString('pt-BR')}</div>
                  </div>
               </div>
            </section>

         </div>
      </div>
    </div>
  )
}
