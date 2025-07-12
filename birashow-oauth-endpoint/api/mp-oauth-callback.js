import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    // Troca o code pelo access token no Mercado Pago
    const client_id = process.env.MP_CLIENT_ID;
    const client_secret = process.env.MP_CLIENT_SECRET;
    const redirect_uri = process.env.MP_REDIRECT_URI;

    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        code,
        redirect_uri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(400).json({ error: tokenData });
    }

    // Salva no Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const seller_id = tokenData.user_id;
    const { error } = await supabase
      .from('establishments')
      .upsert({
        id: seller_id,
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: tokenData.user_id,
        mp_public_key: tokenData.public_key,
        mp_scope: tokenData.scope,
        mp_token_type: tokenData.token_type,
        mp_expires_in: tokenData.expires_in,
        mp_raw: tokenData,
      }, { onConflict: 'id' });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Mercado Pago integration successful' });
  } catch (e) {
    return res.status(500).json({ error: (e instanceof Error ? e.message : String(e)), stack: (e instanceof Error ? e.stack : undefined) });
  }
} 