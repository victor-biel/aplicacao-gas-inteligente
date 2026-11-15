'use client'

import { useState, type FormEvent } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro, gasTypes, type GasType, type Purchase } from '@/lib/gas-types'

type PurchaseDialogProps = {
  userId: string
  defaultGasType: GasType
  defaultBrand: string
  onClose: () => void
  onSaved: (purchase: Purchase) => void
}

export function PurchaseDialog({ userId, defaultGasType, defaultBrand, onClose, onSaved }: PurchaseDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState('')
  const [brand, setBrand] = useState(defaultBrand)
  const [gasType, setGasType] = useState<GasType>(defaultGasType)
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(price)
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
      setError('Indica um valor superior a 0 € e inferior a 10 000 €.')
      return
    }
    if (!date || date > new Date().toISOString().slice(0, 10)) {
      setError('Escolhe uma data válida, não posterior a hoje.')
      return
    }

    setError('')
    setBusy(true)
    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('purchases')
      .insert({ user_id: userId, data: date, fornecedor: supplier.trim(), marca: brand.trim(), valor: amount, tipo_gas: gasType })
      .select('id, data, fornecedor, marca, valor, tipo_gas')
      .single()
    setBusy(false)

    if (insertError || !data) {
      setError('Não foi possível guardar a compra. Tenta novamente.')
      return
    }

    onSaved({
      id: data.id,
      date: data.data,
      supplier: data.fornecedor,
      brand: data.marca,
      price: Number(data.valor),
      gasType: data.tipo_gas,
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="purchase-modal purchase-entry-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-title">
        <div className="modal-heading"><div><span className="mvp-eyebrow">HISTÓRICO DA TUA CASA</span><h2 id="purchase-title">Registar uma compra</h2></div><button className="icon-button" type="button" aria-label="Fechar" onClick={onClose} disabled={busy}><X size={17} /></button></div>
        <form onSubmit={handleSubmit}>
          <label>Fornecedor<input required maxLength={100} value={supplier} onChange={(event) => setSupplier(event.target.value)} placeholder="Ex.: loja ou distribuidor" /></label>
          <div className="modal-fields">
            <label>Marca<select value={brand} onChange={(event) => setBrand(event.target.value)}><option>Galp</option><option>Rubis</option><option>Repsol</option><option>Outra</option></select></label>
            <label>Tipo de gás<select value={gasType} onChange={(event) => setGasType(event.target.value as GasType)}>{gasTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
          </div>
          <div className="modal-fields">
            <label>Valor (€)<input type="number" inputMode="decimal" min="0.01" max="10000" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0,00" /></label>
            <label>Data<input type="date" max={new Date().toISOString().slice(0, 10)} required value={date} onChange={(event) => setDate(event.target.value)} /></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="submit-purchase" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spinner" /> A guardar...</> : <><Check size={15} /> Guardar compra · {price && Number(price) > 0 ? formatEuro(Number(price)) : 'indicar valor'}</>}</button>
        </form>
      </section>
    </div>
  )
}
