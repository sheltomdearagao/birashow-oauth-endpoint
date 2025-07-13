import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (code) {
    // Troca o code pelo access token
    const client_id = '5952073496283750';
    const client_secret = 'w6YhglIrqSopTWcfCH3MACW3F4yVvGwl';
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

      return res.status(200).json({ message: "Token recebido com sucesso!", token: data });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao trocar code pelo token', details: error.message });
    }
  }

  // Se não tem code, gera o link de autorização
  const newState = uuidv4();
  const client_id = '5952073496283750';
  const redirect_uri = encodeURIComponent('https://birashow-oauth-endpoint.vercel.app/api/mp-oauth-callback');
  const link = `https://auth.mercadopago.com/authorization?client_id=${client_id}&response_type=code&platform_id=mp&state=${newState}&redirect_uri=${redirect_uri}`;
  res.status(200).json({ message: "Callback funcionando!", link });
} 