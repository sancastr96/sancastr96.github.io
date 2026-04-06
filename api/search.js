export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query requerida' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const SYSTEM_PROMPT = `Eres un experto en el juego Mewgenics, el roguelike táctico de crianza de gatos creado por Edmund McMillen y Tyler Glaiel. El juego salió en Steam el 10 de febrero de 2026.

Cuando el usuario busca algo, debes responder SIEMPRE en español con información detallada y precisa sobre Mewgenics.

Tu respuesta debe:
1. Identificar el tipo de entrada con una etiqueta: [CLASE], [HABILIDAD], [ENEMIGO], [OBJETO], [MECÁNICA], [ELEMENTO], [NPC], [ZONA], [GENERAL]
2. Dar el nombre en inglés (el original) y explicarlo en español
3. Incluir detalles relevantes: stats, efectos, combos, estrategias, dónde aparece, cómo funciona
4. Si es una búsqueda general, hacer un resumen completo de esa categoría
5. Usar ### para subtítulos cuando sea útil
6. Mencionar combos, sinergias o tips útiles cuando los haya

Conocimiento del juego:
- CLASES: Collarless, Fighter, Hunter, Mage, Tank, Cleric, Rogue, Monk, Jester, Bard y más
- ELEMENTOS: Fire, Ice, Electric, Poison, Water, Holy, Dark, Physical, y más (11 en total)
- MECÁNICAS: grid táctico, 1 pelea por gato por generación, crianza/herencia de stats, casa, clima
- ZONAS: Town, Caves, Bunker, The Core, y más capítulos
- NPCs: Dr. Beanies, Butch, y otros
- OBJETOS: armas, cascos, trinkets, sets con efectos combinados
- MUTACIONES: Head, Body, Tail - heredables genéticamente
- AFLICCIONES: Burn, Slow, Stun, Wet, y más`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Búsqueda: "${query}"\n\nExplícame todo sobre esto en Mewgenics, en español.` }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Error de Groq', detail: data });
    }

    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
