'use server'

export async function getAITriage(description: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = "minimax/minimax-m2.5:free"

  if (!apiKey) {
    console.warn('AI Triage: OPENROUTER_API_KEY missing. Falling back to default values.')
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
            "content": `Você é um especialista em manutenção predial. Analise a descrição de um problema enviada por um inquilino e retorne EXATAMENTE um JSON com a categoria e a gravidade do problema.
            
            Categorias permitidas (escolha a que melhor se encaixa): "eletrica", "hidraulica", "alvenaria", "pintura", "serralheria", "ar_cond", "jardim", "limpeza", "outros".
            Gravidades permitidas: "low", "medium", "high", "critical".
            
            Formato de saída:
            {
              "category": "string",
              "severity": "string",
              "reason": "breve explicação curta justificando a gravidade e categoria"
            }`
          },
          {
            "role": "user",
            "content": description
          }
        ],
        "response_format": { "type": "json_object" }
      })
    })

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      const content = JSON.parse(data.choices[0].message.content)
      return {
        category: content.category || 'outros',
        severity: content.severity || 'medium',
        reason: content.reason || ''
      }
    }

    return null
  } catch (error) {
    console.error('AI Triage error:', error)
    return null
  }
}
