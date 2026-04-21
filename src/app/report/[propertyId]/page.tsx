import { createClient } from '@/utils/supabase/server'
import { ReportForm } from '@/components/ReportForm'
import { AlertTriangle } from 'lucide-react'

export default async function PublicReportPage({ params }: { params: { propertyId: string } }) {
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('nickname, address_street, number')
    .eq('id', params.propertyId)
    .single()

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8 text-zinc-100 font-mono">
        <div className="max-w-md w-full border-2 border-red-900 p-8 bg-red-950/10 text-center">
           <AlertTriangle size={48} className="mx-auto text-red-500 mb-6" />
           <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">IMÓVEL_NÃO_IDENTIFICADO</h1>
           <p className="text-zinc-500 text-sm uppercase">O link utilizado é inválido ou o imóvel não está cadastrado no sistema.</p>
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

        <ReportForm propertyId={params.propertyId} />
      </div>
    </div>
  )
}
