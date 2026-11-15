'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Flame, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { gasTypes, type GasType } from '@/lib/gas-types'

type AuthMode = 'signup' | 'signin'

export function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [gasType, setGasType] = useState<GasType>('Propano')
  const [brand, setBrand] = useState('Galp')
  const [favoriteSupplier, setFavoriteSupplier] = useState('')
  const [frequency, setFrequency] = useState('Quando preciso')
  const [homeDelivery, setHomeDelivery] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setConfirmation(false)
    setBusy(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: {
            nome: name.trim(),
            cidade: city.trim(),
            codigo_postal: postalCode.trim(),
            tipo_gas: gasType,
            entrega_domicilio: String(homeDelivery),
            marca_favorita: brand,
            fornecedor_favorito: favoriteSupplier.trim(),
            consumo_mensal: frequency,
          },
        },
      })

      setBusy(false)
      if (authError) {
        const code = authError.code
        const message = code === 'weak_password'
          ? 'Escolhe uma palavra-passe mais forte.'
          : code === 'email_address_invalid'
            ? 'Confirma o formato do endereço de email.'
            : code === 'email_address_not_authorized'
              ? 'Não foi possível enviar a confirmação para este endereço. Tenta outro email.'
              : code === 'over_email_send_rate_limit' || authError.status === 429
                ? 'Foram feitas demasiadas tentativas. Aguarda um pouco e tenta novamente.'
                : 'Não foi possível criar a conta. Confirma os dados e tenta novamente.'
        setError(message)
        return
      }
      if (data.session) {
        router.refresh()
        return
      }
      setConfirmation(true)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (authError) {
      setError(authError.code === 'email_not_confirmed'
        ? 'Confirma o email que te enviámos antes de iniciar sessão.'
        : authError.status === 429
          ? 'Foram feitas demasiadas tentativas. Aguarda um pouco e tenta novamente.'
          : 'Não foi possível iniciar sessão. Confirma o email e a palavra-passe.')
      return
    }
    router.refresh()
  }

  return (
    <main className="auth-screen">
      <a className="mvp-brand auth-brand" href="/" aria-label="Gás Inteligente, início">
        <span><Flame size={18} /></span> Gás Inteligente
      </a>
      <div className="auth-layout">
        <section className="auth-intro">
          <span className="mvp-eyebrow">O TEU GÁS, MAIS SIMPLES</span>
          <h1>Uma casa.<br /><em>Mais controlo.</em></h1>
          <p>Regista as tuas compras, acompanha os gastos e guarda as preferências da tua casa num só lugar.</p>
          <div className="auth-trust"><span><ShieldCheck size={15} /></span> Os teus dados ficam associados à tua conta.</div>
        </section>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-tabs" aria-label="Acesso à conta">
            <button type="button" aria-pressed={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setConfirmation(false) }}>Criar conta</button>
            <button type="button" aria-pressed={mode === 'signin'} className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); setConfirmation(false) }}>Iniciar sessão</button>
          </div>
          <div className="auth-card-heading">
            <h2 id="auth-title">{mode === 'signup' ? 'Começa pela tua casa.' : 'Bem-vindo de volta.'}</h2>
            <p>{mode === 'signup' ? 'Cria a tua conta e guarda as tuas preferências.' : 'Entra para continuares a acompanhar o teu gás.'}</p>
          </div>
          {confirmation ? (
            <div className="auth-confirmation" role="status"><span><Check size={18} /></span><strong>Confirma o teu email</strong><p>Se o endereço puder ser utilizado, receberás instruções para confirmar a conta e entrar.</p><button type="button" onClick={() => { setMode('signin'); setConfirmation(false) }}>Voltar ao início de sessão</button></div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && <>
                <label className="auth-field">Nome<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Como te chamamos?" /></label>
                <div className="auth-form-grid">
                  <label className="auth-field">Cidade<input autoComplete="address-level2" required value={city} onChange={(event) => setCity(event.target.value)} placeholder="Lisboa" /></label>
                  <label className="auth-field">Código postal<input autoComplete="postal-code" required maxLength={8} value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="1000-001" /></label>
                </div>
                <div className="auth-form-grid">
                  <label className="auth-field">Tipo de gás<select value={gasType} onChange={(event) => setGasType(event.target.value as GasType)}>{gasTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label className="auth-field">Marca favorita<select value={brand} onChange={(event) => setBrand(event.target.value)}><option>Galp</option><option>Rubis</option><option>Repsol</option><option>Outra</option></select></label>
                </div>
                <label className="auth-field">Fornecedor favorito<input maxLength={100} value={favoriteSupplier} onChange={(event) => setFavoriteSupplier(event.target.value)} placeholder="Opcional — a tua loja habitual" autoComplete="organization" /></label>
                <label className="auth-field">Frequência de compra<select value={frequency} onChange={(event) => setFrequency(event.target.value)}><option>1 botija por mês</option><option>2 botijas por mês</option><option>1 botija a cada 2 meses</option><option>Quando preciso</option></select></label>
                <label className="auth-delivery"><input type="checkbox" checked={homeDelivery} onChange={(event) => setHomeDelivery(event.target.checked)} /><span>Prefiro entrega ao domicílio</span></label>
              </>}
              <label className="auth-field">Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@exemplo.pt" /></label>
              <label className="auth-field">Palavra-passe<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 8 caracteres" /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="mvp-primary-button auth-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spinner" /> A processar...</> : <>{mode === 'signup' ? 'Criar a minha conta' : 'Iniciar sessão'} <ArrowRight size={15} /></>}</button>
              <p className="auth-privacy">Ao continuar, os teus dados são guardados de forma segura e só ficam visíveis na tua conta.</p>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
