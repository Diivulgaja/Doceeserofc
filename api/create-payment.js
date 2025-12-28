const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const ABACATE_API_KEY = "abc_prod_UjhbqsQL1PSR3TEbsJWWQy4n";

// Rota para Criar Cobrança
app.post('/create-payment', async (req, res) => {
  try {
    const { products, customer, returnUrl } = req.body;
    console.log("💰 Criando Pix para:", customer.name);

    if (!customer.email || !customer.cpf) {
      return res.status(400).json({ error: "Email e CPF obrigatórios" });
    }

    const payload = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: products.map((item) => ({
        externalId: String(item.uniqueId || item.id),
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price * 100)
      })),
      returnUrl: returnUrl,
      completionUrl: returnUrl,
      customer: {
        name: customer.name,
        cellphone: customer.phone,
        email: customer.email,
        taxId: customer.cpf.replace(/\D/g, '')
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
    if (!response.ok) return res.status(400).json(data);
    
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ✅ NOVA ROTA: Verificar Status do Pagamento
app.get('/check-status/:billingId', async (req, res) => {
  try {
    const { billingId } = req.params;
    
    // A AbacatePay permite listar e filtrar por ID
    const response = await fetch(`https://api.abacatepay.com/v1/billing/list?id=${billingId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ABACATE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    // Procura a cobrança específica na lista retornada
    const bill = data.data?.find(b => b.id === billingId);

    if (bill) {
      console.log(`🔍 Status do pedido ${billingId}: ${bill.status}`);
      res.json({ status: bill.status }); // Retorna 'PENDING', 'PAID', etc.
    } else {
      res.status(404).json({ status: 'UNKNOWN' });
    }

  } catch (error) {
    console.error("Erro ao checar status:", error);
    res.status(500).json({ error: "Erro ao verificar status" });
  }
});

app.listen(3001, () => {
  console.log('🚀 Servidor rodando em http://localhost:3001');
});
