'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addMonths, format, parseISO } from 'date-fns'

export async function createPreventiveTemplate(formData: FormData) {
  const supabase = await createClient()
  
  const propertyId = formData.get('propertyId') as string
  const assetId = formData.get('assetId') as string || null
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const intervalMonths = parseInt(formData.get('intervalMonths') as string)
  const nextRunDate = formData.get('nextRunDate') as string

  const { data, error } = await supabase
    .from('preventive_templates')
    .insert({
      property_id: propertyId,
      asset_id: assetId,
      title,
      description,
      interval_months: intervalMonths,
      next_run_date: nextRunDate,
      active: true
    })
    .select()

  if (error) {
    console.error('Error creating preventive template:', error)
    return { error: 'Falha ao criar plano de preventiva.' }
  }

  revalidatePath(`/dashboard/properties/${propertyId}`)
  return { success: true, data }
}

/**
 * Checks for due preventive templates and generates Service Orders automatically.
 * This should be called either via a cron job or a manual trigger/page load.
 */
export async function processPreventives() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Get all active templates where next_run_date <= today
  const { data: templates, error } = await supabase
    .from('preventive_templates')
    .select('*, properties(nickname)')
    .eq('active', true)
    .lte('next_run_date', format(today, 'yyyy-MM-dd'))

  if (error || !templates) return { success: false, error }

  const results = []

  for (const template of templates) {
    // 2. Generate Service Order
    const code = `PREV-${Math.random().toString(36).toUpperCase().slice(2, 8)}`
    
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .insert({
        property_id: template.property_id,
        title: `[PREVENTIVA] ${template.title}`,
        description: `Manutenção Preventiva automática baseada no template: ${template.description}`,
        category: 'outros', // Default for preventive
        severity: 'medium',
        status: 'open',
        origin: 'preventive',
        code
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error auto-generating OS:', orderError)
      continue
    }

    // 3. Schedule next run date
    const nextDate = addMonths(parseISO(template.next_run_date), template.interval_months)
    
    await supabase
      .from('preventive_templates')
      .update({ next_run_date: format(nextDate, 'yyyy-MM-dd') })
      .eq('id', template.id)

    results.push({ id: template.id, orderId: order.id })
  }

  return { success: true, generatedCount: results.length }
}

export async function deletePreventiveTemplate(templateId: string, propertyId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('preventive_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('Error deleting template:', error)
    return { error: 'Falha ao excluir plano.' }
  }

  revalidatePath(`/dashboard/properties/${propertyId}`)
  return { success: true }
}
