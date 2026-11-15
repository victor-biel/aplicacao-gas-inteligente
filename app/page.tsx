'use client'

import { useState } from 'react'
import {
  ArrowRight, Bell, Check, ChevronDown, Flame, House, MapPin,
  MessageCircle, Pencil, Send, ShoppingBag, Sparkles, UserRound,
} from 'lucide-react'

type GasType = 'Propano' | 'Butano' | 'Pluma'
type UserProfile = {
  city: string
  postalCode: string
  gasType: GasType
  frequency: string
  homeDelivery: boolean
  brand: string
}
type Message = { role: 'assistant' | 'user'; text: string }
type View = 'Visão geral' | 'Assistente' | 'Perfil'

const defaultProfile: UserProfile = {
  city: 'Porto',
  postalCode: '4000-123',
  gasType: 'Propano',
  frequency: '2 botijas por mês',
  homeDelivery: true,
  brand: 'Galp',
}

const initialMessages: Message[] = [
  { role: 'assistant', text: 'Olá! Sou o teu assistente de gás. Posso ajudar-te a encontrar a melhor opção para a tua casa.' },
]

function recommendationFor(profile: UserProfile) {
  return profile.gasType === 'Butano'
    ? { brand: 'Galp', price: '31,50', delivery: 'Entrega em 24 horas', saving: '2,00' }
    : profile.gasType === 'Pluma'
      ? { brand: 'Repsol', price: '32,90', delivery: 'Entrega em 24 horas', saving: '1,50' }
      : { brand: 'Rubis', price: '34,00', delivery: 'Entrega em 24 horas', saving: '2,50' }
}

function Onboarding({ profile, onComplete }: { profile: UserProfile; onComplete: (profile: UserProfile) => void }) {
  const [form, setForm] = useState(profile)
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setForm((current) => ({ ...current, [key]: value }))
  return <main className="mvp-onboarding"><a href="#inicio" className="mvp-brand"><span><Flame size={19} fill="currentColor" /></span> gás inteligente</a><div className="onboarding-layout"><section className="onboarding-intro"><span className="mvp-eyebrow"><Sparkles size={14} /> MENOS TEMPO A PROCURAR. MAIS TEMPO EM CASA.</span><h1>O teu gás,<br /><em>mais simples.</em></h1><p>Encontramos opções de gás na tua zona e ajudamos-te a escolher a que faz mais sentido para ti.</p><div className="onboarding-assurance"><span><Check size={14} /></span> Sem complicações. Começa em menos de 1 minuto.</div></section><form className="onboarding-card" onSubmit={(event) => { event.preventDefault(); onComplete(form) }}><div className="onboarding-card-head"><span className="step-indicator">1 <i /> 1</span><span className="mvp-eyebrow">A TUA CASA</span><h2>Vamos personalizar a experiência.</h2><p>Conta-nos um pouco sobre o teu consumo.</p></div><div className="mvp-form-grid"><label className="mvp-field">Cidade<input required value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="Ex.: Porto" autoComplete="address-level2" /></label><label className="mvp-field">Código postal<input required value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} placeholder="0000-000" autoComplete="postal-code" maxLength={8} /></label><label className="mvp-field">Tipo de gás<select value={form.gasType} onChange={(event) => update('gasType', event.target.value as GasType)}><option>Propano</option><option>Butano</option><option>Pluma</option></select></label><label className="mvp-field">Frequência de compra<select value={form.frequency} onChange={(event) => update('frequency', event.target.value)}><option>1 botija por mês</option><option>2 botijas por mês</option><option>1 botija a cada 2 meses</option><option>Quando preciso</option></select></label></div><label className="delivery-toggle"><span className="delivery-icon"><House size={17} /></span><span><strong>Entrega ao domicílio</strong><small>Prefiro receber a botija em casa</small></span><input type="checkbox" checked={form.homeDelivery} onChange={(event) => update('homeDelivery', event.target.checked)} /><i /></label><button className="mvp-primary-button" type="submit">Ver a minha melhor oferta <ArrowRight size={17} /></button><p className="onboarding-footnote">Os teus dados ficam apenas nesta demonstração.</p></form></div></main>
}

function MvpSidebar({ view, setView, profile }: { view: View; setView: (view: View) => void; profile: UserProfile }) {
  return <aside className="mvp-sidebar"><a className="mvp-brand" href="#inicio"><span><Flame size={18} fill="currentColor" /></span> gás inteligente</a><div className="mvp-nav-label">A TUA CASA</div><nav className="mvp-nav" aria-label="Navegação principal"><button className={view === 'Visão geral' ? 'selected' : ''} onClick={() => setView('Visão geral')}><House size={18} /> Visão geral</button><button className={view === 'Assistente' ? 'selected' : ''} onClick={() => setView('Assistente')}><MessageCircle size={18} /> Assistente</button><button className={view === 'Perfil' ? 'selected' : ''} onClick={() => setView('Perfil')}><UserRound size={18} /> Perfil</button></nav><div className="mvp-sidebar-foot"><div className="mvp-sidebar-help"><span><Sparkles size={16} /></span><strong>Uma escolha mais simples.</strong><small>Estamos aqui para ajudar.</small><button onClick={() => setView('Assistente')}>Falar com o assistente <ArrowRight size={14} /></button></div><div className="mvp-sidebar-profile"><span className="mvp-avatar">{profile.city.slice(0, 1).toUpperCase()}</span><div><strong>A tua casa</strong><small>{profile.city}, Portugal</small></div></div></div></aside>
}

function OfferCard({ profile, onQuestion }: { profile: UserProfile; onQuestion: () => void }) {
  const offer = recommendationFor(profile)
  return <article className="best-offer-card"><div className="offer-card-top"><span className="mvp-eyebrow">A MELHOR OFERTA PARA TI</span><span className="offer-match"><Sparkles size={13} /> Recomendado</span></div><div className="offer-content"><div className="offer-brand-mark"><Flame size={22} /></div><div className="offer-description"><strong>{offer.brand}</strong><span>{profile.gasType} · Botija 11 kg</span></div><div className="offer-price"><strong>€ {offer.price}</strong><span>preço estimado</span></div></div><div className="offer-benefits"><span><Check size={14} /> {profile.homeDelivery ? offer.delivery : 'Disponível na tua zona'}</span><span><Check size={14} /> € {offer.saving} abaixo do preço de referência simulado</span></div><button className="offer-action" onClick={onQuestion}>Perguntar sobre esta oferta <ArrowRight size={16} /></button><div className="offer-disclaimer">Preços simulados para demonstração. Confirma sempre o valor com o fornecedor.</div></article>
}

function Assistant({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const offer = recommendationFor(profile)
  const send = (prompt = draft) => {
    const text = prompt.trim()
    if (!text) return
    const answer = `Para ${profile.city}, encontrei uma opção simulada da ${offer.brand} para ${profile.gasType.toLowerCase()} a € ${offer.price}. ${profile.homeDelivery ? 'A entrega ao domicílio está disponível em 24 horas.' : 'Podes consultar a disponibilidade de recolha na tua zona.'} Os preços são apenas ilustrativos.`
    setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: answer }])
    setDraft('')
  }
  return <section className="assistant-screen"><div className="mvp-page-heading"><div><span className="mvp-eyebrow">ASSISTENTE GÁS INTELIGENTE</span><h1>Em que posso ajudar?</h1><p>Uma forma simples de comparar opções para a tua casa.</p></div><span className="assistant-heading-icon"><Sparkles size={20} /></span></div><div className="assistant-window"><header className="assistant-window-head"><div className="assistant-mark"><Sparkles size={18} /></div><div><strong>O teu assistente</strong><span><i /> Respostas de demonstração</span></div></header><div className="assistant-thread" aria-live="polite">{messages.map((message, index) => <div className={`mvp-message ${message.role === 'user' ? 'from-user' : ''}`} key={`${message.role}-${index}`}>{message.role === 'assistant' && <span className="assistant-mini-icon"><Sparkles size={13} /></span>}<p>{message.text}</p></div>)}{messages.length === 1 && <div className="assistant-suggestions"><button onClick={() => send('Qual o melhor fornecedor para mim?')}>Qual o melhor fornecedor para mim? <ArrowRight size={14} /></button><button onClick={() => send('Têm entrega ao domicílio?')}>Têm entrega ao domicílio? <ArrowRight size={14} /></button><button onClick={() => send('Compara opções de gás na minha zona')}>Compara opções na minha zona <ArrowRight size={14} /></button></div>}</div><form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); send() }}><input aria-label="Escreve uma mensagem" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escreve a tua pergunta..." /><button type="submit" aria-label="Enviar mensagem"><Send size={17} /></button></form><p className="assistant-privacy">Demonstração com respostas simuladas. Não é feita nenhuma pesquisa real.</p></div></section>
}

function Profile({ profile, onSave }: { profile: UserProfile; onSave: (profile: UserProfile) => void }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => { setForm((current) => ({ ...current, [key]: value })); setSaved(false) }
  return <section className="profile-screen"><div className="mvp-page-heading"><div><span className="mvp-eyebrow">O TEU PERFIL</span><h1>As tuas preferências.</h1><p>Atualiza os detalhes para receberes sugestões mais relevantes.</p></div></div><form className="profile-form" onSubmit={(event) => { event.preventDefault(); onSave(form); setSaved(true) }}><div className="profile-form-head"><span className="profile-large-avatar"><UserRound size={23} /></span><div><strong>Perfil da tua casa</strong><span>Usamos estas informações nas recomendações simuladas.</span></div></div><div className="mvp-form-grid"><label className="mvp-field">Cidade<input required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" /></label><label className="mvp-field">Código postal<input required value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} maxLength={8} autoComplete="postal-code" /></label><label className="mvp-field">Tipo de gás<select value={form.gasType} onChange={(event) => update('gasType', event.target.value as GasType)}><option>Propano</option><option>Butano</option><option>Pluma</option></select></label><label className="mvp-field">Frequência de compra<select value={form.frequency} onChange={(event) => update('frequency', event.target.value)}><option>1 botija por mês</option><option>2 botijas por mês</option><option>1 botija a cada 2 meses</option><option>Quando preciso</option></select></label><label className="mvp-field">Marca habitual<select value={form.brand} onChange={(event) => update('brand', event.target.value)}><option>Galp</option><option>Rubis</option><option>Repsol</option><option>Outra</option></select></label></div><label className="delivery-toggle"><span className="delivery-icon"><House size={17} /></span><span><strong>Entrega ao domicílio</strong><small>Prefiro receber a botija em casa</small></span><input type="checkbox" checked={form.homeDelivery} onChange={(event) => update('homeDelivery', event.target.checked)} /><i /></label><div className="profile-save-row">{saved && <span role="status"><Check size={15} /> Preferências atualizadas</span>}<button className="mvp-primary-button" type="submit">Guardar preferências <Check size={16} /></button></div></form></section>
}

export default function Page() {
  const [onboarded, setOnboarded] = useState(false)
  const [profile, setProfile] = useState(defaultProfile)
  const [view, setView] = useState<View>('Visão geral')
  if (!onboarded) return <Onboarding profile={profile} onComplete={(nextProfile) => { setProfile(nextProfile); setOnboarded(true) }} />
  const offer = recommendationFor(profile)
  return <div className="mvp-app" id="inicio"><MvpSidebar view={view} setView={setView} profile={profile} /><main className="mvp-main"><header className="mvp-topbar"><div className="mvp-breadcrumb">A tua casa <ChevronDown size={14} /><span>{view}</span></div><div className="mvp-top-actions"><span className="mvp-location"><MapPin size={15} /> {profile.city}, Portugal</span><button className="mvp-bell" aria-label="Notificações"><Bell size={18} /><i /></button><button className="mvp-avatar top-profile" aria-label="Abrir perfil" onClick={() => setView('Perfil')}>{profile.city.slice(0, 1).toUpperCase()}</button></div></header><div className="mvp-dashboard">{view === 'Visão geral' && <><section className="mvp-welcome"><div><span className="mvp-eyebrow">A TUA CASA, AO TEU RITMO</span><h1>Olá! Vamos simplificar o teu gás.</h1><p>Encontrámos uma opção para {profile.city} que pode fazer sentido para ti.</p></div><button className="profile-edit-link" onClick={() => setView('Perfil')}><Pencil size={15} /> Editar perfil</button></section><section className="mvp-summary-grid"><article className="mvp-info-card"><span className="mvp-card-icon"><MapPin size={17} /></span><span className="mvp-card-label">A TUA LOCALIZAÇÃO</span><strong>{profile.city}</strong><small>{profile.postalCode}, Portugal</small></article><article className="mvp-info-card"><span className="mvp-card-icon"><Flame size={17} /></span><span className="mvp-card-label">O TEU TIPO DE GÁS</span><strong>{profile.gasType}</strong><small>Botija doméstica</small></article><article className="mvp-info-card"><span className="mvp-card-icon"><ShoppingBag size={17} /></span><span className="mvp-card-label">FREQUÊNCIA MÉDIA</span><strong>{profile.frequency}</strong><small>Preferência: {profile.homeDelivery ? 'entrega em casa' : 'recolha'}</small></article></section><div className="offer-section-heading"><div><span className="mvp-eyebrow">ESCOLHIDO A PENSAR EM TI</span><h2>A tua melhor oferta.</h2></div><span className="simulated-tag">Demonstração</span></div><div className="mvp-dashboard-lower"><OfferCard profile={profile} onQuestion={() => setView('Assistente')} /><aside className="mvp-personal-tip"><div className="tip-icon"><Sparkles size={18} /></div><span className="mvp-eyebrow">RECOMENDAÇÃO PERSONALIZADA</span><h3>Uma boa escolha começa com o que precisas.</h3><p>Tendo em conta que costumas escolher {profile.brand}, comparamos uma alternativa com uma poupança simulada de € {offer.saving} face ao preço de referência da {profile.brand}.</p><button onClick={() => setView('Assistente')}>Pergunta ao assistente <ArrowRight size={15} /></button></aside></div><section className="mvp-assistant-cta"><span className="cta-assistant-icon"><MessageCircle size={18} /></span><div><strong>Queres ajuda a escolher?</strong><span>Pergunta ao assistente sobre fornecedores e entrega.</span></div><button onClick={() => setView('Assistente')}>Começar conversa <ArrowRight size={16} /></button></section><p className="mvp-disclaimer">As ofertas, preços e recomendações apresentados são dados simulados e não representam disponibilidade real.</p></>}{view === 'Assistente' && <Assistant profile={profile} />}{view === 'Perfil' && <Profile profile={profile} onSave={setProfile} />}</div></main><nav className="mvp-mobile-nav" aria-label="Navegação móvel"><button className={view === 'Visão geral' ? 'selected' : ''} onClick={() => setView('Visão geral')}><House size={19} /><span>Início</span></button><button className={view === 'Assistente' ? 'selected' : ''} onClick={() => setView('Assistente')}><MessageCircle size={19} /><span>Assistente</span></button><button className={view === 'Perfil' ? 'selected' : ''} onClick={() => setView('Perfil')}><UserRound size={19} /><span>Perfil</span></button></nav></div>
}
