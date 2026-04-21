'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMaterialToOrder(
  service_order_id: string,
  materialData: { name: string, quantity: number, estimated_unit_price: number, supplier?: string }
) {
  const supabase = await createClient()

  const { data: user, error: authError } = await supabase.auth.getUser()
  if (authError || !user.user) {
    return { success: false, error: 'Não autorizado' }
  }

  // 1. Insert the new material
  const { error: insertError } = await supabase
    .from('order_materials')
    .insert({
      service_order_id,
      name: materialData.name,
      quantity: materialData.quantity,
      estimated_unit_price: materialData.estimated_unit_price,
      supplier: materialData.supplier || null
    })

  if (insertError) {
    console.error("Insert error:", insertError)
    return { success: false, error: 'Erro ao adicionar material' }
  }

  // 2. Fetch all materials for this order to recalculate total
  const { data: materials, error: fetchError } = await supabase
    .from('order_materials')
    .select('quantity, estimated_unit_price')
    .eq('service_order_id', service_order_id)

  if (fetchError || !materials) {
    return { success: false, error: 'Erro ao calcular totais' }
  }

  const newTotal = materials.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.estimated_unit_price)), 0)

  // 3. Get the threshold (static 500 for now, ideally fetch from `settings` table)
  const THRESHOLD = 500;
  
  let newStatus = undefined;
  let requiresApproval = false;

  // 4. Se passar do limite, trava em quote_pending
  if (newTotal > THRESHOLD) {
    newStatus = 'quote_pending'
    requiresApproval = true
  }

  const updatePayload: any = {
    estimated_total: newTotal,
    requires_approval: requiresApproval,
    updated_at: new Date().toISOString()
  }

  if (newStatus) {
    updatePayload.status = newStatus
  }

  // 5. Update service order
  const { error: updateError } = await supabase
    .from('service_orders')
    .update(updatePayload)
    .eq('id', service_order_id)

  if (updateError) {
    console.error("Update error:", updateError)
    return { success: false, error: 'Erro ao atualizar ordem de serviço' }
  }

  revalidatePath(`/dashboard/protocols/${service_order_id}`)
  return { success: true }
}

export async function approveBudget(service_order_id: string) {
  const supabase = await createClient()

  const { data: user, error: authError } = await supabase.auth.getUser()
  if (authError || !user.user) {
    return { success: false, error: 'Não autorizado' }
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem aprovar orçamentos' }
  }

  const { error: updateError } = await supabase
    .from('service_orders')
    .update({
      status: 'approved',
      approved_by: user.user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', service_order_id)

  if (updateError) {
    return { success: false, error: 'Erro ao aprovar orçamento' }
  }

  revalidatePath(`/dashboard/protocols/${service_order_id}`)
  return { success: true }
}

export async function executeOrder(service_order_id: string) {
  const supabase = await createClient()

  // Simplified logic to move from Approved -> In Progress
  const { error: updateError } = await supabase
    .from('service_orders')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', service_order_id)

  if (updateError) {
    return { success: false, error: 'Erro ao iniciar execução' }
  }

  revalidatePath(`/dashboard/protocols/${service_order_id}`)
  return { success: true }
}
