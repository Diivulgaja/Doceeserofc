// src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart, Plus, Minus, X, Home, ChevronRight, Truck, MapPin,
  Loader2, Cake, Heart, Trash2, Check, Clock, Utensils, Star, Phone,
  QrCode, Copy, CreditCard, Bike, Package, User, Lock, Gift, LogOut,
  ChevronDown, History, FileText, AlertCircle, CheckCircle, Info
} from "lucide-react";

/* ------------- CONFIGURAÇÕES ------------- */
const COLLECTION_ORDERS = "doceeser_pedidos"; 
const AVAILABILITY_TABLE = "doceeser_availability";
const DELIVERY_FEE = 2.99;
const ETA_TEXT = "20–35 min";
const LOYALTY_GOAL = 10; 

// URL DA LOGO
const LOGO_URL = "https://i.imgur.com/4LsEEuy.jpeg";

// CHAVE ABACATE PAY
const ABACATE_API_KEY = "abc_dev_QdGhCfpcGjZ4AcM2eZaR2nxQ"; 

// SUPABASE
const SUPABASE_URL = 'https://elpinlotdogazhpdwlqr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

// --- DADOS ---
const ACAI_TOPPINGS = [
  { name: "Banana", price: 0.01 }, { name: "Morango", price: 2.00 },
  { name: "Leite Ninho", price: 1.00 }, { name: "Leite Condensado", price: 0.01 },
  { name: "Creme de Ninho", price: 1.00 }, { name: "Nutella", price: 3.00 },
  { name: "Amendoim", price: 1.00 },
];
const ACAI_ID = 18;
const ACAI_BASE_PRICE = 17.90;

const initialProducts = [
  { id: 9, name: "Red velvet com Ninho e Morangos", price: 15.90, category: 'bolos', description: "Massa aveludada e macia, coberta com creme de leite Ninho cremoso.", imageUrl: "https://i.imgur.com/3UDWhLR.png" },
  { id: 2, name: "Bolo Cenoura com chocolate", price: 15.90, category: 'bolos', description: "Mini vulcão de cenoura com explosão de chocolate.", imageUrl: "https://i.imgur.com/aaUdL2b.png" },
  { id: 10, name: "Chocolate com Morangos", price: 15.90, category: 'bolos', description: "Bolo fofinho de chocolate com morangos.", imageUrl: "https://i.imgur.com/MMbQohl.png" },
  { id: 13, name: "Chocolatudo!!!", price: 15.90, category: 'bolos', description: "Bolo com muito chocolate.", imageUrl: "https://i.imgur.com/3Hva4Df.png" },
  { id: 16, name: "Bolo de Ferreiro com Nutella", price: 16.90, category: 'bolos', description: "Chocolate, amendoim e Nutella.", imageUrl: "https://i.imgur.com/OamNqov.png" },
  { id: 17, name: "Copo Oreo com Nutella", price: 24.90, category: 'copo_felicidade', description: "Camadas de Ninho, Oreo e Nutella.", imageUrl: "https://i.imgur.com/1EZRMVl.png" },
  { id: 24, name: "Copo Maracujá com Brownie", price: 24.90, category: 'copo_felicidade', description: "Maracujá, chocolate e brownie.", imageUrl: "https://i.imgur.com/PypEwAz.png" },
  { id: 25, name: "Copo Brownie Dois Amores", price: 22.90, category: 'copo_felicidade', description: "Dois amores + brownie.", imageUrl: "https://i.imgur.com/mMQtXDB.png" },
  { id: 26, name: "Copo Encanto de Ninho e Morangos", price: 22.90, category: 'copo_felicidade', description: "Ninho e morangos frescos.", imageUrl: "https://i.imgur.com/EgFhhwL.png" },
  { id: 27, name: "Copo de Brownie com Ferreiro e Nutella", price: 26.90, category: 'copo_felicidade', description: "Brownie, Ferrero e Nutella.", imageUrl: "https://i.imgur.com/t6xeVDf.png" },
  { id: 20, name: "Brownie De Ninho e Nutella", price: 11.90, category: 'brownie', description: "Brownie com Ninho e Nutella.", imageUrl: "https://i.imgur.com/vWdYZ8K.png" },
  { id: 21, name: "Brownie Recheado com Nutella e Morangos", price: 22.90, category: 'brownie', description: "Recheado com Ninho, Nutella e morangos.", imageUrl: "https://i.imgur.com/P1pprjF.png" },
  { id: 22, name: "Brownie Ferreiro com Nutella", price: 11.90, category: 'brownie', description: "Com Nutella e amendoim.", imageUrl: "https://i.imgur.com/rmp3LtH.png" },
  { id: 23, name: "Brownie Duo com Oreo", price: 11.90, category: 'brownie', description: "Cobertura de chocolate e Oreo.", imageUrl: "https://i.imgur.com/8IbcWWj.png" },
  { id: ACAI_ID, name: "Copo de Açaí 250ml", price: ACAI_BASE_PRICE, category: 'acai', description: "Monte do seu jeito.", imageUrl: "https://i.imgur.com/OrErP8N.png" },
  { id: 6, name: "Empada de Camarão e Requeijão", price: 12.00, category: 'salgado', description: "Camarão cremoso.", imageUrl: "https://i.imgur.com/rV18DkJ.png" }
];

const categories = {
  all: 'Todos',
  bolos: 'Bolos',
  copo_felicidade: 'Copos',
  brownie: 'Brownies',
  acai: 'Açaí',
  salgado: 'Salgados',
};

const formatBR = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// --- COMPONENTES AUXILIARES ---

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-slideIn ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800' : toast.type === 'error' ? 'bg-white border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-800'}`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
};

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-slideUp max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-600"/> Termos de Uso</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="overflow-y-auto pr-2 text-sm text-gray-600 space-y-4 custom-scrollbar">
          <p>Bem-vindo ao Doce É Ser! Ao utilizar nosso serviço, você concorda com os seguintes termos:</p>
          <div><strong className="text-gray-800">1. Pedidos</strong><p>Sujeitos à disponibilidade.</p></div>
          <div><strong className="text-gray-800">2. Pagamentos</strong><p>Via Pix através da AbacatePay.</p></div>
          <div><strong className="text-gray-800">3. Dados</strong><p>CPF necessário para emissão de nota.</p></div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition">Entendi</button>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuth, onOpenTerms }) => {
  if (!isOpen) return null;
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '', cpf: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!acceptedTerms) return onAuth('error', "Aceite os termos para continuar.");
      if (formData.password !== formData.confirmPassword) return onAuth('error', "Senhas não conferem.");
      onAuth('register', formData);
    } else {
      onAuth('login', formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        <div className="text-center mb-6">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
            {isRegister ? <User className="w-8 h-8"/> : <Lock className="w-8 h-8"/>}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{isRegister ? 'Criar Conta' : 'Bem-vindo!'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && <input required className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Seu nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input required type="tel" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Telefone (11999999999)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          {isRegister && <input required type="tel" maxLength="14" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="CPF (Apenas números)" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />}
          <input required type="password" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          {isRegister && <input required type="password" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />}
          {isRegister && (
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">Aceito os <span className="text-amber-600 font-bold hover:underline" onClick={(e) => { e.preventDefault(); onOpenTerms(); }}>Termos de Uso</span></label>
            </div>
          )}
          <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition">{isRegister ? 'Cadastrar' : 'Entrar'}</button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-amber-700 font-semibold hover:underline">{isRegister ? 'Já tenho conta? Entrar' : 'Criar conta'}</button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, data, onConfirm }) => {
  if (!isOpen || !data) return null;

  // Se data.data.billing existir, usa ele, senão usa data direto (flexibilidade)
  const billing = data.data?.billing || data.billing || data; 
  
  // URL do pagamento (se a API retornar link direto)
  const paymentUrl = billing.url;

  const copyToClipboard = () => {
    // Tenta pegar o código pix se existir
    // Como a API retorna billing.url e billing.id, mas não necessariamente o "copia e cola" pix direto no objeto principal sem chamar outra rota de detalhes
    // Vamos verificar se existe um campo específico ou usar a URL como fallback para o botão "Pagar"
    const pixCode = billing.pix?.copypaste || billing.url; // Fallback para URL se não tiver copypaste
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      alert("Código/Link copiado! Se for um link, cole no navegador.");
    } else {
        alert("Erro ao copiar código. Tente abrir o link abaixo.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-slideUp">
        <div className="bg-green-600 p-6 text-center text-white">
           <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90" />
           <h3 className="text-2xl font-bold">Pagamento Criado</h3>
           <p className="text-green-100 text-sm">Finalize o pagamento para confirmar</p>
        </div>
        <div className="p-8 flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300 overflow-hidden relative group">
             {/* Como não temos o QR Code image direto, mostramos um ícone ou link */}
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white opacity-0 group-hover:opacity-10 text-xs font-bold text-gray-500">QR Code</div>
             <div className="z-10 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center w-full h-full text-center p-4">
                {paymentUrl ? <a href={paymentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline break-all">Clique para abrir pagamento</a> : <QrCode className="w-32 h-32 text-gray-800" />}
             </div>
          </div>
          <p className="text-2xl font-black text-gray-800 mb-6 text-center mt-4">Valor: {formatBR(billing.amount ? billing.amount / 100 : 0)}</p>
          <div className="w-full space-y-3">
             {/* Se tiver URL de pagamento, oferece botão para abrir */}
             {paymentUrl && (
                <a href={paymentUrl} target="_blank" rel="noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-center transition">
                    Abrir Pagamento
                </a>
             )}
            <button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/20">Já fiz o pagamento!</button>
          </div>
          <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const AcaiModal = ({ product, onClose, onAdd }) => {
  if (!product) return null;
  const [selected, setSelected] = useState([]);
  const toggle = (name) => setSelected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  const extraPrice = selected.reduce((acc, name) => acc + (ACAI_TOPPINGS.find(t => t.name === name)?.price || 0), 0);
  const finalPrice = product.price + extraPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-slideUp">
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-purple-700 to-purple-900 text-white">
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300 fill-current" /><h3 className="font-bold text-lg">Montar Açaí</h3></div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            {ACAI_TOPPINGS.map(t => {
              const isSelected = selected.includes(t.name);
              return (
                <div key={t.name} onClick={() => toggle(t.name)} className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>{isSelected && <Check className="w-3 h-3 text-white" />}</div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>{t.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold">+{formatBR(t.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <div><p className="text-xs text-gray-500 uppercase font-bold">Total</p><p className="text-2xl font-black text-purple-900">{formatBR(finalPrice)}</p></div>
          </div>
          <button onClick={() => { onAdd({ ...product, price: finalPrice, isCustom: true, uniqueId: Math.random().toString(36) }, 1, selected); onClose(); }} className="w-full bg-purple-700 text-white py-3.5 rounded-xl font-bold hover:bg-purple-800 transition">Adicionar ao Carrinho</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES PRINCIPAIS ---

const LoyaltyCard = ({ progress }) => {
  const percentage = Math.min((progress / LOYALTY_GOAL) * 100, 100);
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10"><Gift className="w-48 h-48 -mr-10 -mt-10" /></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-yellow-300 fill-current"/> Clube Fidelidade</h3>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{progress} Pedidos</div>
        </div>
        <div className="bg-black/20 rounded-full h-4 w-full mb-2 overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-yellow-300 to-amber-500 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-indigo-100 mb-4"><span>0</span><span>{LOYALTY_GOAL} Pedidos</span></div>
      </div>
    </div>
  );
};

const OrdersHistory = ({ supabase, user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase || !user) return;
    const fetchHistory = async () => {
      setLoading(true);
      const { data } = await supabase.from(COLLECTION_ORDERS)
        .select('*')
        .eq('customer->>telefone', user.phone)
        .neq('status', 'user_account')
        .order('createdAt', { ascending: false });
      if (data) setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [supabase, user]);

  return (
    <div className="p-4 pb-32 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><History className="w-6 h-6"/> Meus Pedidos</h2>
      {loading ? <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600"/></div> : 
       history.length === 0 ? <p className="text-center text-gray-500 py-10">Você ainda não fez pedidos.</p> : (
        <div className="space-y-4">
          {history.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-gray-800">Pedido #{order.id.slice(0,4).toUpperCase()}</span>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'entregue' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
              </div>
              <p className="text-sm text-gray-600">{order.items?.length} itens • {formatBR(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [page, setPage] = useState('menu');
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [acaiModalProduct, setAcaiModalProduct] = useState(null);
  const [user, setUser] = useState(null); 
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [loyaltyProgress, setLoyaltyProgress] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [customer, setCustomer] = useState({ nome: '', email: '', telefone: '', rua: '', numero: '', bairro: '', cpf: '' });
  const [lastOrderId, setLastOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('novo');
  const [availableProducts, setAvailableProducts] = useState({});
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    if (window.supabase && window.supabase.createClient) {
      setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      if (window.supabase) setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const storedUser = localStorage.getItem('doceeser_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCustomer({ ...customer, nome: parsedUser.name, email: parsedUser.email || '', telefone: parsedUser.phone, cpf: parsedUser.cpf || '', rua: parsedUser.address?.rua || '', numero: parsedUser.address?.numero || '', bairro: parsedUser.address?.bairro || '' });
      fetchLoyalty(parsedUser.phone);
    }
    fetchProductAvailability();
  }, [supabase]);

  const fetchProductAvailability = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from(AVAILABILITY_TABLE).select('*');
      if (data) {
        const map = {};
        data.forEach(item => { map[item.id] = item.is_active; });
        setAvailableProducts(map);
      }
    } catch (e) { console.log("Erro disponibilidade:", e); }
  };

  const fetchLoyalty = async (phone) => {
    if (!supabase || !phone) return;
    try {
      const { count } = await supabase.from(COLLECTION_ORDERS).select('*', { count: 'exact', head: true }).eq('customer->>telefone', phone).eq('status', 'entregue');
      setLoyaltyProgress(count || 0);
    } catch (e) {}
  };

  const addToCart = (product, quantity = 1, toppings = []) => {
    const uniqueId = product.isCustom ? product.uniqueId : product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.isCustom ? item.uniqueId === uniqueId : item.id === product.id));
      if (existing) {
        showToast("Item atualizado!", 'success');
        return prev.map(item => (item === existing ? { ...item, quantity: item.quantity + quantity } : item));
      }
      showToast("Adicionado ao carrinho!", 'success');
      return [...prev, { ...product, quantity, toppings, uniqueId }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => (item.uniqueId || item.id) !== itemId));
    showToast("Removido do carrinho.");
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = cartTotal + DELIVERY_FEE;

  const handleAuth = async (type, data) => {
    if (type === 'error') return showToast(data, 'error');
    if (!supabase) return showToast("Erro de conexão.", 'error');
    const userId = `user_${data.phone.replace(/\D/g, '')}`; 
    try {
      if (type === 'login') {
        const { data: userData } = await supabase.from(COLLECTION_ORDERS).select('customer').eq('id', userId).maybeSingle();
        if (userData && userData.customer && userData.customer.password === data.password) {
           loginUser(userData.customer);
           showToast(`Bem-vindo, ${userData.customer.name}!`, 'success');
        } else showToast("Dados incorretos.", 'error');
      } else if (type === 'register') {
        const { data: existing } = await supabase.from(COLLECTION_ORDERS).select('id').eq('id', userId).maybeSingle();
        if (existing) return showToast("Telefone já cadastrado.", 'error');
        const newUser = { name: data.name, phone: data.phone, password: data.password, cpf: data.cpf, address: {}, createdAt: new Date().toISOString() };
        await supabase.from(COLLECTION_ORDERS).insert({ id: userId, status: 'user_account', total: 0, customer: newUser, items: [] });
        loginUser(newUser);
        showToast("Conta criada!", 'success');
      }
    } catch (e) { showToast("Erro no servidor.", 'error'); }
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('doceeser_user', JSON.stringify(userData));
    setCustomer(prev => ({ ...prev, nome: userData.name, telefone: userData.phone, email: userData.email || '', cpf: userData.cpf || '', rua: userData.address?.rua || '', numero: userData.address?.numero || '', bairro: userData.address?.bairro || '' }));
    fetchLoyalty(userData.phone);
    setAuthModalOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('doceeser_user');
    setCustomer({ nome: '', email: '', telefone: '', rua: '', numero: '', bairro: '', cpf: '' });
    setIsUserMenuOpen(false);
    showToast("Você saiu da conta.");
  };

  const handleInitiatePayment = async () => {
    if (!customer.nome || !customer.email || !customer.telefone || !customer.rua || !customer.cpf) return showToast("Preencha todos os dados.", 'error');
    
    if (user && supabase) {
       const userId = `user_${user.phone.replace(/\D/g, '')}`;
       const updated = { ...user, email: customer.email, cpf: customer.cpf, address: { rua: customer.rua, numero: customer.numero, bairro: customer.bairro } };
       await supabase.from(COLLECTION_ORDERS).update({ customer: updated }).eq('id', userId);
       setUser(updated);
       localStorage.setItem('doceeser_user', JSON.stringify(updated));
    }

    setIsProcessingPayment(true);
    
    try {
      const response = await fetch("https://corsproxy.io/?https://api.abacatepay.com/v1/billing/create", {
        method: "POST",
        headers: { "Authorization": `Bearer ${ABACATE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          frequency: "ONE_TIME", methods: ["PIX"],
          products: cart.map(item => ({ externalId: String(item.id), name: item.name, quantity: item.quantity, price: Math.round(item.price * 100) })),
          returnUrl: window.location.href, completionUrl: window.location.href,
          customer: { name: customer.nome, cellphone: customer.telefone.replace(/\D/g, ''), email: customer.email, taxId: customer.cpf.replace(/\D/g, '') }
        })
      });
      const data = await response.json();
      
      // Flexibilidade para pegar o objeto de cobrança em diferentes estruturas
      const billing = data.data?.billing || data.billing || (data.pix ? data : null);

      if (billing && billing.pix) {
        setPaymentData(billing);
        setPaymentModalOpen(true);
      } else { throw new Error(JSON.stringify(data)); }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar Pix. Verifique os dados.", 'error');
    }
    setIsProcessingPayment(false);
  };

  const handleConfirmOrder = async () => {
    if (!supabase) return;
    const orderId = `ord_${Date.now()}`;
    const payload = { id: orderId, status: 'novo', createdAt: new Date().toISOString(), total: finalTotal, items: cart, customer: customer };
    const { error } = await supabase.from(COLLECTION_ORDERS).insert(payload);
    if (!error) {
      setLastOrderId(orderId);
      setOrderStatus('novo');
      setCart([]);
      setPaymentModalOpen(false);
      setPage('tracking');
      showToast("Pedido enviado!", 'success');
    } else { showToast("Erro ao enviar pedido.", 'error'); }
  };

  const visibleProducts = useMemo(() => initialProducts.filter(p => availableProducts[p.id] !== false), [availableProducts]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      <header className="sticky top-0 bg-white/90 backdrop-blur-lg shadow-sm z-40 px-4 py-3 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage('menu')}>
            <img src={LOGO_URL} alt="Doce É Ser" className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105" />
            <div><h1 className="font-bold text-lg text-gray-800 leading-tight">Doce É Ser</h1></div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl transition">
                  <div className="bg-amber-100 p-1 rounded-full"><User className="w-4 h-4 text-amber-700"/></div>
                  <span className="text-sm font-bold hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4"/>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button onClick={() => { setPage('history'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-bold flex items-center gap-2"><History className="w-4 h-4"/> Meus Pedidos</button>
                    <button onClick={logoutUser} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center gap-2"><LogOut className="w-4 h-4"/> Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition">
                <User className="w-4 h-4" /> Entrar
              </button>
            )}
            <button onClick={() => setPage('cart')} className="relative p-3 rounded-xl hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto min-h-[80vh] animate-fadeIn">
        {page === 'menu' && (
          <div className="pb-32">
            {user ? <div className="px-4 mt-6"><LoyaltyCard progress={loyaltyProgress} /></div> : (
              <div className="relative mx-4 mt-6 mb-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-8">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-3xl font-extrabold mb-3">O doce equilíbrio <br/>que o seu dia precisa. 🍰</h2>
                  <button onClick={() => setAuthModalOpen(true)} className="bg-white text-amber-800 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-gray-50">Criar Conta / Entrar</button>
                </div>
              </div>
            )}
            <div className="sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-md py-4 border-b border-gray-200/50 mb-6">
              <div className="max-w-4xl mx-auto px-4 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {Object.entries(categories).map(([key, label]) => (
                  <button key={key} onClick={() => setCategoryFilter(key)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap border ${categoryFilter === key ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-500 border-gray-200'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.filter(p => categoryFilter === 'all' || p.category === categoryFilter).map(p => (
                <div key={p.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-grow">{p.description}</p>
                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                      <span className="font-extrabold text-amber-600 text-xl">{formatBR(p.price)}</span>
                      <button onClick={() => p.id === ACAI_ID ? setAcaiModalProduct(p) : addToCart(p)} className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg hover:bg-amber-700 transition"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'cart' && (
          <div className="p-4 pb-32 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3"><ShoppingCart className="w-6 h-6"/> Seu Carrinho</h2>
            {cart.length === 0 ? <div className="text-center py-10 text-gray-500"><p>Sua sacola está vazia.</p><button onClick={() => setPage('menu')} className="mt-4 text-amber-600 font-bold hover:underline">Ver Cardápio</button></div> : (
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0"><img src={item.imageUrl} className="w-full h-full object-cover"/></div>
                    <div className="flex-grow">
                       <div className="flex justify-between"><h4 className="font-bold">{item.name}</h4><button onClick={() => removeFromCart(item.uniqueId || item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>
                       {item.toppings && <p className="text-xs text-gray-500">+ {item.toppings.join(', ')}</p>}
                       <div className="flex justify-between items-end mt-2">
                         <p className="font-bold text-amber-700">{formatBR(item.price * item.quantity)}</p>
                         <div className="flex items-center gap-2 bg-gray-50 rounded p-1"><button onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item.uniqueId || item.id)} className="p-1"><Minus className="w-3 h-3"/></button><span className="text-sm font-bold w-4 text-center">{item.quantity}</span><button onClick={() => addToCart(item, 1)} className="p-1"><Plus className="w-3 h-3"/></button></div>
                       </div>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">Entrega</h3>
                  {!user && <p className="text-xs text-blue-600 cursor-pointer" onClick={()=>setAuthModalOpen(true)}>Faça login para preencher automaticamente.</p>}
                  <input placeholder="Seu Nome" className="w-full p-3 border rounded-lg" value={customer.nome} onChange={e => setCustomer({...customer, nome: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Telefone" className="p-3 border rounded-lg" value={customer.telefone} onChange={e => setCustomer({...customer, telefone: e.target.value})} />
                    <input placeholder="CPF" className="p-3 border rounded-lg" value={customer.cpf} onChange={e => setCustomer({...customer, cpf: e.target.value})} />
                  </div>
                  <input placeholder="Email" className="w-full p-3 border rounded-lg" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                  <input placeholder="Endereço" className="w-full p-3 border rounded-lg" value={customer.rua} onChange={e => setCustomer({...customer, rua: e.target.value})} />
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Número" className="p-3 border rounded-lg" value={customer.numero} onChange={e => setCustomer({...customer, numero: e.target.value})} />
                    <input placeholder="Bairro" className="col-span-2 p-3 border rounded-lg" value={customer.bairro} onChange={e => setCustomer({...customer, bairro: e.target.value})} />
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center"><span className="font-bold">Total</span><span className="text-xl font-black text-amber-700">{formatBR(finalTotal)}</span></div>
                  <button onClick={handleInitiatePayment} disabled={isProcessingPayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700">{isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Truck className="w-5 h-5"/> Pagar com Pix</>}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'history' && <OrdersHistory supabase={supabase} user={user} />}
        
        {page === 'tracking' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><Check className="w-10 h-10"/></div>
             <h2 className="text-2xl font-bold mb-2">Pedido Recebido!</h2>
             <p className="text-gray-500 mb-6">Acompanhe o status abaixo.</p>
             <div className="bg-white p-6 rounded-xl shadow-sm border w-full max-w-sm">
                <p className="text-xs uppercase font-bold text-gray-400">Status</p>
                <p className="text-xl font-bold text-amber-600 mb-4 uppercase">{orderStatus}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"><Clock className="w-4 h-4"/> Previsão: <strong>{ETA_TEXT}</strong></div>
             </div>
             <button onClick={() => {setPage('menu'); setCart([]);}} className="mt-8 text-amber-700 font-bold hover:underline">Voltar ao Menu</button>
          </div>
        )}
      </main>

      <AcaiModal product={acaiModalProduct} onClose={() => setAcaiModalProduct(null)} onAdd={addToCart} />
      <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} data={paymentData} onConfirm={handleConfirmOrder} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuth={handleAuth} onOpenTerms={() => setTermsModalOpen(true)} />
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      <footer className="bg-white border-t border-gray-100 py-10 text-center text-sm text-gray-400">
        <p>Feito por <a href="https://instagram.com/diivulgaja" target="_blank" rel="noreferrer" className="font-bold text-amber-700 hover:text-amber-900">Divulga Já</a></p>
      </footer>
    </div>
  );
}
