import { createProtocol } from './actions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProtocolPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const supabase = await createClient()
  
  const { data: properties } = await supabase
    .from('properties')
    .select('id, nickname, address_street, city')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full overflow-y-auto">
      <div className="flex items-center gap-6 mb-12 border-b border-zinc-800 pb-6 w-full">
         <Link href="/dashboard/protocols" className="text-zinc-500 hover:text-[#FF4500] transition-colors p-2 border border-zinc-800 hover:border-[#FF4500]">
            <ArrowLeft size={20} />
         </Link>
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               ABRIR_PROTOCOLO
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Abrir uma nova ordem de serviço
            </p>
         </div>
      </div>

      <form action={createProtocol} className="max-w-4xl w-full flex flex-col gap-12 font-mono">
         
         {searchParams?.message && (
            <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-500 text-sm">
               [ERRO] {searchParams.message}
            </div>
         )}
         
         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">01. Identificação</div>
            <div className="grid grid-cols-1 gap-8">
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Título Curto *</label>
                  <input name="title" required placeholder="ex. Cano quebrado no banheiro principal" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 placeholder:text-zinc-700" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Diagnóstico Detalhado / Descrição *</label>
                  <textarea name="description" required rows={4} className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 resize-none placeholder:text-zinc-700" placeholder="Descreva o problema completo..."></textarea>
               </div>
            </div>
         </section>

         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">02. Imóvel e Prioridade</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Imóvel Alvo *</label>
                  <select name="property_id" required className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 appearance-none">
                     <option value="" className="bg-[#0A0A0B] text-zinc-500">Selecione um imóvel...</option>
                     {properties?.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#0A0A0B]">{p.nickname} ({p.city})</option>
                     ))}
                  </select>
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Categoria do Protocolo *</label>
                  <select name="category" required className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 appearance-none">
                     <option className="bg-[#0A0A0B]" value="hidraulica">Hidráulica</option>
                     <option className="bg-[#0A0A0B]" value="eletrica">Elétrica</option>
                     <option className="bg-[#0A0A0B]" value="alvenaria">Alvenaria</option>
                     <option className="bg-[#0A0A0B]" value="pintura">Pintura</option>
                     <option className="bg-[#0A0A0B]" value="ar_cond">Ar Condicionado</option>
                     <option className="bg-[#0A0A0B]" value="outros">Outros</option>
                  </select>
               </div>
               <div className="flex flex-col space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Gravidade do Problema *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                     <label className="cursor-pointer">
                        <input type="radio" name="severity" value="low" className="peer sr-only" defaultChecked />
                        <div className="px-4 py-3 border border-zinc-800 text-center peer-checked:border-blue-500 peer-checked:bg-blue-950/20 peer-checked:text-blue-500 text-zinc-500 transition-all font-bold text-xs tracking-widest uppercase">
                           Baixa (7 dias)
                        </div>
                     </label>
                     <label className="cursor-pointer">
                        <input type="radio" name="severity" value="medium" className="peer sr-only" />
                        <div className="px-4 py-3 border border-zinc-800 text-center peer-checked:border-amber-500 peer-checked:bg-amber-950/20 peer-checked:text-amber-500 text-zinc-500 transition-all font-bold text-xs tracking-widest uppercase">
                           Média (72h)
                        </div>
                     </label>
                     <label className="cursor-pointer">
                        <input type="radio" name="severity" value="high" className="peer sr-only" />
                        <div className="px-4 py-3 border border-zinc-800 text-center peer-checked:border-orange-500 peer-checked:bg-orange-950/20 peer-checked:text-orange-500 text-zinc-500 transition-all font-bold text-xs tracking-widest uppercase">
                           Alta (24h)
                        </div>
                     </label>
                     <label className="cursor-pointer">
                        <input type="radio" name="severity" value="critical" className="peer sr-only" />
                        <div className="px-4 py-3 border border-zinc-800 text-center peer-checked:border-red-500 peer-checked:bg-red-950/20 peer-checked:text-red-500 text-zinc-500 transition-all font-bold text-xs tracking-widest uppercase">
                           Crítica (4h)
                        </div>
                     </label>
                  </div>
               </div>
            </div>
         </section>

         <div className="pt-8 mb-24">
            <button 
               type="submit"
               className="bg-zinc-100 text-zinc-950 font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-[#FF4500] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
            >
               CRIAR_PROTOCOLO
            </button>
         </div>

      </form>
    </div>
  )
}
