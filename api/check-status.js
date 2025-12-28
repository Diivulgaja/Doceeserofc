// api/check-status.js

// ⚠️ SUA CHAVE DE PRODUÇÃO
const ABACATE_API_KEY = "abc_prod_UjhbqsQL1PSR3TEbsJWWQy4n";

module.exports = async (req, res) => {
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

  // No Vercel, query params vêm em req.query
  // Exemplo de chamada: /api/check-status?billingId=bill_12345
  const { billingId } = req.query;

  if (!billingId) {
    return res.status(400).json({ error: 'Billing ID required' });
  }

  try {
    // Busca a lista de cobranças filtrando pelo ID
    const response = await fetch(`https://api.abacatepay.com/v1/billing/list?id=${billingId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ABACATE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    // A API retorna uma lista em 'data.data', precisamos encontrar o nosso billing
    const bill = data.data?.find(b => b.id === billingId);

    if (bill) {
      // Retorna o status (PENDING, PAID, etc.)
      return res.status(200).json({ status: bill.status });
    } else {
      return res.status(404).json({ status: 'UNKNOWN', message: 'Cobrança não encontrada' });
    }

  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return res.status(500).json({ error: "Erro interno no servidor Vercel: " + error.message });
  }
};