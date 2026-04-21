'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createPublicProtocol } from '@/app/report/actions'
import type { ReportActionState } from '@/app/report/actions'
import { Send, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

interface ReportFormProps {
  propertyId: string;
}

const initialState: ReportActionState = {
  success: false,
  error: '',
  code: ''
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full bg-zinc-100 text-zinc-950 p-6 font-black uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">ENVIANDO <span className="animate-pulse">...</span></span>
      ) : (
        <>
          ENVIAR_RELATÓRIO <Send size={20} className="group-hover:translate-x-2 transition-transform" />
        </>
      )}
    </button>
  )
}

export function ReportForm({ propertyId }: ReportFormProps) {
  const [state, formAction] = useFormState(createPublicProtocol, initialState)

  if (state.success) {
    return (
      <div className="animate-in fade-in zoom-in duration-500 bg-[#111113] border-4 border-emerald-500 p-8 md:p-12 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 size={48} className="text-black" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">REGISTRO_CONCLUÍDO</h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Sua solicitação foi enviada com sucesso para a equipe de manutenção.
          </p>
        </div>

        <div className="bg-black border-2 border-zinc-900 p-6 space-y-2">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Protocolo de Acompanhamento</p>
          <p className="text-4xl font-black text-[#FF4500] tracking-tighter font-mono">{state.code}</p>
        </div>

        <div className="pt-4">
           <button 
             onClick={() => window.location.reload()}
             className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto"
           >
             ABRIR NOVO CHAMADO <ArrowRight size={14} />
           </button>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="propertyId" value={propertyId} />
      
      {state.error && (
        <div className="bg-red-950/20 border-2 border-red-900 p-4 flex items-center gap-4 text-red-500 font-mono text-xs uppercase font-bold animate-shake">
          <AlertTriangle size={18} />
          {state.error}
        </div>
      )}

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

      <SubmitButton />

      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">
        Ao enviar, um protocolo será gerado e nossa equipe entrará em contato.
      </p>
    </form>
  )
}
