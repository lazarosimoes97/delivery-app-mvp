import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Trash2, Plus, LayoutGrid, ShoppingBag,
    TrendingUp, Store, ExternalLink, Image as ImageIcon,
    AlertCircle, CheckCircle2, Package, Camera, Pencil, X
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

    // Edit states
    const [editProductForm, setEditProductForm] = useState({
        name: '', description: '', price: '', category: '', imageUrl: ''
    });

    const [settingsForm, setSettingsForm] = useState({
        name: '', description: '', category: '', type: '',
        street: '', number: '', neighborhood: '', city: '', state: '', zipCode: ''
    });

    // Quick Stats (Mocked for now, but ready for API)
    const [stats] = useState({
        todayOrders: 12,
        todaySales: 450.80,
        pendingOrders: 3
    });

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: ''
    });

    useEffect(() => {
        const fetchMyRestaurant = async () => {
            try {
                const res = await axios.get('/restaurants');
                const myRest = res.data.find(r => r.ownerId === user?.id);

                if (myRest) {
                    const detailRes = await axios.get(`/restaurants/${myRest.id}`);
                    setRestaurant(detailRes.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyRestaurant();
    }, [user]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingImage(true);
        try {
            const res = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewProduct(prev => ({ ...prev, imageUrl: res.data.url }));
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Falha ao subir imagem. Verifique se as chaves do Cloudinary estão configuradas no .env');
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
            console.error(error);
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
            setRestaurant(prev => ({ ...prev, ...res.data }));
            setIsEditingSettings(false);
        } catch (error) {
            alert('Falha ao atualizar configurações');
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

            // Update on backend
            await axios.put(`/restaurants/${restaurant.id}`, {
                ...restaurant,
                imageUrl: newImageUrl
            });

            // Update local state
            setRestaurant(prev => ({ ...prev, imageUrl: newImageUrl }));
        } catch (error) {
            console.error('Erro ao atualizar imagem do restaurante:', error);
            alert('Falha ao atualizar foto do restaurante.');
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

    // Group products by category
    const groupedProducts = restaurant.products.reduce((acc, product) => {
        const cat = product.category || 'Geral';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    return (
        <div className="bg-gray-50 min-h-screen -mt-8 -mx-4 pb-20">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                                    {restaurant.imageUrl ? (
                                        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600">
                                            <Store className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <input type="file" className="hidden" onChange={handleUpdateRestaurantImage} accept="image/*" />
                                    <Camera className="w-5 h-5 text-white" />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                                <p className="text-gray-500 flex items-center gap-1 text-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Loja aberta para pedidos
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/restaurant/${restaurant.id}`}
                                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver Cardápio
                            </Link>
                            <button
                                onClick={handleOpenSettings}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100"
                            >
                                Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Pedidos Hoje</span>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
                        <div className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +15% vs ontem
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Vendas Hoje</span>
                            <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">R$ {stats.todaySales.toFixed(2)}</div>
                        <div className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pagamentos ok
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-amber-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">Pendentes</span>
                            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
                        <div className="text-xs text-amber-600 mt-1 font-medium">Aguardando preparo</div>
                    </div>
                </div>

                {/* Menu Management */}
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
                                            placeholder="0,00"
                                            type="number"
                                            step="0.01"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
                                            required
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
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3" /> Foto do Produto (Upload)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer bg-white border-2 border-dashed border-gray-200 hover:border-red-400 transition-colors p-4 rounded-2xl flex-1 flex flex-col items-center justify-center gap-2">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                />
                                                {uploadingImage ? (
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        Subindo...
                                                    </div>
                                                ) : newProduct.imageUrl ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-bold">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Imagem pronta!
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                                        <Plus className="w-6 h-6" />
                                                        <span className="text-sm">Clique para subir imagem</span>
                                                    </div>
                                                )}
                                            </label>
                                            {newProduct.imageUrl && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:text-gray-700">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadingImage}
                                        className={`bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Salvar Produto
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="divide-y divide-gray-50">
                        {Object.keys(groupedProducts).length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-400">Nenhum produto cadastrado ainda.</p>
                            </div>
                        ) : (
                            Object.keys(groupedProducts).map(category => (
                                <div key={category} className="p-6">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 bg-gray-50 inline-block rounded py-1">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groupedProducts[category].map(product => (
                                            <div key={product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-red-100 hover:bg-red-50/10 transition group">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 truncate">{product.name}</h4>
                                                    <p className="text-gray-500 text-sm truncate">{product.description || 'Sem descrição'}</p>
                                                    <div className="mt-1 font-bold text-red-600">R$ {product.price.toFixed(2)}</div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Editar Produto</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={editProductForm.name}
                                        onChange={e => setEditProductForm({ ...editProductForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 text-sm text-gray-500 flex items-center gap-2 mb-2">
                                    <Camera className="w-4 h-4" /> Outros campos podem ser editados no restaurante.
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço (R$)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={editProductForm.price}
                                        onChange={e => setEditProductForm({ ...editProductForm, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={editProductForm.category}
                                        onChange={e => setEditProductForm({ ...editProductForm, category: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descrição</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={editProductForm.description}
                                        onChange={e => setEditProductForm({ ...editProductForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2.5 font-bold text-gray-500">Cancelar</button>
                                <button type="submit" className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-red-100">Atualizar Produto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isEditingSettings && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Configurações da Loja</h3>
                            <button onClick={() => setIsEditingSettings(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSettings} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome do Restaurante</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.name}
                                        onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descrição</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.description}
                                        onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.category}
                                        onChange={e => setSettingsForm({ ...settingsForm, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tipo</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.type}
                                        onChange={e => setSettingsForm({ ...settingsForm, type: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="font-bold text-gray-400 text-xs uppercase mb-2 border-b pb-1">Endereço</h4>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rua</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.street}
                                        onChange={e => setSettingsForm({ ...settingsForm, street: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Número</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.number}
                                        onChange={e => setSettingsForm({ ...settingsForm, number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bairro</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.neighborhood}
                                        onChange={e => setSettingsForm({ ...settingsForm, neighborhood: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cidade</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.city}
                                        onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estado (UF)</label>
                                    <input
                                        maxLength="2"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.state}
                                        onChange={e => setSettingsForm({ ...settingsForm, state: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CEP</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={settingsForm.zipCode}
                                        onChange={e => setSettingsForm({ ...settingsForm, zipCode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
                                <button type="button" onClick={() => setIsEditingSettings(false)} className="px-6 py-2.5 font-bold text-gray-500">Cancelar</button>
                                <button type="submit" className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-red-100">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantAdmin;

