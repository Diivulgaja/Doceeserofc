// api/create-payment.js

// ⚠️ SUA CHAVE DE PRODUÇÃO (Em produção real, use Variáveis de Ambiente no Painel da Vercel)
const ABACATE_API_KEY = "abc_prod_UjhbqsQL1PSR3TEbsJWWQy4n";

export default async function handler(req, res) {
  // Configuração de CORS (Permite que seu site acesse esta função)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde imediatamente a requisições OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { products, customer, returnUrl } = req.body;

    // Validação básica
    if (!customer || !customer.email || !customer.cpf) {
      return res.status(400).json({ error: "Email e CPF são obrigatórios." });
    }

    const cleanTaxId = customer.cpf.replace(/\D/g, '');

    const payload = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: products.map((item) => ({
        externalId: String(item.uniqueId || item.id),
        name: item.name,
        description: item.description || "Doce É Ser",
        quantity: item.quantity,
        price: Math.round(item.price * 100) // Centavos
      })),
      returnUrl: returnUrl,
      completionUrl: returnUrl,
      customer: {
        name: customer.name,
        cellphone: customer.phone,
        email: customer.email,
        taxId: cleanTaxId
      }
    };

    const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ABACATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.error?.message || "Erro na API AbacatePay" });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: "Erro interno no servidor Vercel" });
  }
}