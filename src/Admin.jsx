// src/Admin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trash2, Clock, Check, Loader2, LayoutDashboard, 
  ShoppingBag, LogOut, Bell, BellOff, MessageCircle, 
  MapPin, Phone, User, DollarSign, TrendingUp, Calendar, 
  Menu, X, Search, ChevronRight, Zap, Printer, ChefHat, Bike, Cake, 
  Eye, EyeOff, Edit, Lock, Unlock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';

// Chaves do Supabase
const supabaseUrl = 'https://elpinlotdogazhpdwlqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

/* --- CONFIGURAÇÕES --- */
const ADMIN_PASSWORD = '071224';
const TABLE = 'doceeser_pedidos';
const AVAILABILITY_TABLE = 'doceeser_availability'; 
const STORE_STATUS_ID = 999999; // ID reservado para status da loja
const MOTOBOY_NUMBER = '5548991692018'; 

// --- LISTA DE PRODUTOS ---
const ACAI_ID = 18;
const ACAI_BASE_PRICE = 17.90;
const PRODUCTS_LIST = [
  { id: 9, name: "Red velvet com Ninho e Morangos", price: 15.90, category: 'bolos', imageUrl: "https://i.imgur.com/3UDWhLR.png" },
  { id: 2, name: "Bolo Cenoura com chocolate", price: 15.90, category: 'bolos', imageUrl: "https://i.imgur.com/aaUdL2b.png" },
  { id: 10, name: "Chocolate com Morangos", price: 15.90, category: 'bolos', imageUrl: "https://i.imgur.com/MMbQohl.png" },
  { id: 13, name: "Chocolatudo!!!", price: 15.90, category: 'bolos', imageUrl: "https://i.imgur.com/3Hva4Df.png" },
  { id: 16, name: "Bolo de Ferreiro com Nutella", price: 16.90, category: 'bolos', imageUrl: "https://i.imgur.com/OamNqov.png" },
  { id: 17, name: "Copo Oreo com Nutella", price: 24.90, category: 'copo_felicidade', imageUrl: "https://i.imgur.com/1EZRMVl.png" },
  { id: 24, name: "Copo Maracujá com Brownie", price: 24.90, category: 'copo_felicidade', imageUrl: "https://i.imgur.com/PypEwAz.png" },
  { id: 25, name: "Copo Brownie Dois Amores", price: 22.90, category: 'copo_felicidade', imageUrl: "https://i.imgur.com/mMQtXDB.png" },
  { id: 26, name: "Copo Encanto de Ninho e Morangos", price: 22.90, category: 'copo_felicidade', imageUrl: "https://i.imgur.com/EgFhhwL.png" },
  { id: 27, name: "Copo de Brownie com Ferreiro e Nutella", price: 26.90, category: 'copo_felicidade', imageUrl: "https://i.imgur.com/t6xeVDf.png" },
  { id: 20, name: "Brownie De Ninho e Nutella", price: 11.90, category: 'brownie', imageUrl: "https://i.imgur.com/vWdYZ8K.png" },
  { id: 21, name: "Brownie Recheado com Nutella e Morangos", price: 22.90, category: 'brownie', imageUrl: "https://i.imgur.com/P1pprjF.png" },
  { id: 22, name: "Brownie Ferreiro com Nutella", price: 11.90, category: 'brownie', imageUrl: "https://i.imgur.com/rmp3LtH.png" },
  { id: 23, name: "Brownie Duo com Oreo", price: 11.90, category: 'brownie', imageUrl: "https://i.imgur.com/8IbcWWj.png" },
  { id: ACAI_ID, name: "Copo de Açaí 250ml", price: ACAI_BASE_PRICE, category: 'acai', imageUrl: "https://i.imgur.com/OrErP8N.png" },
  { id: 6, name: "Empada de Camarão e Requeijão", price: 12.00, category: 'salgado', imageUrl: "https://i.imgur.com/rV18DkJ.png" }
];

const formatCurrency = (val) => `R$ ${Number(val || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
const getElapsedTime = (dateStr) => {
  if (!dateStr) return '0m';
  const diff = new Date() - new Date(dateStr);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

export default function Admin() {
  const [supabase, setSupabase] = useState(null);
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('doceeser_admin'));
  const [passwordInput, setPasswordInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [view, setView] = useState('kanban'); 
  const [autoSendWhatsapp, setAutoSendWhatsapp] = useState(false);
  const [stats, setStats] = useState({});
  const [now, setNow] = useState(new Date());
  const [productAvailability, setProductAvailability] = useState({});
  const [isStoreOpen, setIsStoreOpen] = useState(true); // Estado da loja

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. CARREGAR SUPABASE
  useEffect(() => {
    if (window.supabase && window.supabase.createClient) {
      setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        if (window.supabase) {
          setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const playSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) { console.warn('Erro audio', e); }
  };

  const formatWhatsappMessage = (order) => {
    const customer = order.customer || {};
    const fullAddress = `${customer.rua || ''}, ${customer.numero || ''} - ${customer.bairro || ''}`.trim();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const itemsList = Array.isArray(order.items)
      ? order.items.map(it => `• ${it.quantity || 1}x ${it.name}${it.toppings?.length ? ` (+${it.toppings.join(', ')})` : ''}`).join('\n')
      : '';
    return `*NOVO PEDIDO #${order.id.slice(0, 6).toUpperCase()}*\n\n` +
           `👤 *${customer.nome || 'Cliente'}*\n` +
           `📍 ${fullAddress}\n` +
           `🗺 Link: ${mapsLink}\n\n` +
           `📝 *Itens:*\n${itemsList}\n\n` +
           `💰 *Total: ${formatCurrency(order.total)}*`;
  };

  const sendWhatsapp = (order) => {
    const text = formatWhatsappMessage(order);
    window.open(`https://wa.me/${MOTOBOY_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Carrega disponibilidade de produtos e status da loja
  const fetchAvailability = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from(AVAILABILITY_TABLE).select('*');
      if (!error && data) {
        const map = {};
        let storeStatusFound = true; // Assume aberto se não achar
        
        data.forEach(item => { 
            if (item.id === STORE_STATUS_ID) {
                storeStatusFound = item.is_active;
            } else {
                map[item.id] = item.is_active; 
            }
        });
        setProductAvailability(map);
        setIsStoreOpen(storeStatusFound);
      }
    } catch (e) { console.log('Erro disp.', e); }
  };

  // Alternar produto
  const toggleProduct = async (productId, currentStatus) => {
    if (!supabase) return alert("Erro: Supabase não conectado.");
    const nextStatus = currentStatus === undefined ? false : !currentStatus;
    setProductAvailability(prev => ({ ...prev, [productId]: nextStatus }));
    try {
      await supabase.from(AVAILABILITY_TABLE).upsert({ id: productId, is_active: nextStatus });
    } catch (e) { console.error("Erro ao salvar status:", e); }
  };

  // Alternar Status da Loja
  const toggleStoreStatus = async () => {
    if (!supabase) return;
    const nextStatus = !isStoreOpen;
    setIsStoreOpen(nextStatus);
    try {
        await supabase.from(AVAILABILITY_TABLE).upsert({ id: STORE_STATUS_ID, is_active: nextStatus });
    } catch (e) { 
        console.error("Erro ao fechar/abrir loja:", e);
        setIsStoreOpen(!nextStatus); // reverte em caso de erro
    }
  };

  const clearAllOrders = async () => {
    if (!supabase) return;
    if (window.confirm("⚠️ ATENÇÃO: Isso apagará TODOS os pedidos do painel.\n\nDeseja continuar?")) {
       if (window.confirm("Tem certeza absoluta?")) {
          setLoading(true);
          try {
            await supabase.from(TABLE).delete().neq('status', 'user_account'); 
            setOrders([]);
          } catch (e) {}
          setLoading(false);
       }
    }
  };

  const fetchOrders = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from(TABLE).select('*').neq('status', 'user_account').order('createdAt', { ascending: false });
    if (!error) {
      setOrders(data || []);
      const todayOrders = data.filter(o => o.createdAt && o.createdAt.startsWith(new Date().toISOString().split('T')[0]));
      setStats({
        count: todayOrders.length,
        total: todayOrders.reduce((acc, curr) => acc + (curr.total || 0), 0)
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuth || !supabase) return;
    fetchOrders();
    fetchAvailability();
    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, payload => {
        if (payload.new && payload.new.status !== 'user_account') {
          if (soundEnabled) playSound();
          if (autoSendWhatsapp) sendWhatsapp(payload.new);
          fetchOrders();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, () => fetchOrders())
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch(e) {} };
  }, [isAuth, soundEnabled, autoSendWhatsapp, supabase]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('doceeser_admin', '1');
      setIsAuth(true);
    } else alert('Senha incorreta');
  };

  const updateStatus = async (id, status) => {
    if (!supabase) return;
    await supabase.from(TABLE).update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const columns = useMemo(() => {
    return {
      novos: orders.filter(o => o.status === 'novo'),
      preparando: orders.filter(o => o.status === 'preparando'),
      prontos: orders.filter(o => o.status === 'pronto'),
      em_rota: orders.filter(o => o.status === 'em_rota'),
      entregues: orders.filter(o => o.status === 'entregue'),
    };
  }, [orders]);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-amber-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><Cake className="w-8 h-8 text-amber-600" /></div>
            <h1 className="text-2xl font-bold text-gray-800">Doce É Ser</h1>
            <p className="text-gray-500 text-sm">Gestão de Pedidos</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" autoFocus className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:border-amber-500 focus:bg-white outline-none" placeholder="Senha" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition shadow-lg">Acessar Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-gray-800 overflow-hidden">
      <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-20 shadow-sm shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold mb-2 shadow-sm"><Cake className="w-5 h-5" /></div>
        <SidebarIcon icon={LayoutDashboard} active={view === 'kanban'} onClick={() => setView('kanban')} tooltip="Pedidos" />
        <SidebarIcon icon={ShoppingBag} active={view === 'menu'} onClick={() => setView('menu')} tooltip="Cardápio" />
        <SidebarIcon icon={TrendingUp} active={view === 'dashboard'} onClick={() => setView('dashboard')} tooltip="Desempenho" />
        
        <div className="mt-auto flex flex-col gap-3 pb-4">
            {/* BOTÃO ABRIR/FECHAR LOJA */}
            <button 
                onClick={toggleStoreStatus}
                className={`p-2 rounded-lg transition shadow-sm ${isStoreOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                title={isStoreOpen ? "Loja Aberta (Clique para fechar)" : "Loja Fechada (Clique para abrir)"}
            >
                {isStoreOpen ? <Unlock className="w-5 h-5"/> : <Lock className="w-5 h-5"/>}
            </button>

          <button onClick={clearAllOrders} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Zerar Sistema"><Trash2 className="w-5 h-5" /></button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-2 rounded-lg transition ${soundEnabled ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-gray-600'}`}>{soundEnabled ? <Bell className="w-5 h-5"/> : <BellOff className="w-5 h-5"/>}</button>
          <button onClick={() => { localStorage.removeItem('doceeser_admin'); setIsAuth(false); }} className="p-2 text-gray-400 hover:text-red-500 transition"><LogOut className="w-5 h-5" /></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#f3f4f6] relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{view === 'menu' ? 'Gerenciar Cardápio' : 'Gestor de Pedidos'}</h2>
            <div className={`flex items-center gap-2 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${isStoreOpen ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}></span> 
                {isStoreOpen ? 'Loja Aberta' : 'Loja Fechada'}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vendas Hoje</p><p className="text-base font-black text-gray-800">{formatCurrency(stats.total)}</p></div>
             <button onClick={() => setAutoSendWhatsapp(!autoSendWhatsapp)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${autoSendWhatsapp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}><MessageCircle className="w-3 h-3" /> Auto Zap: {autoSendWhatsapp ? 'ON' : 'OFF'}</button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          {view === 'kanban' && (
            <div className="h-full flex gap-3 min-w-[1200px]">
              <KanbanColumn title="Pendente" count={columns.novos.length} color="border-amber-500" bg="bg-white">
                {columns.novos.map(order => (<OrderCard key={order.id} order={order} type="novo" onAction={(id) => updateStatus(id, 'preparando')} onZap={sendWhatsapp} />))}
              </KanbanColumn>
              <KanbanColumn title="Em Preparo" count={columns.preparando.length} color="border-blue-500" bg="bg-white">
                {columns.preparando.map(order => (<OrderCard key={order.id} order={order} type="preparando" onAction={(id) => updateStatus(id, 'pronto')} onZap={sendWhatsapp} />))}
              </KanbanColumn>
              <KanbanColumn title="Pronto" count={columns.prontos.length} color="border-green-500" bg="bg-white">
                {columns.prontos.map(order => (<OrderCard key={order.id} order={order} type="pronto" onAction={(id) => updateStatus(id, 'em_rota')} onZap={sendWhatsapp} />))}
              </KanbanColumn>
              <KanbanColumn title="Em Rota" count={columns.em_rota.length} color="border-purple-500" bg="bg-white">
                {columns.em_rota.map(order => (<OrderCard key={order.id} order={order} type="em_rota" onAction={(id) => updateStatus(id, 'entregue')} onZap={sendWhatsapp} />))}
              </KanbanColumn>
              <KanbanColumn title="Entregue" count={columns.entregues.length} color="border-gray-400" bg="bg-gray-50">
                {columns.entregues.map(order => (<OrderCard key={order.id} order={order} type="entregue" onAction={() => {}} onZap={sendWhatsapp} isFinished={true} />))}
              </KanbanColumn>
            </div>
          )}

          {view === 'menu' && (
            <div className="h-full overflow-y-auto custom-scrollbar pr-2">
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
                 {PRODUCTS_LIST.map(product => {
                    const isAvailable = productAvailability[product.id] !== false;
                    return (
                      <div key={product.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col transition-all ${isAvailable ? 'border-gray-200' : 'border-red-200 opacity-75 grayscale'}`}>
                        <div className="h-32 bg-gray-100 relative"><img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name}/><div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isAvailable ? 'ATIVO' : 'INATIVO'}</div></div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                           <div>
                              <h3 className="font-bold text-gray-800 text-sm line-clamp-1" title={product.name}>{product.name}</h3>
                              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{product.category}</p>
                           </div>
                           <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                              <span className="font-bold text-amber-600 text-sm">{formatCurrency(product.price)}</span>
                              <button onClick={() => toggleProduct(product.id, isAvailable)} className={`p-1.5 rounded transition ${isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={isAvailable ? "Desativar" : "Ativar"}>{isAvailable ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                           </div>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}
          {view === 'dashboard' && <div className="h-full overflow-y-auto"><div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center"><TrendingUp className="w-10 h-10 mx-auto text-gray-300 mb-4"/><h2 className="text-xl font-bold text-gray-800">Dashboard</h2><p className="text-gray-500 text-sm">Em desenvolvimento.</p></div></div>}
        </div>
      </main>
    </div>
  );
}

const SidebarIcon = ({ icon: Icon, active, onClick, tooltip }) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm'}`}>
    <Icon className="w-5 h-5" />
    <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50 shadow-lg">{tooltip}</span>
  </button>
);

const KanbanColumn = ({ title, count, children, color, bg }) => (
  <div className={`flex-1 flex flex-col ${bg} rounded-lg h-full overflow-hidden border border-gray-200 shadow-sm min-w-[250px]`}>
    <div className={`p-3 border-b-2 border-gray-100 flex justify-between items-center ${color.replace('border-t-4', 'border-t-4')}`}>
      <h3 className="font-bold text-gray-700 uppercase text-[11px] tracking-wider">{title}</h3>
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">{count}</span>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#f3f4f6] custom-scrollbar">{children}</div>
  </div>
);

const OrderCard = ({ order, type, onAction, onZap, isFinished }) => {
  const isNew = type === 'novo';
  const getActionLabel = () => {
    switch(type) {
        case 'novo': return 'ACEITAR';
        case 'preparando': return 'PRONTO';
        case 'pronto': return 'SAIU';
        case 'em_rota': return 'ENTREGUE';
        default: return '';
    }
  };
  const getActionColor = () => {
    switch(type) {
        case 'novo': return 'bg-amber-600 hover:bg-amber-700';
        case 'preparando': return 'bg-blue-600 hover:bg-blue-700';
        case 'pronto': return 'bg-green-600 hover:bg-green-700';
        case 'em_rota': return 'bg-purple-600 hover:bg-purple-700';
        default: return 'bg-gray-400';
    }
  };
  
  return (
    <div className={`bg-white p-2.5 rounded border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col group ${isNew ? 'ring-1 ring-amber-400' : ''}`}>
      <div className="flex justify-between items-start mb-1.5 pb-1.5 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-1.5"><span className="font-bold text-sm text-gray-800">#{order.id.slice(0, 4).toUpperCase()}</span>{isNew && <span className="bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">NOVO</span>}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[100px]">{order.customer?.nome?.split(' ')[0] || 'Cliente'}</div>
        </div>
        <div className="text-right"><span className={`text-[10px] font-bold flex items-center justify-end gap-1 ${isNew ? 'text-amber-600' : 'text-gray-400'}`}><Clock className="w-3 h-3" /> {getElapsedTime(order.createdAt)}</span></div>
      </div>
      <div className="flex-1 mb-1.5">
         <ul className="space-y-0.5">
            {Array.isArray(order.items) ? order.items.map((it, i) => (
              <li key={i} className="text-[10px] text-gray-700 leading-tight border-b border-dashed border-gray-50 pb-0.5 last:border-0"><span className="font-bold mr-1">{it.quantity}x</span>{it.name}{it.toppings && it.toppings.length > 0 && <span className="text-[9px] text-gray-400 block pl-3">+ {it.toppings[0]}...</span>}</li>
            )) : <li className="text-gray-400 italic text-[10px]">Sem itens</li>}
         </ul>
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 border-t border-gray-50 pt-1.5 mb-2"><span>Total:</span><span>{formatCurrency(order.total)}</span></div>
      {!isFinished && (
        <div className="flex gap-1.5">
           <button onClick={() => onAction(order.id)} className={`flex-1 py-1 rounded text-[9px] font-bold text-white transition active:scale-[0.98] ${getActionColor()}`}>{getActionLabel()}</button>
           <button onClick={() => onZap(order)} className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600 transition" title="WhatsApp"><MessageCircle className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {isFinished && <div className="text-center text-[9px] text-gray-400 font-bold bg-gray-50 py-1 rounded">FINALIZADO</div>}
    </div>
  );
};
