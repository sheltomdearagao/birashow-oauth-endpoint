import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vgkpqfsblggulrffzfhk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZna3BxZnNibGdndWxyZmZ6ZmhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcyNDIyOCwiZXhwIjoyMDY3MzAwMjI4fQ.hNJ94EO5NU1GtQm2y3h4TkmV9JQLhrsFX6RZS8C2fko'
);

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (code) {
    const client_id = '5814832504477005';
    const client_secret = 'CseAQNMgENaOoMpAt7uBI8GdM8rH8qgz';
    const redirect_uri = 'https://birashow-oauth-endpoint.vercel.app/api/mp-oauth-callback';

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);

    try {
      const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({ error: 'Erro ao trocar code pelo token', details: data });
      }

      // Usa o user_id do Mercado Pago como id do vendedor
      const { error } = await supabase
        .from('vendedores')
        .upsert({
          id: data.user_id, // user_id do Mercado Pago como identificador
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user_id: data.user_id,
          public_key: data.public_key,
          data_autorizacao: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }, { onConflict: ['id'] });

      if (error) {
        return res.status(500).json({ error: 'Erro ao salvar no Supabase', details: error.message });
      }

      return res.status(200).json({ message: "Token salvo com sucesso no Supabase!", vendedorId: data.user_id, token: data });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao trocar code pelo token', details: error.message });
    }
  }

  // Gera o link de autorização com state = id do vendedor
  const vendedorId = req.query.vendedorId || uuidv4();
  const client_id = '5952073496283750';
  const redirect_uri = encodeURIComponent('https://birashow-oauth-endpoint.vercel.app/api/mp-oauth-callback');
  const link = `https://auth.mercadopago.com/authorization?client_id=${client_id}&response_type=code&platform_id=mp&state=${vendedorId}&redirect_uri=${redirect_uri}`;
  res.status(200).json({ message: "Callback funcionando!", link });
} 