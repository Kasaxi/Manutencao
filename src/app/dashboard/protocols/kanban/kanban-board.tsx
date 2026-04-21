'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateProtocolStatus } from '@/app/actions/protocols'

interface Order {
  id: string
  code: string | null
  title: string
  status: string
  severity: string
  requires_approval: boolean
  properties: { nickname: string }[] | { nickname: string } | null
}

const columns = [
  { id: 'open', title: 'ABERTO', color: 'bg-zinc-700' },
  { id: 'analyzing', title: 'EM_ANÁLISE', color: 'bg-blue-500' },
  { id: 'quote_pending', title: 'ORÇAMENTO', color: 'bg-orange-500' },
  { id: 'approved', title: 'APROVADO', color: 'bg-emerald-500' },
  { id: 'in_progress', title: 'EM_EXECUÇÃO', color: 'bg-amber-500' },
  { id: 'completed', title: 'CONCLUÍDO', color: 'bg-zinc-400' },
]

export default function KanbanBoard({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()

  const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status)

  const onDragStart = () => {
    setIsDragging(true)
  }

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    const { draggableId, destination, source } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId

    // Optimistic update
    setOrders(prev => prev.map(o => 
      o.id === draggableId ? { ...o, status: newStatus } : o
    ))

    const res = await updateProtocolStatus(draggableId, newStatus)
    
    if (!res.success) {
      // Rollback on error
      setOrders(prev => prev.map(o => 
        o.id === draggableId ? { ...o, status: source.droppableId } : o
      ))
    }
    
    router.refresh()
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-8 snap-x">
        {columns.map(col => {
          const colOrders = getOrdersByStatus(col.id)
          return (
            <div key={col.id} className="w-[300px] shrink-0 flex flex-col snap-start">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xs font-black tracking-[0.2em] text-zinc-500 flex items-center gap-3">
                  <span className={`w-2 h-2 ${col.color}`}></span>
                  {col.title}
                </h2>
                <span className="text-[10px] font-mono text-zinc-700 font-bold bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                  {colOrders.length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 border p-2 space-y-3 overflow-y-auto custom-scrollbar min-h-[120px] transition-colors duration-200 ${
                      snapshot.isDraggingOver 
                        ? 'bg-[#FF4500]/5 border-[#FF4500]/30' 
                        : 'bg-[#111113]/50 border-zinc-900'
                    }`}
                  >
                    {colOrders.map((order, index) => (
                      <Draggable key={order.id} draggableId={order.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`block bg-[#111113] border p-4 transition-all group relative overflow-hidden select-none ${
                              snapshot.isDragging 
                                ? 'border-[#FF4500] shadow-[0_0_20px_rgba(255,69,0,0.15)] scale-[1.02] rotate-1' 
                                : 'border-zinc-800 hover:border-[#FF4500] hover:translate-y-[-2px]'
                            }`}
                          >
                            {order.severity === 'critical' && (
                              <div className="absolute top-0 right-0 w-8 h-8 bg-red-600/10 border-b border-l border-red-900 flex items-center justify-center">
                                <AlertCircle size={14} className="text-red-500" />
                              </div>
                            )}

                            <div className="text-[9px] font-mono text-zinc-600 mb-2 uppercase tracking-widest flex justify-between">
                              <Link 
                                href={`/dashboard/protocols/${order.id}`} 
                                className="hover:text-[#FF4500] transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                #{order.code || order.id.slice(0, 8)}
                              </Link>
                              {order.requires_approval && <span className="text-orange-500 font-bold">REQUER_APROV</span>}
                            </div>

                            <Link 
                              href={`/dashboard/protocols/${order.id}`}
                              onClick={e => { if (isDragging) e.preventDefault() }}
                            >
                              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-tight mb-3 group-hover:text-white">
                                {order.title}
                              </h3>
                            </Link>

                            <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter truncate max-w-[150px]">
                                {Array.isArray(order.properties) ? order.properties[0]?.nickname : order.properties?.nickname}
                              </span>
                              <div className="flex items-center gap-1.5 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                {order.status === 'completed' || order.status === 'validated' ?
                                  <CheckCircle2 size={12} className="text-emerald-500" /> :
                                  <Clock size={12} className="text-zinc-500" />
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colOrders.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-24 border border-zinc-900 border-dashed flex items-center justify-center">
                        <span className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest">Vazio</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
