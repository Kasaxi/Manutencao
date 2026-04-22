import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function PropertiesPage() {
  const supabase = await createClient()
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 border-b border-zinc-800 pb-6 w-full gap-6">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               IMÓVEIS
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Gestão e registro de ativos
            </p>
         </div>
         
         <Link 
            href="/dashboard/properties/new" 
            className="flex items-center gap-2 bg-zinc-100 text-zinc-950 font-bold uppercase tracking-widest px-6 py-4 text-xs hover:bg-[#FF4500] hover:text-white transition-all w-fit"
         >
            <Plus size={16} /> NOVO_IMÓVEL
         </Link>
      </div>

      {error && (
         <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-500 font-mono text-sm mb-8">
            [ERRO] Falha ao carregar imóveis.
         </div>
      )}

      {!properties || properties.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 w-full p-12">
            <span className="text-zinc-600 font-mono text-sm uppercase tracking-widest">NENHUM_IMÓVEL_ENCONTRADO</span>
         </div>
      ) : (
         <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
               <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs tracking-widest uppercase">
                     <th className="font-normal py-4 px-4 w-1/3">Identificador / Apelido</th>
                     <th className="font-normal py-4 px-4">Tipo</th>
                     <th className="font-normal py-4 px-4">Status</th>
                     <th className="font-normal py-4 px-4 text-right">Ação</th>
                  </tr>
               </thead>
               <tbody>
                  {properties.map((prop) => (
                     <tr key={prop.id} className="border-b border-zinc-800/50 hover:bg-[#111113] transition-colors group">
                        <td className="py-4 px-4">
                           <div className="font-bold text-zinc-100 text-base mb-1">{prop.nickname}</div>
                           <div className="text-sm text-zinc-600 truncate max-w-sm">
                              {prop.address_street}, {prop.number} - {prop.city}/{prop.state}
                           </div>
                        </td>
                        <td className="py-4 px-4 uppercase text-sm text-zinc-400">
                           {prop.property_type === 'house' ? 'Casa' : prop.property_type === 'apartment' ? 'Apartamento' : prop.property_type === 'commercial' ? 'Comercial' : 'Terreno'}
                        </td>
                        <td className="py-4 px-4">
                           <span className={`inline-block px-2.5 py-1 text-xs uppercase tracking-wider border ${
                              prop.status?.toLowerCase() === 'rented' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/30' :
                              prop.status?.toLowerCase() === 'vacant' ? 'border-amber-900 text-amber-500 bg-amber-950/30' :
                              'border-blue-900 text-blue-500 bg-blue-950/30'
                           }`}>
                              {prop.status?.toLowerCase() === 'rented' ? 'Alugado' : prop.status?.toLowerCase() === 'vacant' ? 'Vago' : 'Uso Próprio'}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                           <Link 
                              href={`/dashboard/properties/${prop.id}`}
                              className="text-sm tracking-widest uppercase text-zinc-500 hover:text-[#FF4500] group-hover:opacity-100 opacity-50 transition-all font-bold"
                           >
                              [INSPECIONAR]
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
