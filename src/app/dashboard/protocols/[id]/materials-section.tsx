'use client'

import { useState } from 'react'
import { Plus, ShieldAlert, TrendingDown, Store, Trash2, Brain, Loader2, Sparkles, X } from 'lucide-react'
import { addMaterialToOrder, approveBudget, removeMaterial } from '@/app/actions/materials'
import { getAIBudgetAnalysis, getAIPriceSuggestion } from '@/app/actions/ai-budget'
import { useRouter } from 'next/navigation'

interface Material {
  id: string;
  name: string;
  quantity: number;
  estimated_unit_price: number;
  supplier: string | null;
}

interface AIItemAnalysis {
  nome: string
  preco_informado: number
  faixa_mercado_min: number
  faixa_mercado_max: number
  avaliacao: string
  sugestao: string
}

interface AIAnalysis {
  resumo: string
  avaliacao: string
  economia_potencial: number
  itens: AIItemAnalysis[]
  dicas: string[]
}

interface PriceSuggestion {
  min: number
  max: number
  medio: number
  dica: string
}

export default function MaterialsSection({ 
    orderId, 
    orderTitle,
    initialMaterials, 
    estimatedTotal,
    status,
    requiresApproval,
    isAdmin 
}: { 
    orderId: string, 
    orderTitle: string,
    initialMaterials: Material[], 
    estimatedTotal: number,
    status: string,
    requiresApproval: boolean,
    isAdmin: boolean
}) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState('')
    const [supplier, setSupplier] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null)
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false)
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const res = await addMaterialToOrder(orderId, {
            name,
            quantity,
            estimated_unit_price: Number(price) || 0,
            supplier: supplier || undefined,
        })

        if (!res.success) {
            alert('Erro: ' + res.error)
        } else {
            setName('')
            setQuantity(1)
            setPrice('')
            setSupplier('')
            setPriceSuggestion(null)
            router.refresh()
        }

        setIsSubmitting(false)
    }

    const handleRemove = async (materialId: string) => {
        if (!confirm('Remover este material?')) return
        setIsSubmitting(true)
        await removeMaterial(orderId, materialId)
        setIsSubmitting(false)
        router.refresh()
    }

    const handleApprove = async () => {
        if (!confirm('CONFIRMAR APROVAÇÃO FINANCEIRA?')) return;
        setIsSubmitting(true)
        await approveBudget(orderId)
        setIsSubmitting(false)
        router.refresh()
    }

    const handleAIAnalysis = async () => {
        setIsAnalyzing(true)
        setAiAnalysis(null)
        const res = await getAIBudgetAnalysis(initialMaterials, orderTitle)
        if (res.success && res.analysis) {
            setAiAnalysis(res.analysis as AIAnalysis)
        } else {
            alert(res.error || 'Erro na análise.')
        }
        setIsAnalyzing(false)
    }

    const handlePriceSuggestion = async () => {
        if (!name.trim()) return
        setIsSuggestingPrice(true)
        setPriceSuggestion(null)
        const result = await getAIPriceSuggestion(name)
        if (result) {
            setPriceSuggestion(result as PriceSuggestion)
        }
        setIsSuggestingPrice(false)
    }

    // Cost Analysis: Group by item name, find cheapest supplier
    const itemGroups: Record<string, { suppliers: { supplier: string, unitPrice: number }[], cheapest: string }> = {}
    
    initialMaterials.forEach(m => {
        const key = m.name.toLowerCase().trim()
        if (!itemGroups[key]) {
            itemGroups[key] = { suppliers: [], cheapest: '' }
        }
        itemGroups[key].suppliers.push({
            supplier: m.supplier || 'Sem fornecedor',
            unitPrice: Number(m.estimated_unit_price),
        })
    })

    Object.values(itemGroups).forEach(group => {
        if (group.suppliers.length > 1) {
            const sorted = [...group.suppliers].sort((a, b) => a.unitPrice - b.unitPrice)
            group.cheapest = sorted[0].supplier
        }
    })

    const supplierTotals: Record<string, number> = {}
    initialMaterials.forEach(m => {
        const s = m.supplier || 'Sem fornecedor'
        supplierTotals[s] = (supplierTotals[s] || 0) + (Number(m.quantity) * Number(m.estimated_unit_price))
    })
    const supplierEntries = Object.entries(supplierTotals).sort((a, b) => a[1] - b[1])

    const avaliacaoColors: Record<string, string> = {
        'barato': 'text-emerald-400',
        'justo': 'text-blue-400',
        'caro': 'text-orange-400',
        'muito_caro': 'text-red-400',
    }

    const avaliacaoBg: Record<string, string> = {
        'barato': 'bg-emerald-950/20 border-emerald-900/30',
        'justo': 'bg-blue-950/20 border-blue-900/30',
        'caro': 'bg-orange-950/20 border-orange-900/30',
        'muito_caro': 'bg-red-950/20 border-red-900/30',
    }

    const avaliacaoLabel: Record<string, string> = {
        'barato': '💰 BARATO',
        'justo': '✅ JUSTO',
        'caro': '⚠️ CARO',
        'muito_caro': '🚨 MUITO CARO',
    }

    return (
        <section className="bg-[#111113] p-8 border border-zinc-800 relative mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4">Orçamentos e Materiais</h2>
                
                {initialMaterials.length > 0 && (
                    <button 
                        onClick={handleAIAnalysis} 
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-zinc-800 hover:border-[#FF4500] hover:text-[#FF4500] text-zinc-400 transition-all disabled:opacity-50 group"
                    >
                        {isAnalyzing ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Brain size={14} className="group-hover:text-[#FF4500] transition-colors" />
                        )}
                        {isAnalyzing ? 'Analisando...' : 'Análise AI'}
                    </button>
                )}
            </div>

            {/* AI Analysis Panel */}
            {aiAnalysis && (
                <div className={`mb-6 border p-6 relative ${avaliacaoBg[aiAnalysis.avaliacao] || 'bg-zinc-900/50 border-zinc-800'}`}>
                    <button onClick={() => setAiAnalysis(null)} className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300">
                        <X size={16} />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <Brain size={16} className="text-[#FF4500]" />
                        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-300">Análise Inteligente</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${avaliacaoColors[aiAnalysis.avaliacao] || 'text-zinc-400'} ${avaliacaoBg[aiAnalysis.avaliacao] || ''}`}>
                            {avaliacaoLabel[aiAnalysis.avaliacao] || aiAnalysis.avaliacao}
                        </span>
                    </div>

                    <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{aiAnalysis.resumo}</p>

                    {aiAnalysis.economia_potencial > 0 && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
                            <TrendingDown size={16} />
                            <span className="text-sm font-bold">Economia potencial: R$ {aiAnalysis.economia_potencial.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Per-item analysis */}
                    {aiAnalysis.itens && aiAnalysis.itens.length > 0 && (
                        <div className="space-y-2 mb-4">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">Análise por Item</h4>
                            {aiAnalysis.itens.map((item, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-[#0A0A0B] border border-zinc-800 text-xs">
                                    <span className="text-zinc-200 font-bold uppercase flex-1 min-w-[120px]">{item.nome}</span>
                                    <span className="text-zinc-500 font-mono">R$ {item.preco_informado?.toFixed(2)}</span>
                                    <span className="text-zinc-600">→</span>
                                    <span className="text-zinc-400 font-mono">Mercado: R$ {item.faixa_mercado_min?.toFixed(2)} – {item.faixa_mercado_max?.toFixed(2)}</span>
                                    <span className={`font-bold ${avaliacaoColors[item.avaliacao] || 'text-zinc-400'}`}>
                                        {avaliacaoLabel[item.avaliacao] || item.avaliacao}
                                    </span>
                                    {item.sugestao && (
                                        <span className="text-zinc-500 italic w-full mt-1">💡 {item.sugestao}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tips */}
                    {aiAnalysis.dicas && aiAnalysis.dicas.length > 0 && (
                        <div className="pt-3 border-t border-zinc-800/50">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">Dicas de Economia</h4>
                            <ul className="space-y-1">
                                {aiAnalysis.dicas.map((dica, i) => (
                                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                        <Sparkles size={12} className="text-[#FF4500] shrink-0 mt-0.5" />
                                        {dica}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Existing Materials List */}
            {initialMaterials.length > 0 ? (
                <div className="mb-6 border border-zinc-800">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-[#0A0A0B] text-zinc-500 text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="p-4 border-b border-zinc-800">Item</th>
                                <th className="p-4 border-b border-zinc-800">Fornecedor</th>
                                <th className="p-4 border-b border-zinc-800">Qtd</th>
                                <th className="p-4 border-b border-zinc-800">Valor Unit.</th>
                                <th className="p-4 border-b border-zinc-800 text-right">Subtotal</th>
                                {status !== 'completed' && status !== 'validated' && (
                                    <th className="p-4 border-b border-zinc-800 w-10"></th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {initialMaterials.map((m) => {
                                const key = m.name.toLowerCase().trim()
                                const group = itemGroups[key]
                                const isCheapest = group && group.suppliers.length > 1 && (m.supplier || 'Sem fornecedor') === group.cheapest

                                return (
                                    <tr key={m.id} className={`hover:bg-zinc-900/30 transition-colors text-zinc-300 ${isCheapest ? 'bg-emerald-950/10' : ''}`}>
                                        <td className="p-4">{m.name}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Store size={12} className="text-zinc-600 shrink-0" />
                                                <span className="text-zinc-400 text-xs">{m.supplier || '—'}</span>
                                                {isCheapest && (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-950/30 px-1.5 py-0.5 border border-emerald-900/50">
                                                        Melhor
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">{m.quantity}</td>
                                        <td className="p-4 text-zinc-400">R$ {Number(m.estimated_unit_price).toFixed(2)}</td>
                                        <td className="p-4 text-right font-bold text-zinc-100">
                                            R$ {(Number(m.quantity) * Number(m.estimated_unit_price)).toFixed(2)}
                                        </td>
                                        {status !== 'completed' && status !== 'validated' && (
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleRemove(m.id)}
                                                    disabled={isSubmitting}
                                                    className="text-zinc-700 hover:text-red-500 transition-colors disabled:opacity-30"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-[#0A0A0B]">
                            <tr>
                                <td colSpan={4} className="p-4 border-t border-zinc-800 font-bold uppercase tracking-widest text-[#FF4500]">Custo Estimado Total</td>
                                <td className="p-4 border-t border-zinc-800 text-right font-black text-xl text-[#FF4500]" colSpan={status !== 'completed' && status !== 'validated' ? 2 : 1}>
                                    R$ {Number(estimatedTotal || 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="text-zinc-600 text-sm font-mono mb-6 border border-zinc-800 border-dashed p-6 text-center">Nenhum material alocado.</div>
            )}

            {/* Supplier Comparison */}
            {supplierEntries.length > 1 && (
                <div className="mb-6 bg-[#0A0A0B] border border-zinc-800 p-5">
                    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2 mb-4">
                        <TrendingDown size={12} className="text-emerald-500" />
                        Comparativo de Fornecedores
                    </h3>
                    <div className="space-y-2">
                        {supplierEntries.map(([supplierName, total], i) => {
                            const isLowest = i === 0
                            const savings = supplierEntries.length > 1 ? supplierEntries[supplierEntries.length - 1][1] - total : 0
                            return (
                                <div key={supplierName} className={`flex items-center justify-between p-3 border transition-colors ${isLowest ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-zinc-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <Store size={14} className={isLowest ? 'text-emerald-500' : 'text-zinc-600'} />
                                        <span className={`text-sm font-bold uppercase tracking-tight ${isLowest ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                            {supplierName}
                                        </span>
                                        {isLowest && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-950/30 px-1.5 py-0.5 border border-emerald-900/50">
                                                Mais Barato
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${isLowest ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                            R$ {total.toFixed(2)}
                                        </div>
                                        {isLowest && savings > 0 && (
                                            <div className="text-[9px] text-emerald-600 font-mono">
                                                Economia de R$ {savings.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Material Form */}
            {status !== 'completed' && status !== 'validated' && (
                <>
                    <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end bg-[#0A0A0B] p-4 border border-zinc-800">
                        <div className="flex-1 min-w-[160px] space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Material</label>
                            <div className="flex items-center gap-2">
                                <input required value={name} onChange={e => { setName(e.target.value); setPriceSuggestion(null) }} type="text" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" placeholder="Ex: Sifão Sanfonado" />
                                <button
                                    type="button"
                                    onClick={handlePriceSuggestion}
                                    disabled={isSuggestingPrice || !name.trim()}
                                    className="text-zinc-600 hover:text-[#FF4500] transition-colors disabled:opacity-30 shrink-0"
                                    title="Sugerir preço com AI"
                                >
                                    {isSuggestingPrice ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[140px] space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Fornecedor</label>
                            <input value={supplier} onChange={e=>setSupplier(e.target.value)} type="text" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" placeholder="Ex: Leroy Merlin" />
                        </div>
                        <div className="w-20 space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">QTD</label>
                            <input required value={quantity} onChange={e=>setQuantity(Number(e.target.value))} type="number" min="1" step="0.01" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" />
                        </div>
                        <div className="w-28 space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Valor (R$)</label>
                            <input required value={price} onChange={e=>setPrice(e.target.value)} type="number" min="0" step="0.01" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" placeholder="0.00" />
                        </div>
                        <button disabled={isSubmitting} type="submit" className="bg-zinc-800 hover:bg-[#FF4500] text-zinc-100 px-6 py-2 transition-colors font-bold uppercase tracking-widest text-xs h-10 disabled:opacity-50">
                            <Plus size={16} />
                        </button>
                    </form>

                    {/* AI Price Suggestion */}
                    {priceSuggestion && (
                        <div className="mt-2 p-3 bg-[#0A0A0B] border border-zinc-800 flex flex-wrap items-center gap-4 text-xs animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-[#FF4500]">
                                <Sparkles size={12} />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Sugestão AI</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400 font-mono">
                                <span>Min: <strong className="text-emerald-400">R$ {priceSuggestion.min?.toFixed(2)}</strong></span>
                                <span className="text-zinc-700">|</span>
                                <span>Médio: <strong className="text-blue-400">R$ {priceSuggestion.medio?.toFixed(2)}</strong></span>
                                <span className="text-zinc-700">|</span>
                                <span>Max: <strong className="text-orange-400">R$ {priceSuggestion.max?.toFixed(2)}</strong></span>
                            </div>
                            {priceSuggestion.dica && (
                                <span className="text-zinc-500 italic">💡 {priceSuggestion.dica}</span>
                            )}
                            <button onClick={() => setPrice(String(priceSuggestion.medio?.toFixed(2)))} className="text-[#FF4500] hover:underline font-bold text-[10px] uppercase tracking-widest ml-auto">
                                Usar Médio
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Block / Approval Box */}
            {status === 'quote_pending' && requiresApproval && (
                <div className="mt-8 p-6 bg-red-950/20 border-2 border-red-900 flex flex-col sm:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ShieldAlert className="text-red-500 shrink-0" size={32} />
                        <div>
                            <div className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Aprovação Financeira Requerida</div>
                            <div className="text-zinc-400 font-mono text-xs">O orçamento total de R$ {Number(estimatedTotal || 0).toFixed(2)} ultrapassou o limite predefinido. A execução está TRAVADA.</div>
                        </div>
                    </div>
                    {isAdmin ? (
                        <button onClick={handleApprove} disabled={isSubmitting} className="bg-red-500 text-white px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-white hover:text-red-600 transition-colors shadow-[0_0_20px_rgba(255,0,0,0.2)] whitespace-nowrap shrink-0 disabled:opacity-50">
                            Aprovar Orçamento
                        </button>
                    ) : (
                        <div className="px-6 py-4 border border-red-900/50 bg-red-950/10 text-red-500/50 font-bold uppercase tracking-widest text-xs">
                            Aguardando Admin
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
