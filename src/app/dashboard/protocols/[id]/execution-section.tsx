'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignOperator, updateProtocolStatus } from '@/app/actions/protocols'

const OPERATORS = [
  'Omar', 'Elton', 'Linnyker', 'Jerton', 
  'Arthur', 'Michel', 'Gabriel', 'Wesley', 'Nilson'
]

const STATUS_FLOW: { id: string; label: string; color: string }[] = [
  { id: 'open', label: 'Aberto', color: 'zinc' },
  { id: 'analyzing', label: 'Em Análise', color: 'blue' },
  { id: 'quote_pending', label: 'Orçamento', color: 'orange' },
  { id: 'approved', label: 'Aprovado', color: 'emerald' },
  { id: 'in_progress', label: 'Em Execução', color: 'amber' },
  { id: 'completed', label: 'Concluído', color: 'green' },
]

const colorMap: Record<string, string> = {
  'zinc': 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100',
  'blue': 'border-blue-900 text-blue-500 hover:border-blue-500 hover:bg-blue-950/30',
  'orange': 'border-orange-900 text-orange-500 hover:border-orange-500 hover:bg-orange-950/30',
  'emerald': 'border-emerald-900 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-950/30',
  'amber': 'border-amber-900 text-amber-500 hover:border-amber-500 hover:bg-amber-950/30',
  'green': 'border-green-900 text-green-500 hover:border-green-500 hover:bg-green-950/30',
}

const activeColorMap: Record<string, string> = {
  'zinc': 'border-zinc-500 bg-zinc-900/50 text-zinc-100',
  'blue': 'border-blue-500 bg-blue-950/50 text-blue-400',
  'orange': 'border-orange-500 bg-orange-950/50 text-orange-400',
  'emerald': 'border-emerald-500 bg-emerald-950/50 text-emerald-400',
  'amber': 'border-amber-500 bg-amber-950/50 text-amber-400',
  'green': 'border-green-500 bg-green-950/50 text-green-400',
}

export default function ExecutionSection({
  orderId,
  currentStatus,
  currentOperator,
}: {
  orderId: string
  currentStatus: string
  currentOperator: string | null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState(currentOperator || '')
  const router = useRouter()

  const handleAssign = async () => {
    if (!selectedOperator) return
    setIsSubmitting(true)
    await assignOperator(orderId, selectedOperator)
    setIsSubmitting(false)
    router.refresh()
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    setIsSubmitting(true)
    await updateProtocolStatus(orderId, newStatus)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <section className="bg-[#111113] p-8 border border-zinc-800 relative">
      <h2 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-bold border-l-2 border-[#FF4500] pl-4 mb-6">Execução</h2>
      
      {/* Operator Assignment */}
      <div className="flex gap-4 items-end mb-8">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Operador Atribuído</label>
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-zinc-800 py-3 px-4 text-sm text-zinc-100 font-bold uppercase focus:outline-none focus:border-[#FF4500] transition-colors appearance-none"
          >
            <option value="" className="bg-[#0A0A0B] text-zinc-500">Selecione o operador...</option>
            {OPERATORS.map(op => (
              <option key={op} value={op} className="bg-[#0A0A0B]">{op}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAssign}
          disabled={isSubmitting || !selectedOperator || selectedOperator === currentOperator}
          className="bg-zinc-100 text-zinc-950 px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-colors disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 shrink-0"
        >
          {currentOperator ? 'Reatribuir' : 'Atribuir'}
        </button>
      </div>

      {/* Status Flow */}
      <div className="space-y-2">
        <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Status do Protocolo</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {STATUS_FLOW.map(s => {
            const isActive = s.id === currentStatus
            return (
              <button
                key={s.id}
                onClick={() => handleStatusChange(s.id)}
                disabled={isSubmitting}
                className={`px-3 py-2.5 border text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                  isActive ? activeColorMap[s.color] : colorMap[s.color]
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
