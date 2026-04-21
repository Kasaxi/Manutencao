'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createProtocol(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const category = formData.get('category') as string
  const severity = formData.get('severity') as string

  // Simple SLA logic based on schema rules: Critical=4h, High=24h, Medium=72h, Low=168h
  const now = new Date()
  let slaHours = 72
  if (severity === 'critical') slaHours = 4
  else if (severity === 'high') slaHours = 24
  else if (severity === 'medium') slaHours = 72
  else if (severity === 'low') slaHours = 168

  const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000)

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    property_id: formData.get('property_id') as string,
    category: category,
    severity: severity,
    status: 'open',
    origin: 'tenant', // simplified origin
    created_by: user.id,
    sla_deadline: slaDeadline.toISOString(),
  }

  const { error } = await supabase.from('service_orders').insert(data)

  if (error) {
    console.error('Error creating protocol:', error)
    redirect('/dashboard/protocols/new?message=Failed to create protocol')
  }

  revalidatePath('/dashboard/protocols')
  redirect('/dashboard/protocols')
}
