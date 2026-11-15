'use client'

import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp, Bot, CalendarDays, RotateCcw, Wallet } from 'lucide-react'
import { getDaysSincePurchase, getMonthlyConsumption, getRefillEstimate } from '@/lib/gas-insights'
import { formatEuro, formatPurchaseDate, type Purchase } from '@/lib/gas-types'

type GasAssistantProps = {
  purchases: Purchase[]
  frequency: string
  onClose?: () => void
}

type Message = { role: 'assistant' | 'user'; text: string }

const prompts = ['Quando compro gás novamente?', 'Quanto gastei este mês?', 'Qual foi a minha última compra?']

export function GasAssistant({ purchases, frequency, onClose }: GasAssistantProps) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá! Posso ajudar-te a perceber o teu consumo, os gastos deste mês e as datas das tuas compras.' },
  ])
  const latestPurchase = useMemo(() => [...purchases].sort((left, right) => right.date.localeCompare(left.date))[0], [purchases])

  function answerQuestion(rawQuestion: string) {
    const normalized = rawQuestion.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const now = new Date()
    let answer: string

    if (/quanto|gastei|gasto|despesa|total.*mes/.test(normalized) && /mes|gastei|gasto|despesa/.test(normalized)) {
      const amount = purchases.reduce((total, purchase) => {
        const [year, month] = purchase.date.split('-').map(Number)
        return year === now.getFullYear() && month === now.getMonth() + 1 ? total + purchase.price : total
      }, 0)
      answer = amount > 0
        ? `Este mês registaste ${formatEuro(amount)} em ${purchases.filter((purchase) => { const [year, month] = purchase.date.split('-').map(Number); return year === now.getFullYear() && month === now.getMonth() + 1 }).length} compra(s).`
        : 'Ainda não registaste compras neste mês. Quando adicionares uma, atualizo este valor.'
    } else if (/ultima|mais recente|quando foi/.test(normalized) && /compra|botija|g[aá]s/.test(normalized)) {
      answer = latestPurchase
        ? `A tua última compra foi a ${formatPurchaseDate(latestPurchase.date)}: ${latestPurchase.brand} de ${latestPurchase.gasType}, por ${formatEuro(latestPurchase.price)}${latestPurchase.supplier ? ` no fornecedor ${latestPurchase.supplier}` : ''}.`
        : 'Ainda não tens compras registadas. Regista a primeira e poderei acompanhar o teu histórico.'
    } else if (/quando|proxima|novamente|repor|reabaste/.test(normalized)) {
      const estimate = getRefillEstimate(purchases, frequency, now)
      answer = estimate
        ? estimate.daysUntil === 0
          ? `Pelo teu ritmo habitual, a reposição poderá ser agora. A data estimada era ${formatPurchaseDate(estimate.date.toISOString().slice(0, 10))}.`
          : `Pelo teu histórico, poderás precisar de uma nova botija em cerca de ${estimate.daysUntil} ${estimate.daysUntil === 1 ? 'dia' : 'dias'} (${formatPurchaseDate(estimate.date.toISOString().slice(0, 10))}). Esta é apenas uma estimativa.`
        : 'Ainda não tenho dados suficientes para estimar a próxima reposição. Regista mais compras ou indica a frequência no teu perfil.'
    } else if (/media|consumo|botijas? por mes|frequencia/.test(normalized)) {
      const monthly = getMonthlyConsumption(purchases, frequency)
      answer = monthly
        ? `A tua média estimada é de ${monthly.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} ${monthly > 1.05 ? 'botijas' : 'botija'} por mês, com base ${purchases.length > 1 ? 'nos intervalos entre as compras registadas' : 'na frequência que indicaste no perfil'}.`
        : 'Ainda não há dados suficientes para calcular uma média. Regista compras ou define a frequência no teu perfil.'
    } else {
      answer = 'Consigo responder sobre a próxima reposição, o gasto deste mês, a última compra e o consumo médio. Experimenta uma dessas perguntas.'
    }

    setMessages((current) => [...current, { role: 'user', text: rawQuestion }, { role: 'assistant', text: answer }])
    setQuestion('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (trimmedQuestion) answerQuestion(trimmedQuestion)
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (trimmedQuestion) answerQuestion(trimmedQuestion)
  }

  return (
    <section className="assistant-screen" aria-label="Assistente inteligente">
      <div className="assistant-page-heading">
        <div><span className="mvp-eyebrow">PERGUNTAS SOBRE A TUA CASA</span><h1>Assistente inteligente.</h1><p>Respostas baseadas nas compras que registaste.</p></div>
        {onClose && <button className="assistant-back-button" type="button" onClick={onClose}><RotateCcw size={14} /> Voltar ao resumo</button>}
      </div>
      <div className="assistant-window">
        <div className="assistant-window-head"><span className="assistant-mark"><Bot size={17} /></span><div><strong>O teu assistente de consumo</strong><span><i /> A analisar o teu histórico pessoal</span></div></div>
        <div className="assistant-thread" aria-live="polite">
          {messages.map((message, index) => <div className={`mvp-message ${message.role === 'user' ? 'from-user' : ''}`} key={`${message.role}-${index}`}>
            {message.role === 'assistant' && <span className="assistant-mini-icon"><Bot size={12} /></span>}
            <p>{message.text}</p>
          </div>)}
        </div>
        {messages.length === 1 && <div className="assistant-suggestions" aria-label="Perguntas sugeridas">{prompts.map((prompt, index) => <button type="button" key={prompt} onClick={() => answerQuestion(prompt)}>{index === 0 ? <CalendarDays size={13} /> : index === 1 ? <Wallet size={13} /> : <CalendarDays size={13} />}{prompt}</button>)}</div>}
        <form className="assistant-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-question">Escreve a tua pergunta</label>
          <input id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Pergunta sobre o teu consumo..." maxLength={240} />
          <button type="submit" aria-label="Enviar pergunta" disabled={!question.trim()}><ArrowUp size={16} /></button>
        </form>
        <p className="assistant-privacy">As respostas usam apenas os dados da tua conta. As estimativas não garantem a data exata de reposição.</p>
      </div>
    </section>
  )
}
