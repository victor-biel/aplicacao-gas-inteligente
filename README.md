# Gás Inteligente

> Assistente inteligente para gestão e compra de botijas de gás em Portugal.

O **Gás Inteligente** ajuda famílias portuguesas a acompanhar o consumo de gás, organizar compras recorrentes e encontrar distribuidores mais adequados para a sua localização, reduzindo o tempo gasto na pesquisa manual de fornecedores.

A aplicação combina histórico de consumo, preferências do utilizador e pesquisa de fornecedores para oferecer recomendações personalizadas e previsões de reposição.

---

# Problema

Atualmente, consumidores de gás em Portugal enfrentam diversos desafios:

- Necessidade de consultar vários websites para encontrar fornecedores.
- Dificuldade em comparar marcas e distribuidores.
- Falta de visibilidade sobre opções de entrega ao domicílio.
- Perda de tempo na procura de contactos e informações locais.
- Ausência de ferramentas que acompanhem o histórico de consumo.

Como consequência, muitas famílias acabam por comprar repetidamente ao mesmo fornecedor sem saber se existem alternativas mais vantajosas.

---

# Solução

O Gás Inteligente centraliza informações relevantes sobre consumo e fornecedores, oferecendo uma experiência simples através de um assistente especializado.

O sistema permite:

- Registar compras anteriores.
- Acompanhar gastos com gás.
- Estimar quando será necessária uma nova reposição.
- Manter preferências de consumo.
- Comparar fornecedores.
- Receber recomendações personalizadas.

---

# Proposta de Valor

Enquanto assistentes generalistas conseguem responder perguntas pontuais sobre fornecedores ou marcas, o Gás Inteligente mantém contexto permanente sobre cada utilizador.

O sistema pode saber:

- Localização do utilizador.
- Tipo de gás utilizado.
- Frequência média de consumo.
- Marca preferida.
- Histórico de compras.
- Preferência por entrega ao domicílio.

Com base nesses dados, é capaz de gerar insights como:

> A sua última compra foi realizada há 12 dias. Com base no histórico, poderá necessitar de uma nova botija dentro de aproximadamente 4 dias.

ou

> Identificámos um fornecedor alternativo que poderá representar uma poupança relativamente às suas compras anteriores.

---

# Funcionalidades

## Gestão de Conta e Perfil

Permite configurar e atualizar:

- Cidade
- Código Postal
- Tipo de gás utilizado
- Marca preferida
- Frequência de compra
- Preferência por entrega ao domicílio

---

## Dashboard

Painel principal da aplicação com:

- Última compra registada
- Histórico recente
- Consumo médio
- Próxima reposição estimada
- Recomendações personalizadas

---

## Histórico de Compras

Registo detalhado das compras realizadas:

- Fornecedor
- Marca
- Tipo de gás
- Valor pago
- Data da compra

Permite acompanhar a evolução dos custos e padrões de consumo.

---

## Pesquisa de Fornecedores

Pesquisa e comparação de distribuidores com base em:

- Localização do utilizador
- Tipo de gás
- Preferências pessoais

A aplicação fornece acesso rápido a:

- Contactos
- Websites oficiais
- Informações relevantes do fornecedor

---

## Consulta Online

Permite realizar pesquisas rápidas relacionadas com:

- Distribuidores próximos
- Entrega ao domicílio
- Informações sobre marcas
- Disponibilidade na região

Através de atalhos diretos para websites e pesquisas relevantes.

---

## Assistente Inteligente

Assistente especializado capaz de responder a perguntas como:

```text
Quando devo comprar a próxima botija?

Quanto gastei nos últimos meses?

Qual foi a minha última compra?

Qual o fornecedor mais adequado para mim?
```

---

## Recomendações Personalizadas

Com base no histórico de compras e preferências:

- Alertas de reposição.
- Sugestões de fornecedores.
- Comparações com compras anteriores.
- Possíveis oportunidades de poupança.

---

# Como Funciona

## 1. Configuração Inicial

O utilizador informa:

- Cidade
- Código Postal
- Tipo de gás
- Frequência de consumo
- Preferência por entrega

---

## 2. Registo de Compras

São adicionadas as compras realizadas ao longo do tempo.

---

## 3. Análise do Histórico

A aplicação analisa:

- Frequência de compra
- Consumo médio
- Histórico financeiro
- Preferências do utilizador

---

## 4. Recomendações

O sistema apresenta:

- Próxima reposição estimada
- Sugestões de fornecedores
- Informações relevantes para a próxima compra

---

# Tecnologias Utilizadas

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Backend

- Supabase Auth
- Supabase PostgreSQL

## Visualização de Dados

- Recharts

---

# Estrutura do Projeto

```text
app/
│
├── Rotas Next.js
├── Layout principal
└── Estilos globais

components/
│
├── gas-inteligente/
│   ├── Dashboard
│   ├── Perfil
│   ├── Histórico
│   └── Assistente
│
└── ui/
    └── Componentes reutilizáveis

lib/
│
├── gas-insights.ts
├── gas-types.ts
└── supabase/
```

---

# Dados e Privacidade

Todos os registos são associados ao utilizador autenticado.

A aplicação utiliza:

- Supabase Authentication
- Supabase Database
- Row Level Security (RLS)

Os dados de cada utilizador permanecem isolados e acessíveis apenas pelo respetivo proprietário.

---

# Limitações Atuais

A versão atual do MVP possui algumas limitações conhecidas:

- Não existe integração direta com distribuidores.
- Não existem APIs de preços em tempo real.
- Os preços apresentados não são automaticamente validados.
- A disponibilidade de entrega deve ser confirmada junto do fornecedor.
- As previsões de consumo são estimativas baseadas no histórico registado.

---

# Aprendizagens do Projeto

Este projeto foi desenvolvido utilizando uma abordagem de Vibe Coding.

Durante o desenvolvimento foi identificado um desafio importante: enviar um PRD completo e muito detalhado diretamente para a ferramenta de geração automática.

O documento incluía simultaneamente:

- Gestão de utilizadores.
- Dashboard.
- Histórico de compras.
- Recomendações.
- Assistente conversacional.
- Integrações futuras.
- Funcionalidades de IA.

Embora os requisitos estivessem bem definidos, a quantidade de contexto fornecida numa única interação aumentou significativamente a complexidade da tarefa para a IA.

Como consequência verificou-se:

- Maior consumo de créditos.
- Gerações incompletas.
- Mais tempo para validar resultados.
- Maior necessidade de refinamentos.

A principal aprendizagem obtida foi que ferramentas de Vibe Coding produzem melhores resultados quando o desenvolvimento é dividido em pequenas entregas incrementais.

A estratégia recomendada passou a ser:

1. Interface e experiência do utilizador.
2. Persistência de dados.
3. Histórico de compras.
4. Recomendações.
5. Funcionalidades avançadas.

Esta abordagem torna a evolução do produto mais previsível e eficiente.

---

# Roadmap

## MVP Atual

- [x] Gestão de utilizadores
- [x] Perfil personalizado
- [x] Histórico de compras
- [x] Dashboard
- [x] Recomendações básicas
- [x] Pesquisa de fornecedores
- [x] Assistente especializado

---

## Próximas Versões

- [ ] Integração com APIs de distribuidores
- [ ] Monitorização automática de preços
- [ ] Alertas de promoções
- [ ] Recomendações avançadas com IA
- [ ] Notificações inteligentes

---

## Visão de Longo Prazo

Transformar o Gás Inteligente num agente doméstico capaz de ajudar famílias portuguesas na gestão de despesas recorrentes da habitação.

Possíveis áreas futuras:

- Gás
- Eletricidade
- Internet
- Água
- Seguros
- Pellets
- Lenha
- Outros serviços domésticos

---

# Autor

**Victor Alves**

Projeto desenvolvido para exploração de Inteligência Artificial, Vibe Coding e criação de assistentes especializados focados em resolver problemas reais do quotidiano das famílias portuguesas.
