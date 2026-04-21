'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle, ShieldAlert } from 'lucide-react'
import { addMaterialToOrder, approveBudget, executeOrder } from '@/app/actions/materials'
import { useRouter } from 'next/navigation'

export default function MaterialsSection({ 
    orderId, 
    initialMaterials, 
    estimatedTotal,
    status,
    requiresApproval,
    isAdmin 
}: { 
    orderId: string, 
    initialMaterials: any[], 
    estimatedTotal: number,
    status: string,
    requiresApproval: boolean,
    isAdmin: boolean
}) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const res = await addMaterialToOrder(orderId, {
            name,
            quantity,
            estimated_unit_price: price
        })

        if (!res.success) {
            alert('Erro: ' + res.error)
        } else {
            setName('')
            setQuantity(1)
            setPrice(0)
            router.refresh()
        }

        setIsSubmitting(false)
    }

    const handleApprove = async () => {
        if (!confirm('CONFIRMAR APROVAÇÃO FINANCEIRA?')) return;
        setIsSubmitting(true)
        await approveBudget(orderId)
        setIsSubmitting(false)
        router.refresh()
    }

    return (
        <section className="bg-[#111113] p-8 border border-zinc-800 relative mt-8">
            <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4 mb-6">Orçamentos e Materiais</h2>

            {/* Existing Materials List */}
            {initialMaterials.length > 0 ? (
                <div className="mb-8 border border-zinc-800">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-[#0A0A0B] text-zinc-500 text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4 border-b border-zinc-800">Item</th>
                                <th className="p-4 border-b border-zinc-800">Qtd</th>
                                <th className="p-4 border-b border-zinc-800">Valor Unit.</th>
                                <th className="p-4 border-b border-zinc-800 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {initialMaterials.map((m) => (
                                <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors text-zinc-300">
                                    <td className="p-4">{m.name}</td>
                                    <td className="p-4">{m.quantity}</td>
                                    <td className="p-4 text-zinc-400">R$ {Number(m.estimated_unit_price).toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold text-zinc-100">
                                        R$ {(Number(m.quantity) * Number(m.estimated_unit_price)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[#0A0A0B]">
                            <tr>
                                <td colSpan={3} className="p-4 border-t border-zinc-800 font-bold uppercase tracking-widest text-[#FF4500]">Custo Estimado Total</td>
                                <td className="p-4 border-t border-zinc-800 text-right font-black text-xl text-[#FF4500]">
                                    R$ {Number(estimatedTotal || 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="text-zinc-600 text-sm font-mono mb-8 border border-zinc-800 border-dashed p-6 text-center">Nenhum material alocado.</div>
            )}

            {/* Add Material Form */}
            {status !== 'completed' && status !== 'validated' && (
                <form onSubmit={handleAdd} className="flex gap-4 items-end bg-[#0A0A0B] p-4 border border-zinc-800">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Descrição do Material</label>
                        <input required value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" placeholder="Ex: Sifão Sanfonado" />
                    </div>
                    <div className="w-24 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">QTD</label>
                        <input required value={quantity} onChange={e=>setQuantity(Number(e.target.value))} type="number" min="1" step="0.01" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" />
                    </div>
                    <div className="w-32 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Valor (R$)</label>
                        <input required value={price} onChange={e=>setPrice(Number(e.target.value))} type="number" min="0" step="0.01" className="w-full bg-transparent border-b border-zinc-700 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-[#FF4500]" placeholder="0.00" />
                    </div>
                    <button disabled={isSubmitting} type="submit" className="bg-zinc-800 hover:bg-[#FF4500] text-zinc-100 px-6 py-2 transition-colors font-bold uppercase tracking-widest text-xs h-10 disabled:opacity-50">
                        <Plus size={16} />
                    </button>
                </form>
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
