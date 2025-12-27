// src/Admin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trash2, Clock, Check, Loader2, LayoutDashboard, 
  ShoppingBag, LogOut, Bell, BellOff, MessageCircle, 
  MapPin, Phone, User, DollarSign, TrendingUp, Calendar, 
  Menu, X, Search, ChevronRight, Zap 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';

// Chaves fornecidas pelo usuário
const supabaseUrl = 'https://elpinlotdogazhpdwlqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

/* --- CONFIGURAÇÕES --- */
const ADMIN_PASSWORD = '071224';
const TABLE = 'doceeser_pedidos';
const MOTOBOY_NUMBER = '5548991692018'; 

// Configuração visual dos status
const STATUS_CONFIG = {
  novo: { 
    label: 'Novo Pedido', 
    color: 'bg-blue-500 text-white shadow-blue-200', 
    border: 'border-blue-200 bg-blue-50',
    icon: Bell 
  },
  preparando: { 
    label: 'Em Preparo', 
    color: 'bg-amber-500 text-white shadow-amber-200', 
    border: 'border-amber-200 bg-amber-50',
    icon: Clock 
  },
  pronto: { 
    label: 'Pronto p/ Entrega', 
    color: 'bg-green-500 text-white shadow-green-200', 
    border: 'border-green-200 bg-green-50',
    icon: Check 
  },
  entregue: { 
    label: 'Entregue', 
    color: 'bg-gray-500 text-white shadow-gray-200', 
    border: 'border-gray-200 bg-gray-50',
    icon: User 
  }
};

/* --- UTILITÁRIOS --- */
const formatCurrency = (val) => `R$ ${Number(val || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function Admin() {
  const [supabase, setSupabase] = useState(null);
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('doceeser_admin'));
  const [passwordInput, setPasswordInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [view, setView] = useState('orders'); // 'orders' | 'dashboard'
  const [autoSendWhatsapp, setAutoSendWhatsapp] = useState(false);
  const [stats, setStats] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. CARREGAR SUPABASE VIA SCRIPT TAG
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

  // Permissão de notificação
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Tocar som
  const playSound = () => {
    try {
      const audio = new Audio('/ding.mp3'); 
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro audio', e);
    }
  };

  // WhatsApp helper CORRIGIDO
  const formatWhatsappMessage = (order) => {
    const customer = order.customer || {};
    const fullAddress = `${customer.rua || ''}, ${customer.numero || ''} - ${customer.bairro || ''}`.trim();
    // Link do mapa apenas encode o endereço, não o link todo
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    
    const itemsList = Array.isArray(order.items)
      ? order.items.map(it => `• ${it.quantity || 1}x ${it.name}${it.toppings?.length ? ` (+${it.toppings.join(', ')})` : ''}`).join('\n')
      : '';

    // Usando \n para quebra de linha em vez de %0A para ser codificado corretamente depois
    return `🚚 *NOVO PEDIDO #${order.id.slice(0, 8).toUpperCase()}*\n\n` +
           `👤 *Cliente:* ${customer.nome || '-'}\n` +
           `📞 *Tel:* ${customer.telefone || '-'}\n` +
           `📍 *Endereço:* ${fullAddress}\n` +
           `🗺 *Mapa:* ${mapsLink}\n\n` +
           `🛒 *Itens:*\n${itemsList}\n\n` +
           `💰 *Total:* ${formatCurrency(order.total)}`;
  };

  const sendWhatsapp = (order) => {
    const text = formatWhatsappMessage(order);
    // Codifica TUDO (incluindo o # e quebras de linha) para a URL
    window.open(`https://wa.me/${MOTOBOY_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Estatísticas
  const computeStats = (ordersArr) => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const list = ordersArr || [];
      const todayOrders = list.filter(o => o.createdAt && o.createdAt >= startOfToday);
      
      const totalToday = todayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
      const countToday = todayOrders.length;
      const ticketAvg = countToday ? totalToday / countToday : 0;

      // Por Status
      const statusMap = {};
      list.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
      const statusSeries = Object.keys(statusMap).map(k => ({ 
        status: k, 
        count: statusMap[k], 
        name: STATUS_CONFIG[k]?.label || k,
        fill: k === 'novo' ? '#3b82f6' : k === 'preparando' ? '#f59e0b' : k === 'pronto' ? '#22c55e' : '#9ca3af'
      }));

      // Vendas 7 dias
      const days = [];
      for (let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = d.toISOString().slice(0,10);
        const displayDate = `${d.getDate()}/${d.getMonth()+1}`;
        days.push({ key, total: 0, name: displayDate });
      }
      
      list.forEach(o => {
        if (!o.createdAt) return;
        const key = o.createdAt.slice(0,10);
        const day = days.find(d => d.key === key);
        if (day) day.total += (Number(o.total) || 0);
      });

      setStats({ totalToday, countToday, ticketAvg, statusSeries, salesSeries: days });
    } catch (e) { console.error(e); }
  };

  // Fetch e Realtime
  const fetchOrders = async () => {
    if (!supabase) return;
    setLoading(true);
    // Filtra para não mostrar contas de usuário
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .neq('status', 'user_account') 
      .order('createdAt', { ascending: false });
      
    if (!error) {
      setOrders(data || []);
      computeStats(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuth || !supabase) return;
    
    fetchOrders();

    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, payload => {
        const newOrder = payload.new;
        if (newOrder && newOrder.status !== 'user_account') {
          if (soundEnabled) playSound();
          setShowNewOrderBanner(true);
          setTimeout(() => setShowNewOrderBanner(false), 8000);
          if (Notification.permission === 'granted') {
            new Notification('Novo Pedido!', { body: `Valor: ${formatCurrency(newOrder.total)}` });
          }
          if (autoSendWhatsapp) sendWhatsapp(newOrder);
          fetchOrders();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, () => fetchOrders())
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch(e) {}
    };
  }, [isAuth, soundEnabled, autoSendWhatsapp, supabase]);

  // Ações
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
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    computeStats(updated);
  };

  // Filtragem
  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  // --- LOADING INICIAL ---
  if (!supabase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
        <p className="text-amber-800 font-bold text-lg">Carregando Sistema Doce...</p>
      </div>
    );
  }

  // --- TELA DE LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 p-4">
        <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white/20">
          <div className="text-center mb-8">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <User className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Doce É Ser</h1>
            <p className="text-gray-500 font-medium mt-2">Acesso Administrativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              autoFocus
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 outline-none transition text-lg bg-gray-50"
              placeholder="Senha de acesso"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
            />
            <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-amber-600/30 active:scale-[0.98] text-lg">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-100 shadow-xl z-20">
        <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-amber-600 to-orange-600">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl leading-none">Doce É Ser</h1>
              <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Admin Pro</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Menu Principal</p>
          <SidebarItem icon={LayoutDashboard} label="Visão Geral" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem icon={ShoppingBag} label="Pedidos" active={view === 'orders'} onClick={() => setView('orders')} badge={orders.filter(o => o.status === 'novo').length} />
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Ações Rápidas</p>
          <div className="space-y-3">
            <ToggleButton 
              active={soundEnabled} 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              iconOn={Bell} iconOff={BellOff} 
              label="Alerta Sonoro" 
            />
            <ToggleButton 
              active={autoSendWhatsapp} 
              onClick={() => setAutoSendWhatsapp(!autoSendWhatsapp)} 
              iconOn={MessageCircle} iconOff={MessageCircle} 
              label="Auto WhatsApp" 
            />
            <button onClick={() => { localStorage.removeItem('doceeser_admin'); setIsAuth(false); }} className="flex items-center gap-3 text-red-600 hover:bg-red-50 p-3 rounded-xl w-full transition font-bold text-sm">
              <LogOut className="w-5 h-5" /> Sair do Painel
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-amber-600 text-white z-30 shadow-lg px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-lg flex items-center gap-2"><LayoutDashboard className="w-5 h-5"/> Admin Doce</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/20 rounded-lg">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-20 pt-20 px-6 md:hidden flex flex-col gap-4 animate-fadeIn">
          <button onClick={() => { setView('orders'); setMobileMenuOpen(false); }} className="p-4 bg-amber-50 rounded-xl text-amber-800 font-bold text-left flex items-center gap-3"><ShoppingBag/> Pedidos</button>
          <button onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} className="p-4 bg-gray-50 rounded-xl text-gray-700 font-bold text-left flex items-center gap-3"><LayoutDashboard/> Dashboard</button>
          <div className="h-px bg-gray-100 my-2"></div>
          <ToggleButton active={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)} iconOn={Bell} iconOff={BellOff} label="Alerta Sonoro" />
          <ToggleButton active={autoSendWhatsapp} onClick={() => setAutoSendWhatsapp(!autoSendWhatsapp)} iconOn={MessageCircle} iconOff={MessageCircle} label="Auto WhatsApp" />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-gray-50 relative pt-16 md:pt-0">
        
        {/* Banner de Novo Pedido */}
        {showNewOrderBanner && (
          <div 
            onClick={() => setView('orders')}
            className="sticky top-4 mx-4 md:mx-8 z-40 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 flex justify-between items-center animate-bounce-slow cursor-pointer border border-blue-400/50"
          >
            <div className="flex items-center gap-3 font-bold text-lg"><Bell className="w-6 h-6 animate-swing" /> Novo pedido recebido!</div>
            <button onClick={(e) => {e.stopPropagation(); setShowNewOrderBanner(false)}} className="bg-white/20 p-1 rounded-full hover:bg-white/30"><X className="w-5 h-5" /></button>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">Visão Geral</h2>
                <p className="text-gray-500">Métricas de hoje e desempenho da loja.</p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Vendas Hoje" 
                  value={formatCurrency(stats.totalToday)} 
                  icon={DollarSign} 
                  gradient="from-green-500 to-emerald-600" 
                  shadow="shadow-green-500/20"
                />
                <StatCard 
                  title="Pedidos Hoje" 
                  value={stats.countToday || 0} 
                  icon={ShoppingBag} 
                  gradient="from-blue-500 to-indigo-600" 
                  shadow="shadow-blue-500/20"
                />
                <StatCard 
                  title="Ticket Médio" 
                  value={formatCurrency(stats.ticketAvg)} 
                  icon={TrendingUp} 
                  gradient="from-purple-500 to-fuchsia-600" 
                  shadow="shadow-purple-500/20"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Evolução de Vendas (7 dias)">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.salesSeries}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val)=>`R$${val}`} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Area type="monotone" dataKey="total" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Pedidos por Status">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statusSeries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px'}} />
                      <Bar dataKey="count" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}

          {/* VIEW: ORDERS */}
          {view === 'orders' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 mb-2">Gerenciamento</h2>
                  <div className="flex gap-2 text-sm font-medium bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
                    {['all', 'novo', 'preparando', 'pronto', 'entregue'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilter(st)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          filter === st 
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' 
                          : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {st === 'all' ? 'Todos' : STATUS_CONFIG[st]?.label || st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredOrders.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">Nenhum pedido encontrado nesta categoria.</p>
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onUpdateStatus={updateStatus} 
                        onWhatsApp={sendWhatsapp} 
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* --- SUBCOMPONENTES --- */

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 group mb-1 ${
      active 
      ? 'bg-amber-50 text-amber-800 font-bold shadow-sm border border-amber-100' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">{badge}</span>
    )}
  </button>
);

const ToggleButton = ({ active, onClick, iconOn: IconOn, iconOff: IconOff, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition text-sm font-medium ${
      active ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {active ? <IconOn className="w-4 h-4" /> : <IconOff className="w-4 h-4" />}
    {label}: <span className="font-bold">{active ? 'ON' : 'OFF'}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, gradient, shadow }) => (
  <div className={`relative overflow-hidden bg-white p-6 rounded-3xl shadow-lg border border-gray-100 ${shadow} group`}>
    <div className={`absolute top-0 right-0 p-4 bg-gradient-to-br ${gradient} text-white rounded-bl-3xl shadow-md`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="mt-4">
      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80">
    <h3 className="text-lg font-bold text-gray-700 mb-6">{title}</h3>
    <div className="h-60 w-full">
      {children}
    </div>
  </div>
);

const OrderCard = ({ order, onUpdateStatus, onWhatsApp }) => {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.novo;
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 ${order.status === 'novo' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
      
      {/* Header do Card */}
      <div className={`p-4 border-b flex justify-between items-center ${statusInfo.border}`}>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" /> {statusInfo.label}
          </span>
        </div>
        <div className="text-xs font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-md">
          #{order.id.slice(0,6).toUpperCase()}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Info Cliente */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gray-100 p-1.5 rounded-full"><User className="w-4 h-4 text-gray-600" /></div>
            <span className="font-bold text-gray-800 text-base">{order.customer?.nome || 'Cliente não id.'}</span>
          </div>
          <div className="pl-9 text-xs text-gray-500 space-y-1.5">
            {order.customer?.telefone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {order.customer.telefone}</div>}
            <div className="flex items-start gap-1.5 leading-tight">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0"/> 
              <span>
                {order.customer?.rua ? `${order.customer.rua}, ${order.customer.numero}` : 'Retirada/Sem endereço'}
                {order.customer?.bairro && <span className="block text-gray-400">{order.customer.bairro}</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Lista Itens */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm">
          <ul className="space-y-2">
            {Array.isArray(order.items) ? order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-start text-gray-700 border-b border-dashed border-gray-200 last:border-0 pb-2 last:pb-0">
                <div className="flex gap-2">
                  <span className="font-bold bg-white border px-1.5 rounded text-xs h-fit mt-0.5">{item.quantity}x</span>
                  <div>
                    <span className="block font-medium leading-tight">{item.name}</span>
                    {item.toppings && item.toppings.length > 0 && (
                      <span className="text-xs text-gray-500 block leading-tight mt-0.5">+ {item.toppings.join(', ')}</span>
                    )}
                  </div>
                </div>
              </li>
            )) : <li className="text-gray-400 italic text-center py-2">Sem itens</li>}
          </ul>
        </div>
      </div>

      {/* Footer / Ações */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-1.5 text-xs text-gray-400">
             <Clock className="w-3 h-3" /> {formatDate(order.createdAt)}
           </div>
           <span className="text-lg font-black text-gray-800">{formatCurrency(order.total)}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {order.status === 'novo' && (
            <button onClick={() => onUpdateStatus(order.id, 'preparando')} title="Aceitar" className="col-span-3 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold shadow-lg shadow-amber-500/30 transition active:scale-95 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Aceitar Pedido
            </button>
          )}
          {order.status === 'preparando' && (
            <button onClick={() => onUpdateStatus(order.id, 'pronto')} title="Pronto" className="col-span-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold shadow-lg shadow-green-500/30 transition active:scale-95 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Marcar Pronto
            </button>
          )}
          {order.status === 'pronto' && (
            <button onClick={() => onUpdateStatus(order.id, 'entregue')} title="Entregue" className="col-span-3 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-bold shadow-lg shadow-gray-700/30 transition active:scale-95 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Finalizar
            </button>
          )}
          {order.status === 'entregue' && (
             <div className="col-span-3 bg-gray-100 text-gray-400 py-2 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-2 cursor-not-allowed">
               <Check className="w-4 h-4" /> Concluído
             </div>
          )}
          
          <button 
            onClick={() => onWhatsApp(order)} 
            className="bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 py-2 rounded-lg flex items-center justify-center transition active:scale-95"
            title="Chamar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
