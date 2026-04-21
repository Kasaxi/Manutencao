'use client'

import { useState, useEffect, useCallback } from 'react'
import { Archive, Plus, Trash2, Tag, Calendar, FileText, Camera } from 'lucide-react'
import { createAsset, deleteAsset } from '@/app/actions/assets'
import { createClient } from '@/utils/supabase/client'

interface Asset {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  install_date: string;
  warranty_until: string;
}

export function AssetsSection({ propertyId }: { propertyId: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  const fetchAssets = useCallback(async () => {
    const { data } = await supabase
      .from('property_assets')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    
    setAssets(data || [])
    setLoading(false)
  }, [propertyId, supabase])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('propertyId', propertyId)

    const result = await createAsset(formData)
    if (result.success) {
      setIsAdding(false)
      fetchAssets()
    } else {
      alert(result.error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente excluir este ativo?')) {
      const result = await deleteAsset(id, propertyId)
      if (result.success) {
        fetchAssets()
      }
    }
  }

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse uppercase tracking-widest">Carregando_Ativos...</div>

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <h2 className="text-xl font-black tracking-tighter text-zinc-100 uppercase flex items-center gap-3">
          <Archive size={20} className="text-[#FF4500]" /> GESTÃO_DE_ATIVOS
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#FF4500] text-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> {isAdding ? 'CANCELAR' : 'NOVO_ATIVO'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#111113] p-8 border border-[#FF4500] space-y-6 max-w-2xl font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <div className="space-y-2">
              <label>Nome do Ativo *</label>
              <input name="name" required className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" placeholder="EX: AR CONDICIONADO SALA" />
            </div>
            <div className="space-y-2">
              <label>Marca</label>
              <input name="brand" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" placeholder="EX: LG" />
            </div>
            <div className="space-y-2">
              <label>Modelo</label>
              <input name="model" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" placeholder="EX: DUAL INVERTER 12K" />
            </div>
            <div className="space-y-2">
              <label>Nº de Série</label>
              <input name="serialNumber" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label>Data de Instalação</label>
              <input type="date" name="installDate" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label>Garantia Até</label>
              <input type="date" name="warrantyUntil" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-black py-4 font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
            REGISTRAR_ATIVO
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {assets.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-zinc-800 p-12 text-center text-zinc-600 font-mono italic">
            NENHUM ATIVO REGISTRADO PARA ESTE IMÓVEL.
          </div>
        ) : (
          assets.map(asset => (
            <div key={asset.id} className="bg-[#111113] border border-zinc-800 group hover:border-zinc-600 transition-all font-mono relative overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-zinc-800 p-3 text-[#FF4500] inline-block">
                    <Tag size={20} />
                  </div>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="text-zinc-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tighter mb-1">{asset.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase">{asset.brand} {asset.model}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-4 border-t border-zinc-800/10">
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest">
                    <Calendar size={10} /> Instalação: {asset.install_date ? new Date(asset.install_date).toLocaleDateString('pt-BR') : 'N/D'}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest">
                    <FileText size={10} /> SN: {asset.serial_number || 'N/D'}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                   <button className="flex-1 border border-zinc-800 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                     <Camera size={12} /> FOTOS
                   </button>
                   <button className="flex-1 border border-zinc-800 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                     <FileText size={12} /> DOCS
                   </button>
                </div>
              </div>
              <div className="h-1 w-full bg-zinc-800 group-hover:bg-[#FF4500] transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
