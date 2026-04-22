'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createProperty(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  // Quick upsert profile to prevent FK constraint error
  await supabase.from('profiles').upsert({ id: user.id, full_name: user.email, role: 'admin' }, { onConflict: 'id' }).select()

  const data = {
    owner_id: user.id,
    nickname: formData.get('nickname') as string,
    property_type: formData.get('property_type') as 'house' | 'apartment' | 'commercial' | 'land',
    address_street: formData.get('address_street') as string,
    address_number: formData.get('address_number') as string,
    address_complement: formData.get('address_complement') as string,
    neighborhood: formData.get('neighborhood') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zipcode: formData.get('zipcode') as string,
    area_m2: formData.get('area_m2') ? Number(formData.get('area_m2')) : null,
    rooms: formData.get('rooms') ? Number(formData.get('rooms')) : null,
    status: formData.get('status') as 'rented' | 'own_use' | 'vacant',
    tenant_name: formData.get('tenant_name') as string,
    tenant_contact: formData.get('tenant_contact') as string,
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase.from('properties').insert(data)

  if (error) {
    console.error('Error creating property:', error)
    redirect('/dashboard/properties/new?message=Creation failed')
  }

  revalidatePath('/dashboard/properties')
  redirect('/dashboard/properties')
}
