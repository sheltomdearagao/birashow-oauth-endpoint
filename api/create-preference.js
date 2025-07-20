import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { vendedor_id, items, marketplace_fee, ...rest } = req.body;

  if (!vendedor_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes: vendedor_id e items' });
  }

  // Buscar access_token do vendedor no Supabase
  const { data: vendedor, error } = await supabase
    .from('vendedores')
    .select('access_token')
    .eq('id', vendedor_id)
    .single();

  if (error || !vendedor) {
    return res.status(404).json({ error: 'Vendedor não encontrado ou sem access_token' });
  }

  // Montar corpo da preferência
  const preference = {
    items,
    marketplace_fee: typeof marketplace_fee === 'number' ? marketplace_fee : 0,
    ...rest
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vendedor.access_token}`
      },
      body: JSON.stringify(preference)
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ error: 'Erro ao criar preferência', details: data });
    }
    return res.status(200).json({ preference: data });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao criar preferência', details: err.message });
  }
} 