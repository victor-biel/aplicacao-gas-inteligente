'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, BrainCircuit, CalendarDays, Check, ChevronDown, ClipboardList, Flame, House, LogOut, MapPin, Pencil, Plus, Search, ShoppingBag, UserRound, Wallet } from 'lucide-react'
import { GasAssistant } from '@/components/gas-inteligente/gas-assistant'
import { SpendingChart } from '@/components/gas-inteligente/spending-chart'
import { getDaysSincePurchase, getMonthlyConsumption, getMonthlySpending, getRefillEstimate } from '@/lib/gas-insights'
import { PurchaseDialog } from '@/components/gas-inteligente/purchase-dialog'
import { SupplierSearch } from '@/components/gas-inteligente/supplier-search'
import { createClient } from '@/lib/supabase/client'
import { formatEuro, formatPurchaseDate, gasTypes, type DashboardView, type GasType, type Purchase, type UserProfile } from '@/lib/gas-types'

type DashboardAppProps = {
  initialProfile: UserProfile
  initialPurchases: Purchase[]
  profileReady: boolean
}

const navigation: { view: DashboardView; label: string; icon: typeof House }[] = [
  { view: 'Visão geral', label: 'Visão geral', icon: House },
  { view: 'Histórico', label: 'Histórico de compras', icon: ClipboardList },
  { view: 'Fornecedores', label: 'Encontrar fornecedores', icon: Search },
  { view: 'Assistente', label: 'Assistente inteligente', icon: BrainCircuit },
  { view: 'Perfil', label: 'Perfil e preferências', icon: UserRound },
]

export function DashboardApp({ initialProfile, initialPurchases, profileReady: initialProfileReady }: DashboardAppProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [purchases, setPurchases] = useState(initialPurchases)
  const [profileReady, setProfileReady] = useState(initialProfileReady)
  const [view, setView] = useState<DashboardView>('Visão geral')
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const newestPurchase = purchases[0]
  const totalSpent = useMemo(() => purchases.reduce((total, purchase) => total + purchase.price, 0), [purchases])
  const monthlySpending = useMemo(() => getMonthlySpending(purchases), [purchases])
  const monthlyTotal = useMemo(() => {
    const now = new Date()
    return purchases.reduce((total, purchase) => {
      const [year, month] = purchase.date.split('-').map(Number)
      return year === now.getFullYear() && month === now.getMonth() + 1 ? total + purchase.price : total
    }, 0)
  }, [purchases])
  const monthlyConsumption = useMemo(() => getMonthlyConsumption(purchases, profile.frequency), [purchases, profile.frequency])
  const refillEstimate = useMemo(() => getRefillEstimate(purchases, profile.frequency), [purchases, profile.frequency])
  const assistantAverage = monthlyConsumption === null ? 'Sem dados suficientes' : `${monthlyConsumption.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} ${monthlyConsumption > 1.05 ? 'botijas' : 'botija'} por mês`
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileError('')
    setProfileSaved(false)
    const supabase = createClient()
    const [userResult, preferencesResult] = await Promise.all([
      supabase.from('users').upsert({ id: profile.id, nome: profile.name.trim(), email: profile.email, cidade: profile.city.trim(), codigo_postal: profile.postalCode.trim() }, { onConflict: 'id' }),
      supabase.from('preferences').upsert({ user_id: profile.id, tipo_gas: profile.gasType, entrega_domicilio: profile.homeDelivery, marca_favorita: profile.brand, fornecedor_favorito: profile.favoriteSupplier.trim() || null, consumo_mensal: profile.frequency }, { onConflict: 'user_id' }),
    ])
    setSavingProfile(false)
    if (userResult.error || preferencesResult.error) {
      setProfileError('Não foi possível guardar as alterações. Confirma a ligação e tenta novamente.')
      return
    }
    setProfileReady(true)
    setProfileSaved(true)
  }

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  function updateProfile<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setProfileSaved(false)
    setProfileError('')
  }

  function addPurchase(purchase: Purchase) {
    setPurchases((current) => [purchase, ...current].sort((left, right) => right.date.localeCompare(left.date)))
    setShowPurchaseDialog(false)
    setView('Histórico')
  }

  return (
    <div className="mvp-app" id="inicio">
      <aside className="mvp-sidebar">
        <a className="mvp-brand" href="#inicio"><span><Flame size={17} /></span> Gás Inteligente</a>
        <span className="mvp-nav-label">A TUA CONTA</span>
        <nav className="mvp-nav" aria-label="Navegação principal">
          {navigation.map(({ view: target, label, icon: Icon }) => <button key={target} type="button" className={view === target ? 'selected' : ''} aria-current={view === target ? 'page' : undefined} onClick={() => setView(target)}><Icon size={16} /><span>{label}</span>{target === 'Histórico' && <span className="nav-count">{purchases.length}</span>}</button>)}
        </nav>
        <div className="mvp-sidebar-foot">
          <div className="mvp-sidebar-help"><span><ShieldCheckIcon /></span><strong>Os teus dados, protegidos</strong><small>Só tu tens acesso ao teu histórico.</small></div>
          <button className="mvp-sidebar-profile" type="button" onClick={signOut} disabled={signingOut}>
            <span className="mvp-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><span className="sidebar-user-copy"><strong>{profile.name}</strong><small>{signingOut ? 'A terminar sessão...' : profile.email}</small></span><LogOut size={15} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className="mvp-main">
        <header className="mvp-topbar"><div className="mvp-breadcrumb">A tua casa <ChevronDown size={14} /><span>{view}</span></div><div className="mvp-top-actions"><span className="mvp-location"><MapPin size={15} /> {profile.city || 'A tua localização'}, Portugal</span><span className="topbar-divider" /><span className="topbar-account">{profile.name}</span><button className="mvp-avatar top-profile" type="button" aria-label="Abrir perfil" onClick={() => setView('Perfil')}>{profile.name.slice(0, 1).toUpperCase()}</button></div></header>

        <div className="mvp-dashboard">
          {!profileReady && <div className="setup-notice" role="status"><span><Check size={16} /></span><p>Completa o teu perfil para começar a guardar compras.</p><button type="button" onClick={() => setView('Perfil')}>Completar perfil <ArrowRight size={14} /></button></div>}

          {view === 'Visão geral' && <>
            <section className="mvp-welcome"><div><span className="mvp-eyebrow">A TUA CASA, AO TEU RITMO</span><h1>Olá, {profile.name.split(' ')[0]}.</h1><p>O teu histórico de gás, organizado num só lugar.</p></div><button className="profile-edit-link" type="button" onClick={() => setShowPurchaseDialog(true)} disabled={!profileReady}><Plus size={15} /> Registar compra</button></section>
            <section className="mvp-summary-grid" aria-label="Indicadores de consumo">
              <article className="mvp-info-card"><span className="mvp-card-icon"><Flame size={17} /></span><span className="mvp-card-label">CONSUMO MÉDIO MENSAL</span><strong>{assistantAverage}</strong><small>{purchases.length > 1 ? 'calculado pelo intervalo entre compras' : 'com base na frequência do perfil'}</small></article>
              <article className="mvp-info-card"><span className="mvp-card-icon"><CalendarDays size={17} /></span><span className="mvp-card-label">PRÓXIMA REPOSIÇÃO</span><strong>{refillEstimate ? refillEstimate.daysUntil === 0 ? 'A qualquer momento' : `Em cerca de ${refillEstimate.daysUntil} ${refillEstimate.daysUntil === 1 ? 'dia' : 'dias'}` : 'Por estimar'}</strong><small>{refillEstimate ? `Previsão: ${formatPurchaseDate(refillEstimate.date.toISOString().slice(0, 10))}` : 'Regista compras para criar uma previsão'}</small></article>
              <article className="mvp-info-card"><span className="mvp-card-icon"><Wallet size={17} /></span><span className="mvp-card-label">GASTO ESTE MÊS</span><strong>{formatEuro(monthlyTotal)}</strong><small>{purchases.length} compras no histórico completo</small></article>
            </section>
            <div className="overview-content-grid">
              <section className="overview-panel"><div className="panel-heading"><div><span className="mvp-eyebrow">ATIVIDADE RECENTE</span><h2>Últimas compras</h2></div><button className="text-action" type="button" onClick={() => setView('Histórico')}>Ver histórico <ArrowRight size={14} /></button></div>
                {purchases.length ? <div className="recent-purchases">{purchases.slice(0, 4).map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} />)}</div> : <EmptyPurchases onAdd={() => setShowPurchaseDialog(true)} disabled={!profileReady} />}
              </section>
              <aside className="overview-side-card"><span className="overview-side-icon"><CalendarDays size={17} /></span><span className="mvp-eyebrow">ÚLTIMA COMPRA</span>{newestPurchase ? <><strong className="overview-side-value">Há {getDaysSincePurchase(newestPurchase.date)} dias</strong><p>{formatPurchaseDate(newestPurchase.date)} · {newestPurchase.brand} · {formatEuro(newestPurchase.price)}</p></> : <><strong className="overview-side-value">Ainda sem compras</strong><p>Regista a tua primeira compra para começares a acompanhar os teus gastos.</p></>}<button type="button" onClick={() => newestPurchase ? setView('Histórico') : setShowPurchaseDialog(true)} disabled={!profileReady}>{newestPurchase ? 'Abrir histórico' : 'Registar compra'} <ArrowRight size={14} /></button></aside>
            </div>
            <section className="mvp-preferences-strip"><div><span className="mvp-eyebrow">AS TUAS PREFERÊNCIAS</span><h2>Feitas à tua medida.</h2></div><div className="preferences-inline"><span><Flame size={15} /> {profile.gasType}</span><span><ShoppingBag size={15} /> {profile.brand}</span><span><MapPin size={15} /> {profile.favoriteSupplier || 'Fornecedor por definir'}</span><span><BarChart3 size={15} /> {profile.frequency}</span></div><button className="text-action" type="button" onClick={() => setView('Perfil')}>Editar <Pencil size={13} /></button></section>
            <div className="overview-analytics-grid"><SpendingChart data={monthlySpending} /><aside className="insight-card"><span className="insight-card-icon"><BrainCircuit size={18} /></span><span className="mvp-eyebrow">RECOMENDAÇÃO PERSONALIZADA</span><h2>{refillEstimate ? refillEstimate.daysUntil === 0 ? 'A reposição pode estar próxima.' : `Nova botija em cerca de ${refillEstimate.daysUntil} ${refillEstimate.daysUntil === 1 ? 'dia' : 'dias'}.` : 'Começa pelo teu histórico.'}</h2><p>{refillEstimate ? `A previsão usa um intervalo médio de ${refillEstimate.intervalDays} dias. É uma estimativa baseada nas compras registadas.` : 'Com mais compras registadas, conseguimos estimar melhor o teu ritmo de consumo.'}</p><button type="button" onClick={() => setView('Assistente')}>Perguntar ao assistente <ArrowRight size={14} /></button></aside></div>
            <button className="assistant-shortcut" type="button" onClick={() => setView('Assistente')}><span><BrainCircuit size={17} /></span><span><strong>Queres saber mais sobre os teus gastos?</strong><small>Pergunta ao assistente e obtém respostas baseadas nas tuas compras.</small></span><ArrowRight size={15} /></button>
            <p className="mvp-disclaimer">Os valores e previsões usam apenas o histórico e as preferências que registaste. A data de reposição é uma estimativa e pode variar.</p>
          </>}

          {view === 'Histórico' && <section className="history-screen">
            <div className="mvp-page-heading history-heading"><div><span className="mvp-eyebrow">A TUA ATIVIDADE</span><h1>Histórico de compras.</h1><p>Consulta e acompanha as compras de gás que registaste.</p></div><button className="history-add-button" type="button" onClick={() => setShowPurchaseDialog(true)} disabled={!profileReady}><Plus size={15} /> Registar compra</button></div>
            <div className="history-summary"><span className="history-summary-icon"><ShoppingBag size={17} /></span><div><strong>{purchases.length} {purchases.length === 1 ? 'compra registada' : 'compras registadas'}</strong><small>Total acumulado: {formatEuro(totalSpent)}</small></div></div>
            {purchases.length ? <div className="history-list" aria-label="Compras registadas">{purchases.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} expanded />)}</div> : <div className="history-empty"><span><ClipboardList size={22} /></span><h2>O teu histórico começa aqui.</h2><p>Regista as tuas compras para teres todos os valores e datas num só lugar.</p><button type="button" className="mvp-primary-button" onClick={() => setShowPurchaseDialog(true)} disabled={!profileReady}><Plus size={15} /> Registar a primeira compra</button></div>}
          </section>}

          {view === 'Fornecedores' && <SupplierSearch profile={profile} purchases={purchases} />}

          {view === 'Assistente' && <GasAssistant purchases={purchases} frequency={profile.frequency} onClose={() => setView('Visão geral')} />}

          {view === 'Perfil' && <section className="profile-screen"><div className="mvp-page-heading"><div><span className="mvp-eyebrow">A TUA CONTA</span><h1>Perfil e preferências.</h1><p>Atualiza os teus dados e as preferências da tua casa.</p></div></div><form className="profile-form" onSubmit={saveProfile}>
            <div className="profile-form-head"><span className="profile-large-avatar"><UserRound size={23} /></span><div><strong>Perfil da tua casa</strong><span>As tuas informações são privadas e guardadas na tua conta.</span></div></div>
            <div className="mvp-form-grid"><label className="mvp-field">Nome<input required maxLength={100} value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} autoComplete="name" /></label><label className="mvp-field">Email<input type="email" value={profile.email} readOnly disabled aria-describedby="email-help" /><small id="email-help">O email é gerido pela tua conta.</small></label><label className="mvp-field">Cidade<input required maxLength={100} value={profile.city} onChange={(event) => updateProfile('city', event.target.value)} autoComplete="address-level2" /></label><label className="mvp-field">Código postal<input required maxLength={8} value={profile.postalCode} onChange={(event) => updateProfile('postalCode', event.target.value)} autoComplete="postal-code" /></label><label className="mvp-field">Tipo de gás<select value={profile.gasType} onChange={(event) => updateProfile('gasType', event.target.value as GasType)}>{gasTypes.map((option) => <option key={option}>{option}</option>)}</select></label><label className="mvp-field">Frequência de compra<select value={profile.frequency} onChange={(event) => updateProfile('frequency', event.target.value)}><option>1 botija por mês</option><option>2 botijas por mês</option><option>1 botija a cada 2 meses</option><option>Quando preciso</option></select></label><label className="mvp-field">Marca favorita<select value={profile.brand} onChange={(event) => updateProfile('brand', event.target.value)}><option>Galp</option><option>Rubis</option><option>Repsol</option><option>Outra</option></select></label><label className="mvp-field">Fornecedor favorito<input maxLength={100} value={profile.favoriteSupplier} onChange={(event) => updateProfile('favoriteSupplier', event.target.value)} placeholder="Ex.: loja ou distribuidor habitual" autoComplete="organization" /></label></div>
            <label className="delivery-toggle"><span className="delivery-icon"><House size={17} /></span><span><strong>Entrega ao domicílio</strong><small>Prefiro receber a botija em casa</small></span><input type="checkbox" checked={profile.homeDelivery} onChange={(event) => updateProfile('homeDelivery', event.target.checked)} /><i aria-hidden="true" /></label>
            {profileError && <p className="form-error" role="alert">{profileError}</p>}
            <div className="profile-save-row"><span role="status">{profileSaved && <><Check size={13} /> Alterações guardadas.</>}</span><button className="mvp-primary-button" type="submit" disabled={savingProfile}>{savingProfile ? 'A guardar...' : 'Guardar alterações'} <ArrowRight size={14} /></button></div>
          </form></section>}
        </div>
      </main>
      <nav className="mvp-mobile-nav" aria-label="Navegação móvel">{navigation.map(({ view: target, label, icon: Icon }) => <button key={target} type="button" className={view === target ? 'selected' : ''} aria-current={view === target ? 'page' : undefined} onClick={() => setView(target)}><Icon size={19} /><span>{target === 'Visão geral' ? 'Início' : target === 'Histórico' ? 'Histórico' : target === 'Assistente' ? 'Assistente' : 'Perfil'}</span></button>)}</nav>
      {showPurchaseDialog && profileReady && <PurchaseDialog userId={profile.id} defaultGasType={profile.gasType} defaultBrand={profile.brand} onClose={() => setShowPurchaseDialog(false)} onSaved={addPurchase} />}
    </div>
  )
}

function PurchaseRow({ purchase, expanded = false }: { purchase: Purchase; expanded?: boolean }) {
  return <article className={`purchase-row ${expanded ? 'expanded' : ''}`}><span className="purchase-brand-icon"><Flame size={17} /></span><div className="purchase-row-main"><strong>{purchase.brand}</strong><span>{purchase.supplier} · {purchase.gasType}</span></div><div className="purchase-row-date"><CalendarDays size={13} /><span>{formatPurchaseDate(purchase.date)}</span></div><strong className="purchase-row-price">{formatEuro(purchase.price)}</strong></article>
}

function EmptyPurchases({ onAdd, disabled }: { onAdd: () => void; disabled: boolean }) {
  return <div className="empty-purchases"><span><ShoppingBag size={19} /></span><div><strong>Sem compras registadas</strong><p>Adiciona a tua primeira compra para começares o histórico.</p></div><button type="button" onClick={onAdd} disabled={disabled}>Registar <ArrowRight size={14} /></button></div>
}

function ShieldCheckIcon() {
  return <Check size={15} />
}
