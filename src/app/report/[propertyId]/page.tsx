import { createClient } from '@/utils/supabase/server'
import { createPublicProtocol } from '../actions'
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react'

export default async function PublicReportPage({ params }: { params: { propertyId: string } }) {
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('nickname, address_street, number')
    .eq('id', params.propertyId)
    .single()

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
        <div className="max-w-md w-full border-2 border-red-900 p-8 bg-red-950/10 text-center">
           <AlertTriangle size={48} className="mx-auto text-red-500 mb-6" />
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">IMÓVEL_NÃO_IDENTIFICADO</h1>
           <p className="text-zinc-500 font-mono text-sm uppercase">O link utilizado é inválido ou o imóvel não está cadastrado no sistema.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-mono selection:bg-[#FF4500]">
      <div className="max-w-xl mx-auto px-6 py-12">
        <header className="mb-12 border-b-4 border-[#FF4500] pb-8">
           <div className="flex items-center gap-3 mb-6">
              <span className="w-5 h-5 bg-[#FF4500] transform rotate-45"></span>
              <span className="text-2xl font-black tracking-tighter uppercase">MANUTENÇÃO_PRO</span>
           </div>
           <h1 className="text-4xl font-black tracking-tighter leading-none uppercase mb-2">ABRIR_CHAMADO</h1>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">
             Relatar incidente para: <span className="text-white">{property.nickname}</span><br />
             {property.address_street}, {property.number}
           </p>
        </header>

        <form action={createPublicProtocol} className="space-y-8">
          <input type="hidden" name="propertyId" value={params.propertyId} />
          
          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 px-1">Seu Nome Completo</label>
              <input 
                required
                name="tenantName"
                placeholder="Ex: João da Silva"
                className="w-full bg-[#111113] border-2 border-zinc-800 p-4 font-bold text-white placeholder:text-zinc-700 focus:border-[#FF4500] outline-none transition-all"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 px-1">Telefone para Contato</label>
              <input 
                required
                name="tenantPhone"
                placeholder="(00) 00000-0000"
                className="w-full bg-[#111113] border-2 border-zinc-800 p-4 font-bold text-white placeholder:text-zinc-700 focus:border-[#FF4500] outline-none transition-all"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 px-1">O que aconteceu? (Curto)</label>
              <input 
                required
                name="title"
                placeholder="Ex: Vazamento sob a pia da cozinha"
                className="w-full bg-[#111113] border-2 border-zinc-800 p-4 font-bold text-white placeholder:text-zinc-700 focus:border-[#FF4500] outline-none transition-all"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 px-1">Descrição Detalhada</label>
              <textarea 
                required
                name="description"
                rows={5}
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                className="w-full bg-[#111113] border-2 border-zinc-800 p-4 font-bold text-white placeholder:text-zinc-700 focus:border-[#FF4500] outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-100 text-zinc-950 p-6 font-black uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-all flex items-center justify-center gap-4 group"
          >
            ENVIAR_RELATÓRIO <Send size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">
            Ao enviar, um protocolo será gerado e nossa equipe entrará em contato.
          </p>
        </form>
      </div>
    </div>
  )
}
