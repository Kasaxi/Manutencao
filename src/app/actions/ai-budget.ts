'use server'

interface MaterialInput {
  name: string
  quantity: number
  estimated_unit_price: number
  supplier: string | null
}

export async function getAIBudgetAnalysis(materials: MaterialInput[], orderTitle: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = "minimax/minimax-m2.5:free"

  if (!apiKey) {
    return { success: false, error: 'Chave de API não configurada.' }
  }

  if (materials.length === 0) {
    return { success: false, error: 'Nenhum material para analisar.' }
  }

  const materialsList = materials.map((m, i) => 
    `${i + 1}. ${m.name} — Qtd: ${m.quantity} — Preço Unit.: R$ ${m.estimated_unit_price.toFixed(2)} — Fornecedor: ${m.supplier || 'Não informado'} — Subtotal: R$ ${(m.quantity * m.estimated_unit_price).toFixed(2)}`
  ).join('\n')

  const total = materials.reduce((acc, m) => acc + m.quantity * m.estimated_unit_price, 0)

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": "Manutencao.PRO",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {
            "role": "system",
            "content": `Você é um analista de custos especializado em manutenção predial no Brasil (região Centro-Oeste/DF/Goiás). 
            
Analise a lista de materiais de uma ordem de serviço e retorne EXATAMENTE um JSON com:

{
  "resumo": "Uma frase resumindo a análise geral do orçamento",
  "avaliacao": "barato" | "justo" | "caro" | "muito_caro",
  "economia_potencial": número em reais que poderia ser economizado (0 se não houver),
  "itens": [
    {
      "nome": "nome do material",
      "preco_informado": número,
      "faixa_mercado_min": número estimado do preço mínimo de mercado,
      "faixa_mercado_max": número estimado do preço máximo de mercado,
      "avaliacao": "barato" | "justo" | "caro" | "muito_caro",
      "sugestao": "dica para economizar ou alternativa, se houver"
    }
  ],
  "dicas": ["dica 1 geral sobre economia", "dica 2"]
}

Seja realista com preços de materiais de construção/manutenção no Brasil em 2025-2026. Considere preços de lojas como Leroy Merlin, Telhanorte, C&C, casas de materiais locais.`
          },
          {
            "role": "user",
            "content": `Ordem de Serviço: ${orderTitle}\n\nMateriais:\n${materialsList}\n\nTotal: R$ ${total.toFixed(2)}`
          }
        ],
        "response_format": { "type": "json_object" }
      })
    })

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      const content = JSON.parse(data.choices[0].message.content)
      return { success: true, analysis: content }
    }

    return { success: false, error: 'Resposta inválida da AI.' }
  } catch (error) {
    console.error('AI Budget Analysis error:', error)
    return { success: false, error: 'Erro ao consultar AI.' }
  }
}

export async function getAIPriceSuggestion(materialName: string, category?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = "minimax/minimax-m2.5:free"

  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": "Manutencao.PRO",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {
            "role": "system",
            "content": `Você é um consultor de preços de materiais de construção e manutenção predial no Brasil (2025-2026, região Centro-Oeste/DF/GO).

Retorne EXATAMENTE um JSON:
{
  "min": número (preço mínimo estimado por unidade em reais),
  "max": número (preço máximo estimado por unidade em reais),
  "medio": número (preço médio estimado),
  "dica": "uma frase curta com dica de compra"
}

Seja preciso e realista com base em preços de lojas como Leroy Merlin, C&C, casas de materiais locais.`
          },
          {
            "role": "user",
            "content": `Material: ${materialName}${category ? ` (categoria: ${category})` : ''}`
          }
        ],
        "response_format": { "type": "json_object" }
      })
    })

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      return JSON.parse(data.choices[0].message.content)
    }

    return null
  } catch {
    return null
  }
}
