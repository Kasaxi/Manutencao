export default function DashboardOverview() {
  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-6 w-full">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               STATUS_DO_SISTEMA
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Métricas operacionais em tempo real
            </p>
         </div>
      </div>
      
      {/* brutalist grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-[#111113] p-8 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4500] opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">Imóveis Ativos</h3>
            <p className="text-5xl font-black text-zinc-100">0</p>
         </div>
         <div className="bg-[#111113] p-8 border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">Protocolos Abertos</h3>
            <p className="text-5xl font-black text-zinc-100">0</p>
         </div>
         <div className="bg-[#111113] p-8 border border-zinc-800 relative group overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">Alertas Críticos</h3>
            <p className="text-5xl font-black text-amber-500">0</p>
         </div>
      </div>
    </div>
  )
}
