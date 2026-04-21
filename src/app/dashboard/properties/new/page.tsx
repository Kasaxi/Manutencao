import { createProperty } from './actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewPropertyPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 p-8 md:p-12 h-full flex flex-col relative w-full overflow-y-auto">
      <div className="flex items-center gap-6 mb-12 border-b border-zinc-800 pb-6 w-full">
         <Link href="/dashboard/properties" className="text-zinc-500 hover:text-[#FF4500] transition-colors p-2 border border-zinc-800 hover:border-[#FF4500]">
            <ArrowLeft size={20} />
         </Link>
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-zinc-100 uppercase opacity-90">
               CADASTRAR_IMÓVEL
            </h1>
            <p className="mt-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Inserir parâmetros operacionais do imóvel
            </p>
         </div>
      </div>

      <form action={createProperty} className="max-w-4xl w-full flex flex-col gap-12 font-mono">
         
         {searchParams?.message && (
            <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-500 text-sm">
               [ERRO] {searchParams.message}
            </div>
         )}
         
         {/* Identification */}
         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">01. Identificação</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Apelido / Referência *</label>
                  <input name="nickname" required placeholder="ex. Apto Ipanema 101" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 placeholder:text-zinc-700" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Categoria do Imóvel *</label>
                  <select name="property_type" required className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 appearance-none">
                     <option className="bg-[#0A0A0B]" value="house">Casa</option>
                     <option className="bg-[#0A0A0B]" value="apartment">Apartamento</option>
                     <option className="bg-[#0A0A0B]" value="commercial">Comercial</option>
                     <option className="bg-[#0A0A0B]" value="land">Terreno</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Location */}
         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">02. Endereço</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex flex-col space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Logradouro / Rua</label>
                  <input name="address_street" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Número</label>
                  <input name="address_number" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Complemento</label>
                  <input name="address_complement" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Bairro</label>
                  <input name="neighborhood" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Cidade</label>
                  <input name="city" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Estado / UF</label>
                  <input name="state" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">CEP</label>
                  <input name="zipcode" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
            </div>
         </section>

         {/* Metrics & Status */}
         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">03. Métricas e Status</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Área (m²)</label>
                  <input name="area_m2" type="number" step="0.01" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Cômodos</label>
                  <input name="rooms" type="number" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Status Atual *</label>
                  <select name="status" required className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 appearance-none">
                     <option className="bg-[#0A0A0B]" value="vacant">Vago</option>
                     <option className="bg-[#0A0A0B]" value="rented">Alugado</option>
                     <option className="bg-[#0A0A0B]" value="own_use">Uso Próprio</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Tenant Data (Optional) */}
         <section>
            <div className="text-xs tracking-widest uppercase text-[#FF4500] font-bold mb-6 border-b border-[#FF4500]/30 pb-2">04. Inquilino/Operador (Opcional)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Nome</label>
                  <input name="tenant_name" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Contato / Telefone</label>
                  <input name="tenant_contact" className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100" />
               </div>
               <div className="flex flex-col space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Notas / Observações</label>
                  <textarea name="notes" rows={3} className="bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 resize-none"></textarea>
               </div>
            </div>
         </section>

         <div className="pt-8 mb-24">
            <button 
               type="submit"
               className="bg-zinc-100 text-zinc-950 font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-[#FF4500] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
            >
               CADASTRAR_IMÓVEL
            </button>
         </div>

      </form>
    </div>
  )
}
