'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAsset(formData: FormData) {
  const supabase = await createClient()
  
  const propertyId = formData.get('propertyId') as string
  const name = formData.get('name') as string
  const brand = formData.get('brand') as string
  const model = formData.get('model') as string
  const serialNumber = formData.get('serialNumber') as string
  const installDate = formData.get('installDate') as string
  const warrantyUntil = formData.get('warrantyUntil') as string

  const { data, error } = await supabase
    .from('property_assets')
    .insert({
      property_id: propertyId,
      name,
      brand,
      model,
      serial_number: serialNumber,
      install_date: installDate || null,
      warranty_until: warrantyUntil || null
    })
    .select()

  if (error) {
    console.error('Error creating asset:', error)
    return { error: 'Falha ao criar ativo.' }
  }

  revalidatePath(`/dashboard/properties/${propertyId}`)
  return { success: true, data }
}

export async function deleteAsset(assetId: string, propertyId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('property_assets')
    .delete()
    .eq('id', assetId)

  if (error) {
    console.error('Error deleting asset:', error)
    return { error: 'Falha ao excluir ativo.' }
  }

  revalidatePath(`/dashboard/properties/${propertyId}`)
  return { success: true }
}
