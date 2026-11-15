'use client'

import { useMemo, useState } from 'react'
import { ArrowDownUp, ArrowUpRight, Check, ExternalLink, MapPin, Search, SlidersHorizontal, Truck } from 'lucide-react'
import type { UserProfile } from '@/lib/gas-types'

type Supplier = { id: string; name: string; brand: string; website: string; domain: string; deliveries: 'Confirmar' | 'Pesquisar'; }

const suppliers: Supplier[] = [
  { id: 'galp', name: 'Galp', brand: 'Galp', website: 'https://www.galp.com/pt', domain: 'galp.com' , deliveries: 'Pesquisar' },
  { id: 'rubis', name: 'Rubis Gás', brand: 'Rubis', website: 'https://www.rubisgas.pt', domain: 'rubisgas.pt', deliveries: 'Pesquisar' },
  { id: 'repsol', name: 'Repsol', brand: 'Repsol', website: 'https://www.repsol.pt', domain: 'repsol.pt', deliveries: 'Pesquisar' },
]

type SupplierSearchProps = { profile: UserProfile; purchases: Array<{ supplier: string; brand: string; price: number }> }

export function SupplierSearch({ profile, purchases }: SupplierSearchProps) {
  const [query, setQuery] = useState('')
  const [deliveryOnly, setDeliveryOnly] = useState(profile.homeDelivery)
  const [sortBy, setSortBy] = useState<'relevance' | 'history'>('relevance')
  const [selected, setSelected] = useState<string[]>([])
  const location = profile.city || 'Portugal'
  const latestPrices = useMemo(() => {
    const prices = new Map<string, number>()
    for (const purchase of purchases) {
      if (!prices.has(purchase.brand)) prices.set(purchase.brand, purchase.price)
    }
    return prices
  }, [purchases])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-PT')
    return [...suppliers]
      .filter((supplier) => !normalizedQuery || `${supplier.name} ${supplier.brand} ${location} ${profile.gasType}`.toLocaleLowerCase('pt-PT').includes(normalizedQuery) || normalizedQuery.split(/\s+/).some((word) => word.length > 2 && `${supplier.name} ${supplier.brand} ${location} ${profile.gasType}`.toLocaleLowerCase('pt-PT').includes(word)))
      .sort((a, b) => {
        if (sortBy === 'history') {
          const aHistory = latestPrices.has(a.brand) ? 1 : 0
          const bHistory = latestPrices.has(b.brand) ? 1 : 0
          if (aHistory !== bHistory) return bHistory - aHistory
        }
        const aFavorite = a.name.toLowerCase().includes(profile.favoriteSupplier.toLowerCase()) || a.brand === profile.brand
        const bFavorite = b.name.toLowerCase().includes(profile.favoriteSupplier.toLowerCase()) || b.brand === profile.brand
        return Number(bFavorite) - Number(aFavorite)
      })
  }, [query, location, profile.gasType, profile.brand, profile.favoriteSupplier, sortBy, latestPrices])

  function onlineSearch(supplier: Supplier) {
    const terms = [supplier.name, profile.gasType, 'botija', 'preço', location, profile.postalCode, deliveryOnly ? 'entrega ao domicílio' : ''].filter(Boolean).join(' ')
    return `https://www.google.com/search?q=${encodeURIComponent(terms)}`
  }

  function toggleCompare(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)
  }

  return (
    <section className="supplier-screen" aria-labelledby="supplier-title">
      <div className="mvp-page-heading supplier-heading"><div><span className="mvp-eyebrow">PESQUISA LOCAL</span><h1 id="supplier-title">Encontra o teu próximo fornecedor.</h1><p>Compara opções para {location} e confirma preços diretamente com cada fornecedor.</p></div><span className="supplier-location"><MapPin size={15} /> {location}</span></div>

      <form className="supplier-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="supplier-search">Pesquisar fornecedores</label>
        <input id="supplier-search" type="search" placeholder={`Ex.: botija de ${profile.gasType.toLowerCase()} com entrega`} value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="submit">Pesquisar</button>
      </form>
      <div className="supplier-search-controls">
        <label className="supplier-delivery-filter"><input type="checkbox" checked={deliveryOnly} onChange={(event) => setDeliveryOnly(event.target.checked)} /><Truck size={15} /> Priorizar entrega ao domicílio</label>
        <label className="supplier-sort"><SlidersHorizontal size={14} /><span>Ordenar:</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'relevance' | 'history')} aria-label="Ordenar resultados"><option value="relevance">Relevância e preferências</option><option value="history">Com histórico de compras</option></select><ArrowDownUp size={13} /></label>
      </div>

      <div className="supplier-results-heading"><div><span className="mvp-eyebrow">OPÇÕES PARA COMPARAR</span><h2>{results.length} {results.length === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}</h2></div><span className="supplier-live-note"><span /> Pesquisa online disponível</span></div>
      {results.length ? <div className="supplier-results" aria-label="Resultados de fornecedores">{results.map((supplier, index) => {
        const isFavorite = supplier.brand === profile.brand || (profile.favoriteSupplier && supplier.name.toLowerCase().includes(profile.favoriteSupplier.toLowerCase()))
        const previousPrice = latestPrices.get(supplier.brand)
        return <article className={`supplier-card ${isFavorite ? 'supplier-card-featured' : ''}`} key={supplier.id}>
          <div className="supplier-card-main"><div className={`supplier-logo supplier-logo-${supplier.id}`} aria-hidden="true">{supplier.brand.slice(0, 1)}</div><div className="supplier-copy"><div className="supplier-name-row"><h3>{supplier.name}</h3>{index === 0 && <span className="supplier-match">Melhor correspondência</span>}</div><p>{supplier.brand} · {supplier.domain}</p></div><a className="supplier-site-link" href={supplier.website} target="_blank" rel="noopener noreferrer" aria-label={`Visitar website de ${supplier.name}`}><ExternalLink size={15} /></a></div>
          <div className="supplier-card-details"><div className="supplier-detail"><span>ENTREGA</span><strong><Truck size={14} /> A confirmar na pesquisa</strong></div><div className="supplier-detail"><span>PREÇO ATUAL</span><strong className="supplier-price">Consultar online</strong>{previousPrice !== undefined && <small>Última compra registada: {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(previousPrice)}</small>}</div><div className="supplier-detail"><span>LOCALIZAÇÃO</span><strong><MapPin size={13} /> {location}</strong></div></div>
          <div className="supplier-card-actions"><label className="supplier-compare"><input type="checkbox" checked={selected.includes(supplier.id)} onChange={() => toggleCompare(supplier.id)} aria-label={`Adicionar ${supplier.name} à comparação`} /><span><Check size={12} /></span> Comparar</label><a className="supplier-web-search" href={onlineSearch(supplier)} target="_blank" rel="noopener noreferrer">Pesquisar preços e entrega <ArrowUpRight size={14} /></a></div>
        </article>
      })}</div> : <div className="supplier-empty"><Search size={22} /><strong>Não encontrámos fornecedores com esses termos.</strong><span>Tenta pesquisar por marca, tipo de gás ou localização.</span></div>}

      {selected.length > 0 && <section className="supplier-compare-panel" aria-live="polite" aria-label="Comparação selecionada"><div><span className="mvp-eyebrow">A TUA COMPARAÇÃO</span><h2>{selected.length} de 3 fornecedores selecionados</h2></div><div className="supplier-compare-table-wrap"><table className="supplier-compare-table"><thead><tr><th scope="col">Fornecedor</th><th scope="col">Marca</th><th scope="col">Entrega</th><th scope="col">Preço atual</th><th scope="col"><span className="sr-only">Remover</span></th></tr></thead><tbody>{selected.map((id) => { const item = suppliers.find((supplier) => supplier.id === id)!; const previousPrice = latestPrices.get(item.brand); return <tr key={id}><th scope="row">{item.name}</th><td>{item.brand}</td><td>A confirmar</td><td>{previousPrice !== undefined ? `Última compra: ${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(previousPrice)}` : 'Consultar online'}</td><td><button type="button" onClick={() => toggleCompare(id)} aria-label={`Remover ${item.name} da comparação`}>×</button></td></tr> })}</tbody></table></div><p>Os preços e a disponibilidade não são confirmados em tempo real. Usa a pesquisa online para consultar as condições atuais.</p></section>}
      <p className="supplier-disclaimer">Os preços e a disponibilidade de entrega variam por zona e não são verificados pela aplicação. Confirma as condições atuais no website do fornecedor antes de comprar.</p>
    </section>
  )
}
