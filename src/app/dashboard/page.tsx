import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Building2, Wrench, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'

interface DashboardOrder {
  id: string
  code: string | null
  title: string
  status: string
  severity: string
  assigned_operator: string | null
  created_at: string
  properties: { nickname: string }[] | { nickname: string } | null
}

interface DashboardProperty {
  id: string
  nickname: string | null
  city: string | null
  status: string | null
}

export default async function DashboardOverview() {
  const supabase = await createClient()

  // Fetch all counts in parallel
  const [
    { count: totalProperties },
    { count: openProtocols },
    { count: criticalAlerts },
    { count: inProgressCount },
    { count: completedCount },
    { data: recentProtocols },
    { data: recentProperties },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('service_orders').select('*', { count: 'exact', head: true }).in('status', ['open', 'analyzing']),
    supabase.from('service_orders').select('*', { count: 'exact', head: true }).eq('severity', 'critical').not('status', 'in', '("completed","validated","cancelled")'),
    supabase.from('service_orders').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('service_orders').select('*', { count: 'exact', head: true }).in('status', ['completed', 'validated']),
    supabase.from('service_orders')
      .select('id, code, title, status, severity, assigned_operator, created_at, properties(nickname)')
      .not('status', 'in', '("completed","validated","cancelled")')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('properties')
      .select('id, nickname, city, status')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const statusLabel: Record<string, string> = {
    'open': 'Aberto',
    'analyzing': 'Em Análise',
    'quote_pending': 'Orçamento',
    'approved': 'Aprovado',
    'in_progress': 'Executando',
    'completed': 'Concluído',
  }

  const statusColor: Record<string, string> = {
    'open': 'text-zinc-400 border-zinc-700',
    'analyzing': 'text-blue-400 border-blue-900',
    'quote_pending': 'text-orange-400 border-orange-900',
    'approved': 'text-emerald-400 border-emerald-900',
    'in_progress': 'text-amber-400 border-amber-900',
    'completed': 'text-green-400 border-green-900',
  }

  const severityIcon: Record<string, string> = {
    'critical': 'bg-red-500',
    'high': 'bg-orange-500',
    'medium': 'bg-amber-500',
    'low': 'bg-blue-500',
  }

  const propertyStatusLabel: Record<string, string> = {
    'disponivel': 'Disponível',
    'vendido': 'Vendido',
    'ocupado': 'Ocupado',
    'indisponivel': 'Indisponível',
    'alugado': 'Alugado',
    'agio': 'Ágio',
    'vacant': 'Vago',
    'rented': 'Alugado',
    'own_use': 'Uso Próprio',
  }

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative overflow-y-auto">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-6 w-full">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               STATUS_DO_SISTEMA
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Métricas operacionais em tempo real
            </p>
         </div>
         <Link 
           href="/dashboard/protocols/new"
           className="bg-[#FF4500] text-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-colors flex items-center gap-2 shrink-0"
         >
           <Plus size={16} /> NOVA_OS
         </Link>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
         <div className="bg-[#111113] p-6 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4500] opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-3">
               <Building2 size={14} className="text-zinc-600" />
               <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">Imóveis</h3>
            </div>
            <p className="text-4xl font-black text-zinc-100">{totalProperties ?? 0}</p>
         </div>
         <div className="bg-[#111113] p-6 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-3">
               <Wrench size={14} className="text-zinc-600" />
               <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">OS Abertas</h3>
            </div>
            <p className="text-4xl font-black text-zinc-100">{openProtocols ?? 0}</p>
         </div>
         <div className="bg-[#111113] p-6 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-3">
               <Clock size={14} className="text-zinc-600" />
               <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">Em Execução</h3>
            </div>
            <p className="text-4xl font-black text-amber-500">{inProgressCount ?? 0}</p>
         </div>
         <div className="bg-[#111113] p-6 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-3">
               <AlertTriangle size={14} className="text-zinc-600" />
               <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">Alertas Críticos</h3>
            </div>
            <p className={`text-4xl font-black ${(criticalAlerts ?? 0) > 0 ? 'text-red-500' : 'text-zinc-100'}`}>{criticalAlerts ?? 0}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Active Protocols */}
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#FF4500]"></span>
                  Manutenções Ativas
               </h2>
               <Link href="/dashboard/protocols" className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-[#FF4500] transition-colors flex items-center gap-1 font-bold">
                  Ver Todas <ArrowRight size={10} />
               </Link>
            </div>

            {recentProtocols && recentProtocols.length > 0 ? (
               <div className="border border-zinc-800 divide-y divide-zinc-800/50">
                  {recentProtocols.map((order: DashboardOrder) => (
                     <Link
                        key={order.id}
                        href={`/dashboard/protocols/${order.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-zinc-900/50 transition-colors group"
                     >
                        {/* Severity dot */}
                        <span className={`w-2 h-2 shrink-0 ${severityIcon[order.severity] || 'bg-zinc-600'}`}></span>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">
                                 #{order.code || order.id.slice(0, 8)}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${statusColor[order.status] || 'text-zinc-500 border-zinc-800'}`}>
                                 {statusLabel[order.status] || order.status}
                              </span>
                           </div>
                           <h3 className="text-base text-zinc-100 font-bold uppercase tracking-tight truncate group-hover:text-white">
                              {order.title}
                           </h3>
                        </div>

                        {/* Property + Operator */}
                        <div className="text-right shrink-0 hidden md:block">
                           <div className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">
                              {Array.isArray(order.properties) ? order.properties[0]?.nickname : order.properties?.nickname}
                           </div>
                           <div className="text-[11px] text-zinc-600 font-mono">
                              {order.assigned_operator || '—'}
                           </div>
                        </div>

                        <ArrowRight size={14} className="text-zinc-800 group-hover:text-[#FF4500] transition-colors shrink-0" />
                     </Link>
                  ))}
               </div>
            ) : (
               <div className="border border-zinc-800 border-dashed p-12 flex flex-col items-center justify-center gap-3">
                  <Wrench size={24} className="text-zinc-800" />
                  <p className="text-xs text-zinc-700 font-mono uppercase tracking-widest">Nenhuma OS ativa</p>
                  <Link href="/dashboard/protocols/new" className="text-[10px] text-[#FF4500] font-bold uppercase tracking-widest hover:underline">
                     Criar primeira OS →
                  </Link>
               </div>
            )}
         </div>

         {/* Right Column */}
         <div className="space-y-8">
            {/* Properties Quick View */}
            <div>
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-3">
                     <span className="w-2 h-2 bg-zinc-600"></span>
                     Imóveis Recentes
                  </h2>
                  <Link href="/dashboard/properties" className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-[#FF4500] transition-colors flex items-center gap-1 font-bold">
                     Ver Todos <ArrowRight size={10} />
                  </Link>
               </div>

               {recentProperties && recentProperties.length > 0 ? (
                  <div className="space-y-2">
                     {recentProperties.map((prop: DashboardProperty) => (
                        <Link
                           key={prop.id}
                           href={`/dashboard/properties/${prop.id}`}
                           className="flex items-center justify-between p-3 border border-zinc-800 hover:border-[#FF4500]/30 transition-colors group"
                        >
                           <div className="min-w-0">
                              <div className="text-base text-zinc-100 font-bold uppercase tracking-tight truncate group-hover:text-white">
                                 {prop.nickname || 'Sem nome'}
                              </div>
                              <div className="text-xs text-zinc-600 font-mono">{prop.city || '—'}</div>
                           </div>
                           <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-2.5 py-1 border border-zinc-800 shrink-0">
                              {(prop.status && propertyStatusLabel[prop.status]) || prop.status || '—'}
                           </span>
                        </Link>
                     ))}
                  </div>
               ) : (
                  <div className="border border-zinc-800 border-dashed p-8 flex flex-col items-center gap-2">
                     <Building2 size={20} className="text-zinc-800" />
                     <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">Nenhum imóvel</p>
                  </div>
               )}
            </div>

            {/* Quick Stats */}
            <div className="bg-[#111113] border border-zinc-800 p-6">
               <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 mb-4">Resumo Rápido</h2>
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-zinc-500 font-mono">Concluídas</span>
                     <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> {completedCount ?? 0}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-zinc-500 font-mono">Em Execução</span>
                     <span className="text-sm font-black text-amber-500">{inProgressCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-zinc-500 font-mono">Aguardando</span>
                     <span className="text-sm font-black text-zinc-300">{openProtocols ?? 0}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 mt-3 flex justify-between items-center">
                     <span className="text-sm text-zinc-500 font-mono font-bold">Total Imóveis</span>
                     <span className="text-sm font-black text-zinc-100">{totalProperties ?? 0}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
