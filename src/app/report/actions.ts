'use server'

import { createClient } from '@/utils/supabase/server'
import { getAITriage } from '../actions/ai-triage'

export type ReportActionState = {
  success: boolean;
  error: string;
  code: string;
}

export async function createPublicProtocol(
  prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const supabase = await createClient()
  
  const propertyId = formData.get('propertyId') as string
  const tenantName = formData.get('tenantName') as string
  const tenantPhone = formData.get('tenantPhone') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!propertyId || !title || !description) {
    return { success: false, error: 'Campos obrigatórios ausentes.', code: '' }
  }

  // Verify property exists
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .single()

  if (propError || !property) {
    return { success: false, error: 'Imóvel não encontrado.', code: '' }
  }

  // Generate a code (simple)
  const code = `PRO-${Math.random().toString(36).toUpperCase().slice(2, 8)}`

  // AI Triage
  const triage = await getAITriage(description)

  const { error } = await supabase
    .from('service_orders')
    .insert({
      property_id: propertyId,
      title,
      description,
      status: 'open',
      severity: triage?.severity || 'medium',
      category: triage?.category || 'Outros',
      code,
      meta: {
        tenant_name: tenantName,
        tenant_phone: tenantPhone,
        source: 'qr_code',
        ai_reason: triage?.reason
      }
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating public protocol:', error)
    return { success: false, error: 'Falha ao registrar chamado.', code: '' }
  }

  return { success: true, error: '', code }
}
