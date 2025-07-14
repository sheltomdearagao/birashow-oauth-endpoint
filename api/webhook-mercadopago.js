export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Loga o corpo da notificação para debug
  console.log('Webhook Mercado Pago recebido:', req.body);

  // Responde imediatamente para o Mercado Pago
  res.status(200).json({ received: true });
} 