'use client'

import { useState, useEffect, useCallback } from 'react'
import { WrenchIcon, Plus, Trash2, Calendar, LayoutGrid, Play } from 'lucide-react'
import { createPreventiveTemplate, deletePreventiveTemplate, processPreventives } from '@/app/actions/preventive'
import { createClient } from '@/utils/supabase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PreventiveTemplate {
  id: string;
  title: string;
  interval_months: number;
  next_run_date: string;
  property_assets: { name: string } | null;
}

interface ShortAsset {
  id: string;
  name: string;
}

export function PreventiveSection({ propertyId }: { propertyId: string }) {
  const [templates, setTemplates] = useState<PreventiveTemplate[]>([])
  const [assets, setAssets] = useState<ShortAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: templData } = await supabase
      .from('preventive_templates')
      .select('*, property_assets(name)')
      .eq('property_id', propertyId)
      .order('next_run_date', { ascending: true })
    
    const { data: assetData } = await supabase
      .from('property_assets')
      .select('id, name')
      .eq('property_id', propertyId)

    setTemplates(templData || [])
    setAssets(assetData || [])
    setLoading(false)
  }, [propertyId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('propertyId', propertyId)

    const result = await createPreventiveTemplate(formData)
    if (result.success) {
      setIsAdding(false)
      fetchData()
    } else {
      alert(result.error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente excluir este plano?')) {
      const result = await deletePreventiveTemplate(id, propertyId)
      if (result.success) {
        fetchData()
      }
    }
  }

  async function handleManualProcess() {
    setIsProcessing(true)
    const result = await processPreventives()
    if (result.success) {
      alert(`Processamento concluído! ${result.generatedCount} Ordens de Serviço geradas.`)
      fetchData()
    } else {
      alert('Erro ao processar preventivas.')
    }
    setIsProcessing(false)
  }

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse uppercase tracking-widest">Carregando_Planos...</div>

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tighter text-zinc-100 uppercase flex items-center gap-3">
            <WrenchIcon size={20} className="text-[#FF4500]" /> MANUTENÇÃO_PREVENTIVA
          </h2>
          <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">Gerador Automático de Protocolos</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleManualProcess}
            disabled={isProcessing}
            className="border border-zinc-700 text-zinc-400 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={12} fill="currentColor" /> {isProcessing ? 'PROCESSANDO...' : 'EXECUTAR_AGORA'}
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#FF4500] text-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> {isAdding ? 'CANCELAR' : 'NOVO_PLANO'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#111113] p-8 border border-[#FF4500] space-y-6 max-w-2xl font-mono">
          <div className="space-y-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <div className="space-y-2">
              <label>Título do Plano *</label>
              <input name="title" required className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all font-mono" placeholder="Ex: LIMPEZA DE FILTROS AC" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label>Vincular a Ativo (Opcional)</label>
                <select name="assetId" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all font-mono">
                  <option value="">GERAL (Sem ativo específico)</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label>Intervalo (Meses) *</label>
                <input type="number" name="intervalMonths" required min="1" className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all font-mono" defaultValue="6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label>Próxima Execução *</label>
                <input type="date" name="nextRunDate" required className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <label>Instruções / Descrição</label>
              <textarea name="description" rows={3} className="w-full bg-black border border-zinc-800 p-3 text-zinc-100 focus:border-[#FF4500] outline-none transition-all font-mono" placeholder="Descreva os itens que devem ser revisados..." />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-black py-4 font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
            CADASTRAR_PLANO_PREVENTIVO
          </button>
        </form>
      )}

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800 p-12 text-center text-zinc-600 font-mono italic">
            NENHUMA PREVENTIVA AGENDADA PARA ESTE IMÓVEL.
          </div>
        ) : (
          templates.map(tmp => (
            <div key={tmp.id} className="bg-[#111113] border border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-[#FF4500]">
                  <WrenchIcon size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tighter">{tmp.title}</h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                      <LayoutGrid size={10} /> {tmp.property_assets?.name || 'ESTRUTURAL'}
                    </span>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> A CADA {tmp.interval_months} MESES
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">PRÓXIMA_JANELA</p>
                  <p className="text-sm font-black text-emerald-500 uppercase">
                    {format(parseISO(tmp.next_run_date), "dd 'DE' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(tmp.id)}
                    className="p-3 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
