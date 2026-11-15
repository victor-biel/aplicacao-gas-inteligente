'use client'

import { useState } from 'react'
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, Clock3,
  Flame, House, MapPin, MessageCircle, MoreHorizontal, Plus, Send, ShoppingBag,
  Sparkles, TrendingDown, UserRound, Wallet, X,
} from 'lucide-react'

type Message = { role: 'assistant' | 'user'; text: string }

const initialMessages: Message[] = [
  { role: 'assistant', text: 'Olá, Inês! 👋 Vi que a tua botija costuma durar cerca de 6 semanas. Queres que encontre as melhores opções de entrega para ti?' },
]

function Sidebar({ active, setActive }: { active: string; setActive: (value: string) => void }) {
  const items = [
    { label: 'Visão geral', icon: House },
    { label: 'O meu consumo', icon: TrendingDown },
    { label: 'Fornecedores', icon: ShoppingBag },
    { label: 'Assistente', icon: MessageCircle },
  ]
  return (
    <aside className="sidebar">
      <a href="#inicio" className="brand"><span className="brand-mark"><Flame size={19} fill="currentColor" /></span><span>gás<span className="brand-light"> inteligente</span></span></a>
      <div className="home-label">A TUA CASA</div>
      <nav aria-label="Navegação principal" className="nav-list">
        {items.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`nav-item ${active === label ? 'active' : ''}`}><Icon size={19} strokeWidth={1.8} />{label}{label === 'Assistente' && <span className="nav-new">novo</span>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><Sparkles size={17} /></div><strong>Uma casa mais simples.</strong><span>Estamos aqui para ajudar.</span><button onClick={() => setActive('Assistente')}>Falar com o assistente <ArrowRight size={14} /></button></div><button className="profile-button"><span className="avatar">IS</span><span className="profile-text"><strong>Inês Silva</strong><small>Lisboa, Portugal</small></span><MoreHorizontal size={19} /></button></div>
    </aside>
  )
}

function ConsumptionChart() {
  const bars = [40, 65, 51, 80, 59, 70, 46, 78, 64, 87, 57, 73, 49, 66, 42, 61, 54, 84, 64, 73]
  return <div className="chart-area"><div className="chart-y"><span>€40</span><span>€30</span><span>€20</span><span>€10</span></div><div className="chart-main"><div className="chart-grid"><i /><i /><i /><i /></div><div className="bar-list">{bars.map((height, index) => <div className="bar-column" key={index}><span className={`chart-bar ${index === 17 ? 'highlight-bar' : ''}`} style={{ height: `${height}%` }} /></div>)}</div><div className="chart-x"><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span></div></div></div>
}

function ChatPanel() {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const sendMessage = (text = draft) => {
    const content = text.trim()
    if (!content) return
    setMessages((current) => [...current, { role: 'user', text: content }, { role: 'assistant', text: 'Claro! Para a tua zona de Lisboa, encontrei opções de entrega ao domicílio a partir de 29,90 €. Queres comparar os fornecedores disponíveis?' }])
    setDraft('')
  }
  return <section className="chat-card" id="assistente" aria-label="Assistente Gás Inteligente"><div className="chat-header"><div className="chat-avatar"><Sparkles size={19} /></div><div><h3>O teu assistente</h3><p><span className="online-dot" /> Sempre por aqui para ajudar</p></div><button aria-label="Mais opções" className="icon-button"><MoreHorizontal size={21} /></button></div><div className="chat-content"><div className="today-label"><span /> HOJE, 15 DE NOVEMBRO <span /></div>{messages.map((message, index) => <div className={`message-row ${message.role === 'user' ? 'user-row' : ''}`} key={`${message.role}-${index}`}>{message.role === 'assistant' && <span className="mini-bot"><Sparkles size={13} /></span>}<div className={`message-bubble ${message.role === 'user' ? 'user-bubble' : ''}`}>{message.text}</div></div>)}<div className="quick-prompts"><button onClick={() => sendMessage('Quero comparar preços')}>Comparar preços <ArrowUpRight size={13} /></button><button onClick={() => sendMessage('Quero marcar uma entrega')}>Marcar entrega <ArrowUpRight size={13} /></button></div></div><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}><input aria-label="Escreve uma mensagem" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escreve a tua mensagem..." /><button aria-label="Enviar mensagem" type="submit"><Send size={17} /></button></form><div className="chat-footnote">O teu assistente aprende contigo. <span>Privado e seguro</span></div></section>
}

export default function Page() {
  const [active, setActive] = useState('Visão geral')
  const [showPurchase, setShowPurchase] = useState(false)
  const [purchaseSaved, setPurchaseSaved] = useState(false)
  const [gasType, setGasType] = useState('Propano')
  return <div className="app-shell" id="inicio"><Sidebar active={active} setActive={setActive} /><main className="main-content"><header className="topbar"><div className="breadcrumb">A tua casa <ChevronDown size={14} /><span className="breadcrumb-current">Visão geral</span></div><div className="topbar-actions"><div className="location-pill"><MapPin size={15} /><span>Lisboa, Portugal</span><ChevronDown size={13} /></div><button className="notification-button" aria-label="Notificações"><Bell size={18} /><i /></button><span className="avatar top-avatar">IS</span></div></header><div className="dashboard"><section className="welcome-row"><div><div className="eyebrow"><span className="welcome-spark">✳</span> DOMINGO, 15 DE NOVEMBRO DE 2026</div><h1>Bom dia, Inês <span className="wave">✳</span></h1><p className="welcome-subtitle">A tua energia, sempre sob controlo.</p></div><button onClick={() => { setShowPurchase(true); setPurchaseSaved(false) }} className="add-purchase"><Plus size={17} /> Registar compra</button></section>
<section className="overview-grid" aria-label="Resumo da conta"><article className="next-card"><div className="next-top"><span className="card-kicker">PRÓXIMA REPOSIÇÃO</span><span className="status-badge"><span /> PREVISTA</span></div><div className="next-main"><div><div className="days-count">12<span>dias</span></div><p className="next-date">Por volta de <strong>27 nov.</strong></p></div><div className="tank-illustration"><div className="tank-cap" /><div className="tank-body"><Flame size={31} /></div><span className="tank-label">GÁS</span></div></div><div className="consumption-track"><div className="track-labels"><span>Botija atual</span><strong>72% estimado</strong></div><div className="track-line"><span /></div></div><div className="next-footer"><span><Clock3 size={14} /> Baseado no teu ritmo habitual</span><button onClick={() => setActive('Fornecedores')}>Encontrar gás <ArrowRight size={15} /></button></div></article>
<article className="last-card"><div className="card-kicker">ÚLTIMA COMPRA <MoreHorizontal size={18} /></div><div className="last-product"><div className="product-icon"><Flame size={20} /></div><div><strong>Botija Pluma 11 kg</strong><span>Propano · Galp</span></div></div><div className="last-details"><div><span>Comprada a</span><strong>15 out. 2026</strong></div><div><span>Valor</span><strong>€ 32,90</strong></div></div><button className="receipt-link" onClick={() => setShowPurchase(true)}>Ver detalhes da compra <ArrowRight size={15} /></button></article>
<article className="savings-card"><div className="savings-top"><span className="card-kicker">POUPANÇA ESTE ANO</span><span className="savings-icon"><TrendingDown size={17} /></span></div><strong className="savings-value">€ 48<span>,60</span></strong><p>Já poupaste desde janeiro</p><div className="savings-comparison"><span className="savings-arrow"><ArrowDownLeft size={14} /></span> 12% menos que no ano passado</div><div className="savings-decoration"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article></section>
<div className="section-heading"><div><h2>A tua energia</h2><p>O essencial, num só lugar.</p></div><button className="period-select">Últimos 6 meses <ChevronDown size={15} /></button></div>
<section className="lower-grid"><article className="chart-card"><div className="chart-card-head"><div><h3>Consumo ao longo do tempo</h3><p>O que gastaste em botijas, mês a mês.</p></div><div className="chart-legend"><span /> Total em botijas</div></div><div className="chart-summary"><strong>€ 186,40</strong><span><span className="trend-green"><ArrowDownLeft size={13} /> 8%</span> vs. período anterior</span></div><ConsumptionChart /><div className="chart-note"><span className="note-check"><Check size={12} /></span> O teu consumo está estável. Bom trabalho!</div></article>
<ChatPanel /></section>
<section className="recommendation"><div className="rec-symbol"><Sparkles size={18} /></div><div className="rec-copy"><span>UMA DICA PARA TI</span><h3>Podes poupar na próxima entrega, Inês.</h3><p>Há fornecedores na tua zona com entrega gratuita em compras acima de € 30.</p></div><button onClick={() => setActive('Fornecedores')}>Ver fornecedores <ArrowRight size={16} /></button></section>
<section className="preferences-card"><div className="prefs-head"><div><span className="eyebrow">AS TUAS PREFERÊNCIAS</span><h2>Feito à tua medida</h2></div><button className="edit-prefs">Editar preferências <ArrowRight size={15} /></button></div><div className="prefs-list"><div className="pref-item"><span className="pref-icon"><Flame size={17} /></span><span><small>O teu gás</small><strong>{gasType}, botija 11 kg</strong></span></div><div className="pref-item"><span className="pref-icon"><Clock3 size={17} /></span><span><small>Ritmo de consumo</small><strong>1 botija a cada 6 semanas</strong></span></div><div className="pref-item"><span className="pref-icon"><House size={17} /></span><span><small>Preferência</small><strong>Entrega ao domicílio</strong></span></div><div className="pref-item"><span className="pref-icon"><MapPin size={17} /></span><span><small>Localização</small><strong>Lisboa, 1200-109</strong></span></div></div></section>
<footer className="footer"><span>© 2026 Gás Inteligente</span><span>Feito para tornar a tua casa mais simples <span className="footer-heart">♥</span></span></footer></div></main>{showPurchase && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPurchase(false) }}><section className="purchase-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-title"><div className="modal-heading"><div><span className="eyebrow">O TEU HISTÓRICO</span><h2 id="purchase-title">Registar uma compra</h2></div><button className="icon-button" onClick={() => setShowPurchase(false)} aria-label="Fechar"><X size={19} /></button></div>{purchaseSaved ? <div className="purchase-success"><span><Check size={23} /></span><h3>Compra registada!</h3><p>O teu consumo foi atualizado. A próxima reposição prevista já tem em conta esta compra.</p><button onClick={() => setShowPurchase(false)}>Feito</button></div> : <form onSubmit={(event) => { event.preventDefault(); setPurchaseSaved(true) }}><label>Tipo de gás<select value={gasType} onChange={(event) => setGasType(event.target.value)}><option>Propano</option><option>Butano</option></select></label><label>Fornecedor<select defaultValue="Galp"><option>Galp</option><option>Repsol</option><option>Rubis</option><option>Outro fornecedor</option></select></label><div className="modal-fields"><label>Data<input type="date" defaultValue="2026-11-15" /></label><label>Valor (€)<input required type="number" step="0.01" min="0" defaultValue="32.90" /></label></div><label>Entrega<select defaultValue="Entrega ao domicílio"><option>Entrega ao domicílio</option><option>Recolha em loja</option></select></label><button className="submit-purchase" type="submit">Guardar compra <ArrowRight size={16} /></button></form>}</section></div>}{active !== 'Visão geral' && <button className="active-toast" onClick={() => setActive('Visão geral')}><span>{active === 'Assistente' ? <MessageCircle size={17} /> : active === 'Fornecedores' ? <ShoppingBag size={17} /> : <Wallet size={17} />}</span><div><strong>{active}</strong><small>Continua no teu painel personalizado</small></div><X size={16} /></button>}<div className="mobile-nav"><button className="selected"><House size={19} /><span>Início</span></button><button onClick={() => setActive('O meu consumo')}><TrendingDown size={19} /><span>Consumo</span></button><button onClick={() => setActive('Fornecedores')}><ShoppingBag size={19} /><span>Fornecedores</span></button><button onClick={() => setActive('Assistente')}><MessageCircle size={19} /><span>Assistente</span></button><button onClick={() => setActive('Perfil')}><UserRound size={19} /><span>Perfil</span></button></div></div>
}
