import { createClient } from '@/utils/supabase/server'
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Building2,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage() {
  const supabase = await createClient()

  // Fetching Service Orders for analytics
  const { data: orders } = await supabase
    .from('service_orders')
    .select('*, properties(nickname)')

  // Calculating Metrics
  const totalOrders = orders?.length || 0
  const totalCost = orders?.reduce((acc, order) => acc + (Number(order.actual_total) || 0), 0) || 0
  const openOrders = orders?.filter(o => o.status === 'open').length || 0
  
  // Calculate average resolution time (SLA)
  const completedOrders = orders?.filter(o => o.completed_at) || []
  const avgResolutionTime = completedOrders.length > 0 
    ? completedOrders.reduce((acc, o) => {
        const start = new Date(o.created_at).getTime()
        const end = new Date(o.completed_at!).getTime()
        return acc + (end - start)
      }, 0) / completedOrders.length / (1000 * 60 * 60 * 24) // in days
    : 0

  // Group by status
  const statusCounts = orders?.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {}) || {}

  // Group by category
  const categoryCounts = orders?.reduce((acc: Record<string, number>, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1
    return acc
  }, {}) || {}

  // Property ranking by cost
  const propertyCosts = orders?.reduce((acc: Record<string, { name: string, cost: number, count: number }>, o) => {
    const propId = o.property_id
    const propName = o.properties?.nickname || 'Desconhecido'
    if (!acc[propId]) acc[propId] = { name: propName, cost: 0, count: 0 }
    acc[propId].cost += (Number(o.actual_total) || 0)
    acc[propId].count += 1
    return acc
  }, {}) || {}
  
  const topProperties = Object.values(propertyCosts)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full bg-[#0A0A0B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 border-b border-zinc-800 pb-6 w-full gap-6">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               RELATÓRIOS_GERENCIAIS
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Análise de desempenho, custos e eficiência operacional
            </p>
         </div>
         
         <div className="flex gap-4">
            <div className="px-4 py-2 border border-zinc-800 flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500">
               <Calendar size={12} /> ÚLTIMOS_30_DIAS
            </div>
         </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MetricCard 
          label="TOTAL_CHAMADOS" 
          value={totalOrders.toString()} 
          icon={<FileText size={20} />} 
          trend="+12%" 
        />
        <MetricCard 
          label="CUSTO_TOTAL_ACUMULADO" 
          value={formatCurrency(totalCost)} 
          icon={<TrendingUp size={20} />} 
          trend="+5.4%" 
        />
        <MetricCard 
          label="SLA_MÉDIO_RESOLUÇÃO" 
          value={`${avgResolutionTime.toFixed(1)} dias`} 
          icon={<Clock size={20} />} 
          trend="-0.5d" 
          trendColor="text-emerald-500"
        />
        <MetricCard 
          label="CHAMADOS_EM_ABERTO" 
          value={openOrders.toString()} 
          icon={<AlertCircle size={20} />} 
          trend="Ativos"
          trendColor="text-[#FF4500]"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Status Distribution */}
        <ChartContainer title="DISTRIBUIÇÃO_POR_STATUS" icon={<PieChart size={18} />}>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = (count / totalOrders) * 100
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-400">{status}</span>
                    <span className="text-zinc-100">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-900 border border-zinc-800">
                    <div 
                      className="h-full bg-[#FF4500]" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ChartContainer>

        {/* Category Distribution */}
        <ChartContainer title="INCIDÊNCIA_POR_CATEGORIA" icon={<BarChart3 size={18} />}>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = (count / totalOrders) * 100
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-400">{category}</span>
                    <span className="text-zinc-100">{count}</span>
                  </div>
                  <div className="h-4 bg-zinc-900 border border-zinc-800">
                    <div 
                      className="h-full bg-zinc-100" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ChartContainer>
      </div>

      {/* TOP PROPERTIES BY COST */}
      <div className="w-full">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
          <Building2 size={14} /> MAIORES_CUSTOS_POR_IMÓVEL
        </h3>
        
        <div className="border border-zinc-800 bg-[#0F0F11]">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-600 text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6 font-bold">Imóvel</th>
                <th className="py-4 px-6 font-bold">Volume</th>
                <th className="py-4 px-6 font-bold text-right">Custo Total</th>
              </tr>
            </thead>
            <tbody>
              {topProperties.map((prop, idx) => (
                <tr key={idx} className="border-b border-zinc-800/50 hover:bg-[#151517] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-zinc-100 uppercase tracking-tighter">{prop.name}</div>
                  </td>
                  <td className="py-4 px-6 text-zinc-500 text-xs">
                    {prop.count} chamados
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-[#FF4500]">
                    {formatCurrency(prop.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, trend, trendColor = 'text-zinc-500' }: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  trend: string,
  trendColor?: string
}) {
  return (
    <div className="bg-[#0F0F11] border border-zinc-800 p-6 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-[#FF4500] group-hover:border-[#FF4500]/30 transition-all">
          {icon}
        </div>
        <div className={`text-[10px] font-bold font-mono uppercase tracking-widest ${trendColor}`}>
          {trend}
        </div>
      </div>
      <div>
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-2xl font-black text-zinc-100 tracking-tighter">{value}</div>
      </div>
    </div>
  )
}

function ChartContainer({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0F0F11] border border-zinc-800 p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100 flex items-center gap-2">
          {icon} {title}
        </h3>
        <ArrowUpRight size={14} className="text-zinc-700" />
      </div>
      {children}
    </div>
  )
}
