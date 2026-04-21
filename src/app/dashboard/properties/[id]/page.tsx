import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Building, WrenchIcon, Archive, LayoutGrid } from 'lucide-react'

export default async function PropertyDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  const { data: prop, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !prop) {
    return <div className="p-12 text-red-500 font-mono">[ERRO] Imóvel não encontrado.</div>
  }

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full overflow-y-auto">
      <div className="flex items-center gap-6 mb-12 border-b border-zinc-800 pb-6 w-full">
         <Link href="/dashboard/properties" className="text-zinc-500 hover:text-[#FF4500] transition-colors p-2 border border-zinc-800 hover:border-[#FF4500] group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
         </Link>
         <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90 truncate max-w-2xl">
                  {prop.nickname}
               </h1>
               <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest truncate max-w-md">
                  ID_IMÓVEL: {prop.id}
               </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 flex-wrap">
                <Link 
                   href={`/dashboard/properties/${prop.id}/qrcode`}
                   className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-[#FF4500] hover:text-[#FF4500] transition-all flex items-center gap-2"
                >
                   <LayoutGrid size={12} /> GERAR_QR_CODE
                </Link>
                <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border ${
                   prop.status === 'rented' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/20' :
                   prop.status === 'vacant' ? 'border-amber-900 text-amber-500 bg-amber-950/20' :
                   'border-blue-900 text-blue-500 bg-blue-950/20'
                }`}>
                   STATUS: {prop.status === 'rented' ? 'Alugado' : prop.status === 'vacant' ? 'Vago' : 'Uso Próprio'}
                </span>
            </div>
         </div>
      </div>

      {/* Tabs / Sub-navigation brutalist style */}
      <div className="flex flex-wrap gap-6 mb-12 font-mono border-b border-zinc-800/50 pb-0">
         <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4500] border-b-2 border-[#FF4500] pb-4 flex items-center gap-2 px-2 -mb-[1px]">
            <Building size={14} /> DADOS_IDENTIFICAÇÃO
         </button>
         <button className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-300 pb-4 flex items-center gap-2 px-2 -mb-[1px] opacity-50 cursor-not-allowed">
            <WrenchIcon size={14} /> PROTOCOLOS
         </button>
         <button className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-300 pb-4 flex items-center gap-2 px-2 -mb-[1px] opacity-50 cursor-not-allowed">
            <Archive size={14} /> HISTÓRICO
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 font-mono">
         <section className="space-y-8 bg-[#111113] p-8 border border-zinc-800 relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">01</div>
            <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4">Topologia</h2>
            
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-2 font-bold">Categoria</div>
                  <div className="text-sm text-zinc-100 uppercase tracking-widest">{prop.property_type === 'house' ? 'Casa' : prop.property_type === 'apartment' ? 'Apartamento' : prop.property_type === 'commercial' ? 'Comercial' : 'Terreno'}</div>
               </div>
               <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-2 font-bold">Área</div>
                  <div className="text-sm text-zinc-100 uppercase tracking-widest">{prop.area_m2 ? `${prop.area_m2} m²` : 'N/D'}</div>
               </div>
               <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-2 font-bold">Cômodos</div>
                  <div className="text-sm text-zinc-100 uppercase tracking-widest">{prop.rooms || 'N/D'}</div>
               </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/50">
               <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-3 font-bold">Endereço</div>
               <div className="text-sm text-zinc-100 tracking-wider">
                  {prop.address_street}, {prop.address_number}
                  {prop.address_complement && ` - ${prop.address_complement}`}
               </div>
               <div className="text-sm text-zinc-400 mt-2 tracking-wider">
                  {prop.neighborhood}
               </div>
               <div className="text-sm text-zinc-400 mt-2 tracking-wider">
                  {prop.city} / {prop.state}
               </div>
               <div className="text-sm text-zinc-500 mt-2 tracking-widest">
                  CEP: {prop.zipcode}
               </div>
            </div>
         </section>

         <section className="space-y-8 bg-[#111113] p-8 border border-zinc-800 relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">02</div>
            <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4">Inquilino / Operador</h2>
            
            <div className="grid grid-cols-1 gap-6">
               <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-2 font-bold">Inquilino</div>
                  <div className="text-sm text-zinc-100 uppercase tracking-widest">{prop.tenant_name || 'NENHUM_CADASTRADO'}</div>
               </div>
               <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-2 font-bold">Contato</div>
                  <div className="text-sm text-zinc-100 uppercase tracking-widest">{prop.tenant_contact || 'N/D'}</div>
               </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/50">
               <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-3 font-bold">Notas de Observação</div>
               <div className="text-sm text-zinc-400 bg-[#0A0A0B] p-6 border border-zinc-800/50 min-h-[120px] whitespace-pre-wrap leading-relaxed">
                  {prop.notes || 'NENHUM DADO DISPONÍVEL NESTA SEÇÃO'}
               </div>
            </div>
         </section>
      </div>
    </div>
  )
}
