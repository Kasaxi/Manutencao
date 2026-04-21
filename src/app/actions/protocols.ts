'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignOperator(orderId: string, operatorName: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_orders')
    .update({ 
      assigned_operator: operatorName,
      status: 'in_progress'
    })
    .eq('id', orderId)

  if (error) {
    console.error('Error assigning operator:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/protocols/${orderId}`)
  revalidatePath('/dashboard/protocols/kanban')
  return { success: true }
}

export async function updateProtocolStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/protocols/${orderId}`)
  revalidatePath('/dashboard/protocols/kanban')
  revalidatePath('/dashboard/protocols')
  return { success: true }
}
