import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'

export default async function QRCodePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const headersList = headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) return <div className="p-12 font-mono">[ERRO] Imóvel não encontrado.</div>

  const publicUrl = `${protocol}://${host}/report/${property.id}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`

  return (
    <div className="flex-1 p-8 md:p-12 h-screen flex flex-col items-center bg-white text-zinc-950 overflow-y-auto">
      {/* Dashboard Print Header - Hidden on Print */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-12 border-b border-zinc-200 pb-6 print:hidden">
         <Link href={`/dashboard/properties/${params.id}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">
            <ArrowLeft size={16} /> Voltar
         </Link>
         <div className="flex gap-4">
            <button 
               onClick={() => window.print()}
               className="flex items-center gap-2 bg-zinc-950 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#FF4500] transition-colors"
            >
               <Printer size={16} /> Imprimir
            </button>
         </div>
      </div>

      {/* Printable Area */}
      <div className="w-full max-w-2xl border-8 border-zinc-950 p-12 flex flex-col items-center text-center relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 -rotate-45 translate-x-16 -translate-y-16 -z-10"></div>
         
         <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-6 bg-zinc-950 transform rotate-45"></span>
            <span className="text-3xl font-black tracking-tighter uppercase">MANUTENÇÃO_PRO</span>
         </div>

         <div className="space-y-2 mb-12">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">ABRA_SEU_CHAMADO</h1>
            <p className="text-zinc-600 font-mono text-sm max-w-sm mx-auto uppercase tracking-tighter">
              Utilize o QR Code abaixo para relatar problemas de manutenção neste imóvel.
            </p>
         </div>

         {/* QR Code Container */}
         <div className="border-4 border-zinc-950 p-4 mb-12 bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
               src={qrCodeUrl} 
               alt="QR Code de Manutenção" 
               className="w-64 h-64 shadow-[8px_8px_0px_#000]" 
            />
         </div>

         <div className="space-y-4 border-t border-zinc-200 pt-8 w-full">
            <div className="text-sm font-black uppercase text-zinc-950 tracking-widest">
               ID_DO_IMÓVEL: <span className="font-mono text-zinc-500">{property.id.split('-')[0]}</span>
            </div>
            <div className="text-lg font-black uppercase tracking-tight text-zinc-800">
               {property.nickname}
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase">
               {property.address_street}, {property.number} - {property.city}/{property.state}
            </p>
         </div>

         <div className="mt-12 text-[9px] text-zinc-400 font-mono uppercase tracking-[0.3em]">
            SISTEMA_DE_GESTÃO_PREDIAL_V3.0
         </div>
      </div>

      <p className="mt-12 text-zinc-400 text-[10px] font-mono uppercase tracking-widest print:hidden">
         * Este cartaz foi gerado automaticamente e está pronto para impressão.
      </p>

      <script dangerouslySetInnerHTML={{ __html: `
        // In client-side logic to handle interactions if needed
      `}} />
    </div>
  )
}
