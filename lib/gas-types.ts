export type GasType = 'Propano' | 'Butano' | 'Pluma'
export type DashboardView = 'Visão geral' | 'Histórico' | 'Fornecedores' | 'Assistente' | 'Perfil'

export type UserProfile = {
  id: string
  name: string
  email: string
  city: string
  postalCode: string
  gasType: GasType
  frequency: string
  brand: string
  favoriteSupplier: string
  homeDelivery: boolean
}

export type Purchase = {
  id: string
  date: string
  supplier: string
  brand: string
  price: number
  gasType: GasType
}

export const gasTypes: GasType[] = ['Propano', 'Butano', 'Pluma']

export function isGasType(value: unknown): value is GasType {
  return typeof value === 'string' && gasTypes.includes(value as GasType)
}

export const defaultPreferences = {
  gasType: 'Propano' as GasType,
  frequency: 'Quando preciso',
  brand: 'Galp',
  homeDelivery: true,
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatPurchaseDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}
