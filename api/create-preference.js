// api/webhook.js
// Vercel Serverless Function — recibe notificaciones de Mercado Pago
// y envía email al vendedor cuando el pago es aprobado

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  // Solo procesar pagos
  if (type !== 'payment') {
    return res.status(200).json({ status: 'ignored' });
  }

  try {
    // Obtener detalles del pago desde MP
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await paymentRes.json();

    // Solo notificar pagos aprobados
    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'payment_not_approved', payment_status: payment.status });
    }

    // Construir resumen del pedido
    const items = payment.additional_info?.items || [];
    const itemsList = items.length
      ? items.map(i => `• ${i.quantity}x ${i.title} — $${Number(i.unit_price).toLocaleString('es-CL')} c/u`).join('\n')
      : '(sin detalle de items)';

    const total = Number(payment.transaction_amount).toLocaleString('es-CL');
    const payerName  = payment.payer?.first_name || 'Cliente';
    const payerEmail = payment.payer?.email || 'sin email';
    const payerId    = payment.id;
    const fecha      = new Date(payment.date_approved).toLocaleString('es-CL');

    // Enviar email via Resend (servicio gratuito, 100 emails/día)
    const emailBody = {
      from:    'AirPods Store <notificaciones@resend.dev>',
      to:      [process.env.NOTIFY_EMAIL],
      subject: `✅ Pago aprobado — $${total} CLP`,
      text: `
¡Nuevo pago aprobado!

📦 PEDIDO #${payerId}
📅 Fecha: ${fecha}

👤 Cliente: ${payerName}
📧 Email: ${payerEmail}

🛒 Productos:
${itemsList}

💰 Total: $${total} CLP

---
Método de pago: ${payment.payment_method_id}
Estado: ${payment.status}

Revisa tu panel de Mercado Pago para más detalles.
      `.trim(),
    };

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!emailRes.ok) {
      const emailErr = await emailRes.json();
      console.error('Email error:', emailErr);
      // No fallar el webhook por error de email
    }

    return res.status(200).json({ status: 'ok', payment_id: payerId });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
