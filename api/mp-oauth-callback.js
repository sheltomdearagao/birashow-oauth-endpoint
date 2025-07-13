import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  // Gera um state aleatório
  const state = uuidv4();
  // Monta o link de autorização
  const client_id = '5952073496283750';
  const redirect_uri = encodeURIComponent('https://birashow-oauth-endpoint.vercel.app/api/mp-oauth-callback');
  const link = `https://auth.mercadopago.com/authorization?client_id=${client_id}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${redirect_uri}`;
  res.status(200).json({ message: "Callback funcionando!", link });
} 