import { AuthScreen } from '@/components/gas-inteligente/auth-screen'
import { DashboardApp } from '@/components/gas-inteligente/dashboard-app'
import { defaultPreferences, isGasType, type Purchase, type UserProfile } from '@/lib/gas-types'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <AuthScreen />

  const [userResult, preferencesResult] = await Promise.all([
    supabase.from('users').select('id, nome, email, cidade, codigo_postal').eq('id', user.id).maybeSingle(),
    supabase.from('preferences').select('tipo_gas, entrega_domicilio, marca_favorita, consumo_mensal').eq('user_id', user.id).maybeSingle(),
  ])

  const purchaseRows: Array<{ id: string; data: string; fornecedor: string; marca: string; valor: number | string; tipo_gas: string }> = []
  let purchaseOffset = 0
  while (true) {
    const { data, error } = await supabase.from('purchases')
      .select('id, data, fornecedor, marca, valor, tipo_gas')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })
      .range(purchaseOffset, purchaseOffset + 999)
    if (error || !data?.length) break
    purchaseRows.push(...data)
    if (data.length < 1000) break
    purchaseOffset += data.length
  }

  const metadata = user.user_metadata ?? {}
  const preferredGasType = preferencesResult.data?.tipo_gas
  const metadataGasType = metadata.tipo_gas
  const gasType = isGasType(preferredGasType)
    ? preferredGasType
    : isGasType(metadataGasType) ? metadataGasType : defaultPreferences.gasType

  const profile: UserProfile = {
    id: user.id,
    name: userResult.data?.nome ?? metadata.nome ?? 'Utilizador',
    email: user.email ?? userResult.data?.email ?? '',
    city: userResult.data?.cidade ?? metadata.cidade ?? '',
    postalCode: userResult.data?.codigo_postal ?? metadata.codigo_postal ?? '',
    gasType,
    frequency: preferencesResult.data?.consumo_mensal ?? metadata.consumo_mensal ?? defaultPreferences.frequency,
    brand: preferencesResult.data?.marca_favorita ?? metadata.marca_favorita ?? defaultPreferences.brand,
    homeDelivery: preferencesResult.data?.entrega_domicilio ?? metadata.entrega_domicilio === 'true',
  }

  const purchases: Purchase[] = purchaseRows.map((purchase) => ({
    id: purchase.id,
    date: purchase.data,
    supplier: purchase.fornecedor,
    brand: purchase.marca,
    price: Number(purchase.valor),
    gasType: isGasType(purchase.tipo_gas) ? purchase.tipo_gas : defaultPreferences.gasType,
  }))

  return (
    <DashboardApp
      initialProfile={profile}
      initialPurchases={purchases}
      profileReady={Boolean(userResult.data && preferencesResult.data)}
    />
  )
}
