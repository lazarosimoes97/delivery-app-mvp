import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Trash2, Plus, LayoutGrid, ShoppingBag,
    TrendingUp, Store, ExternalLink, Image as ImageIcon,
    AlertCircle, CheckCircle2, Package, Camera, Pencil, X,
    Settings, Clock, Bike, Check, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantAdmin = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

    // States for data
    const [stats, setStats] = useState({
        todayOrders: 0,
        todaySales: 0,
        pendingOrders: 0
    });
    const [orders, setOrders] = useState([]);

    // Form states
    const [editProductForm, setEditProductForm] = useState({
        name: '', description: '', price: '', category: '', imageUrl: ''
    });

    const [settingsForm, setSettingsForm] = useState({
        name: '', description: '', category: '', type: '',
        street: '', number: '', neighborhood: '', city: '', state: '', zipCode: ''
    });

    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', category: '', imageUrl: ''
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Get My Restaurant
                const res = await axios.get('/restaurants');
                const myRest = res.data.find(r => r.ownerId === user?.id);

                if (myRest) {
                    const detailRes = await axios.get(`/restaurants/${myRest.id}`);
                    setRestaurant(detailRes.data);

                    // 2. Get Orders
                    try {
                        const ordersRes = await axios.get(`/orders/restaurant/${myRest.id}`);
                        const fetchedOrders = ordersRes.data;
                        setOrders(fetchedOrders);

                        // 3. Calculate Stats
                        const today = new Date().toLocaleDateString();
                        const todayOrders = fetchedOrders.filter(o => new Date(o.createdAt).toLocaleDateString() === today);
                        const pending = fetchedOrders.filter(o => ['PENDING', 'PREPARING'].includes(o.status));
                        const sales = todayOrders.reduce((sum, o) => sum + (o.paymentStatus === 'APPROVED' ? o.total : 0), 0);

                        setStats({
                            todayOrders: todayOrders.length,
                            todaySales: sales,
                            pendingOrders: pending.length
                        });
                    } catch (err) {
                        console.error('Error fetching orders:', err);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // 30s polling
        return () => clearInterval(interval);
    }, [user]);

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            // Re-fetch stats or calc locally
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            const pendingCount = updatedOrders.filter(o => ['PENDING', 'PREPARING'].includes(o.status)).length;
            setStats(prev => ({ ...prev, pendingOrders: pendingCount }));
        } catch (error) {
            console.error(error);
            alert('Falha ao atualizar status');
        }
    };

    const handleImageUpload = async (e, mode = 'new') => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingImage(true);
        try {
            const res = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (mode === 'new') {
                setNewProduct(prev => ({ ...prev, imageUrl: res.data.url }));
            } else {
                setEditProductForm(prev => ({ ...prev, imageUrl: res.data.url }));
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Falha ao subir imagem. Verifique as chaves do Cloudinary.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                restaurantId: restaurant.id,
                category: newProduct.category || 'Geral'
            };

            const res = await axios.post('/restaurants/products', productData);
            setRestaurant(prev => ({
                ...prev,
                products: [...prev.products, res.data]
            }));
            setIsCreating(false);
            setNewProduct({ name: '', description: '', price: '', category: '', imageUrl: '' });
        } catch (error) {
            alert('Falha ao criar produto');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            await axios.delete(`/restaurants/products/${id}`);
            setRestaurant(prev => ({
                ...prev,
                products: prev.products.filter(p => p.id !== id)
            }));
        } catch (error) {
            alert('Falha ao excluir produto');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setEditProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category || '',
            imageUrl: product.imageUrl || ''
        });
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/restaurants/products/${editingProduct.id}`, {
                ...editProductForm,
                price: parseFloat(editProductForm.price)
            });
            setRestaurant(prev => ({
                ...prev,
                products: prev.products.map(p => p.id === editingProduct.id ? res.data : p)
            }));
            setEditingProduct(null);
        } catch (error) {
            alert('Falha ao atualizar produto');
        }
    };

    const handleOpenSettings = () => {
        setSettingsForm({
            name: restaurant.name,
            description: restaurant.description || '',
            category: restaurant.category || '',
            type: restaurant.type || '',
            street: restaurant.street || '',
            number: restaurant.number || '',
            neighborhood: restaurant.neighborhood || '',
            city: restaurant.city || '',
            state: restaurant.state || '',
            zipCode: restaurant.zipCode || ''
        });
        setIsEditingSettings(true);
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/restaurants/${restaurant.id}`, settingsForm);
            setRestaurant(res.data);
            setIsEditingSettings(false);
        } catch (error) {
            alert('Falha ao atualizar configurações');
        }
    };

    const handleConnectMP = async () => {
        try {
            const res = await axios.get(`/payments/oauth/${restaurant.id}`);
            window.location.href = res.data.url;
        } catch (error) {
            alert('Erro ao iniciar conexão com Mercado Pago. Verifique as chaves no .env');
        }
    };

    const handleUpdateRestaurantImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingImage(true);
        try {
            const res = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newImageUrl = res.data.url;
            await axios.put(`/restaurants/${restaurant.id}`, { imageUrl: newImageUrl });
            setRestaurant(prev => ({ ...prev, imageUrl: newImageUrl }));
        } catch (error) {
            console.error('Erro ao atualizar imagem:', error);
            alert('Falha ao atualizar foto.');
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    if (!restaurant) return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configure sua Loja</h2>
            <p className="text-gray-600 mb-8">Parece que você ainda não configurou os detalhes do seu restaurante.</p>
            <Link to="/register" className="inline-block bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200">
                Começar agora
            </Link>
        </div>
    );

    const groupedProducts = restaurant.products.reduce((acc, product) => {
        const cat = product.category || 'Geral';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    return (
        <div className="bg-gray-50 min-h-screen -mt-8 -mx-4 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative group/img">
                                {restaurant.imageUrl ? (
                                    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-400">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity">
                                    <input type="file" className="hidden" onChange={handleUpdateRestaurantImage} accept="image/*" />
                                    <Camera className="w-5 h-5 text-white" />
                                </label>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">{restaurant.name}</h1>
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{restaurant.category}</span>
                                </div>
                                <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mb-4">{restaurant.description || 'Sem descrição definida.'}</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={handleOpenSettings} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200"><Settings className="w-4 h-4" /> Configurações</button>
                                    {restaurant.mpUserId ? (
                                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-green-100"><CheckCircle2 className="w-4 h-4" /> Mercado Pago Conectado</div>
                                    ) : (
                                        <button onClick={handleConnectMP} className="flex items-center gap-2 bg-[#009EE3] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0089c7] transition shadow-lg shadow-blue-100"><Store className="w-4 h-4" /> Conectar Mercado Pago</button>
                                    )}
                                    <Link to={`/restaurant/${restaurant.id}`} className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 border border-gray-200 transition"><ExternalLink className="w-4 h-4" /> Ver Loja Pública</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Pedidos Hoje</span>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><ShoppingBag className="w-5 h-5" /></div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
                        <div className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Atualizado</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Vendas Hoje</span>
                            <div className="bg-green-50 p-2 rounded-lg text-green-600"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">R$ {stats.todaySales.toFixed(2)}</div>
                        <div className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pagamentos ok</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-amber-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Pendentes</span>
                            <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><AlertCircle className="w-5 h-5" /></div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
                        <div className="text-xs text-amber-600 mt-1 font-medium">Aguardando preparo</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-sm mx-auto sm:mx-0">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Produtos
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Pedidos
                        {stats.pendingOrders > 0 && <span className="ml-1 bg-white text-red-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-bounce">{stats.pendingOrders}</span>}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'products' ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-6 h-6 text-gray-400" />
                                <h2 className="text-xl font-bold text-gray-800">Cardápio Categorizado</h2>
                            </div>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 flex items-center justify-center font-bold transition shadow-lg shadow-green-100"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Novo Produto
                            </button>
                        </div>

                        {isCreating && (
                            <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top duration-300">
                                <form onSubmit={handleCreateProduct}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome do Produto</label>
                                            <input
                                                placeholder="Ex: X-Salada Especial"
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                                required
                                                value={newProduct.name}
                                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço (R$)</label>
                                            <input
                                                placeholder="0,00" type="number" step="0.01" required
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
                                            <input
                                                placeholder="Ex: Hambúrgueres"
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                                value={newProduct.category}
                                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descrição</label>
                                            <input
                                                placeholder="Ingredientes e detalhes..."
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                                value={newProduct.description}
                                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Foto do Produto</label>
                                            <div className="flex items-center gap-4">
                                                <label className="cursor-pointer bg-white border-2 border-dashed border-gray-200 hover:border-red-400 transition p-4 rounded-2xl flex-1 flex flex-col items-center justify-center gap-2">
                                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                                    {uploadingImage ? <div className="animate-spin h-4 w-4 border-b-2 border-red-600"></div> : <span>Clique para subir foto</span>}
                                                </label>
                                                {newProduct.imageUrl && <img src={newProduct.imageUrl} className="w-20 h-20 rounded-xl object-cover" alt="Preview" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 text-gray-500 font-bold">Cancelar</button>
                                        <button type="submit" disabled={uploadingImage} className="bg-red-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-red-100">Salvar</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="divide-y divide-gray-50">
                            {Object.keys(groupedProducts).length === 0 ? (
                                <div className="p-20 text-center"><Package className="w-12 h-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400">Cardápio vazio.</p></div>
                            ) : (
                                Object.keys(groupedProducts).map(category => (
                                    <div key={category} className="p-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 inline-block bg-gray-50 px-2 py-1 rounded">{category}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedProducts[category].map(product => (
                                                <div key={product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 group hover:border-red-100 transition">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                                                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} /> : <ImageIcon className="w-full h-full p-4 text-gray-200" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-800 truncate">{product.name}</h4>
                                                        <div className="font-black text-red-600">R$ {product.price.toFixed(2)}</div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                        <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {orders.length === 0 ? (
                            <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-gray-100">
                                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400">Nenhum pedido recebido.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Pedido ID</div>
                                            <div className="font-mono text-xs text-gray-800">#{order.id.slice(0, 8)}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-600' :
                                                order.status === 'DELIVERING' ? 'bg-purple-100 text-purple-600' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>{order.status}</span>
                                    </div>
                                    <div className="p-5 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-red-50 p-2 rounded-xl text-red-600"><Package className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">{order.user?.name || 'Cliente'}</div>
                                                <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-2xl">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-600"><span className="font-bold text-gray-800">{item.quantity}x</span> {item.product.name}</span>
                                                    <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center">
                                                <span className="font-bold text-gray-800">Total</span>
                                                <span className="font-black text-red-600">R$ {order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {order.status === 'PENDING' && <button onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')} className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"><Clock className="w-4 h-4" /> Preparar</button>}
                                            {order.status === 'PREPARING' && <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERING')} className="col-span-2 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition active:scale-95 flex items-center justify-center gap-2"><Bike className="w-4 h-4" /> Enviar</button>}
                                            {order.status === 'DELIVERING' && <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')} className="col-span-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Entregue</button>}
                                            {['PENDING', 'PREPARING'].includes(order.status) && <button onClick={() => handleUpdateOrderStatus(order.id, 'CANCELED')} className="col-span-2 border border-gray-200 text-gray-400 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Cancelar</button>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Editar Produto</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-red-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nome</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={editProductForm.name} onChange={e => setEditProductForm({ ...editProductForm, name: e.target.value })} required /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Preço</label><input type="number" step="0.01" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={editProductForm.price} onChange={e => setEditProductForm({ ...editProductForm, price: e.target.value })} required /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Categoria</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={editProductForm.category} onChange={e => setEditProductForm({ ...editProductForm, category: e.target.value })} /></div>
                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descrição</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={editProductForm.description} onChange={e => setEditProductForm({ ...editProductForm, description: e.target.value })} /></div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3" /> Foto do Produto
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 hover:border-red-400 transition p-4 rounded-2xl flex-1 flex flex-col items-center justify-center gap-2">
                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} accept="image/*" />
                                            {uploadingImage ? (
                                                <div className="animate-spin h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                                    <Plus className="w-5 h-5" />
                                                    <span className="text-xs font-bold">Trocar Foto</span>
                                                </div>
                                            )}
                                        </label>
                                        {editProductForm.imageUrl && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                                                <img src={editProductForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 font-bold text-gray-500">Cancelar</button><button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-red-100">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isEditingSettings && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Loja</h3>
                            <button onClick={() => setIsEditingSettings(false)} className="text-gray-400 hover:text-red-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleUpdateSettings} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nome</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} required /></div>
                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Descrição</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={settingsForm.description} onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Categoria</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={settingsForm.category} onChange={e => setSettingsForm({ ...settingsForm, category: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Tipo</label><input className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={settingsForm.type} onChange={e => setSettingsForm({ ...settingsForm, type: e.target.value })} /></div>
                                <div className="md:col-span-2 mt-4 border-b text-gray-400 font-bold text-[10px] uppercase">Endereço</div>
                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase block">Rua</label><input className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.street} onChange={e => setSettingsForm({ ...settingsForm, street: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block">Número</label><input className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.number} onChange={e => setSettingsForm({ ...settingsForm, number: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block">Bairro</label><input className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.neighborhood} onChange={e => setSettingsForm({ ...settingsForm, neighborhood: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block">Cidade</label><input className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.city} onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block">Estado</label><input maxLength="2" className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.state} onChange={e => setSettingsForm({ ...settingsForm, state: e.target.value.toUpperCase() })} /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block">CEP</label>         <input className="w-full p-2 bg-gray-50 border rounded-xl" value={settingsForm.zipCode} onChange={e => setSettingsForm({ ...settingsForm, zipCode: e.target.value })} /></div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 sticky bottom-0 bg-white pt-4"><button type="button" onClick={() => setIsEditingSettings(false)} className="px-6 py-2 font-bold text-gray-500">Voltar</button><button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-red-100">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantAdmin;
