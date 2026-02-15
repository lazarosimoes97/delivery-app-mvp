import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus } from 'lucide-react';

const RestaurantAdmin = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', imageUrl: '' });

    // Fetch user's restaurant - Find the one where ownerId matches
    useEffect(() => {
        const fetchMyRestaurant = async () => {
            try {
                // In a real app we'd have a specific endpoint /restaurants/mine
                // For MVP we can filter list or assume 1 restaurant per owner locally
                // Better: update backend to support this. But let's work with what we have.
                // We'll search for a restaurant owned by this user.
                const res = await axios.get('/restaurants');
                const myRest = res.data.find(r => r.ownerId === user?.id);

                if (myRest) {
                    // Fetch full details including products
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

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/products', {
                ...newProduct,
                restaurantId: restaurant.id
            });
            setRestaurant(prev => ({
                ...prev,
                products: [...prev.products, res.data]
            }));
            setIsCreating(false);
            setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
        } catch (error) {
            alert('Falha ao criar produto');
            console.error(error);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await axios.delete(`/products/${id}`);
            setRestaurant(prev => ({
                ...prev,
                products: prev.products.filter(p => p.id !== id)
            }));
        } catch (error) {
            alert('Falha ao excluir produto');
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (!restaurant) return (
        <div className="text-center py-10">
            <h2 className="text-xl">Você ainda não tem um restaurante.</h2>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Criar Restaurante</button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Gerenciar Restaurante: {restaurant.name}</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Produtos</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreateProduct} className="mb-6 p-4 bg-gray-50 rounded border">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input placeholder="Nome" className="p-2 border rounded" required
                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            <input placeholder="Preço" type="number" step="0.01" className="p-2 border rounded" required
                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                            <input placeholder="Descrição" className="p-2 border rounded col-span-2"
                                value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                            <input placeholder="URL da Imagem" className="p-2 border rounded col-span-2"
                                value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Salvar</button>
                        </div>
                    </form>
                )}

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2">Nome</th>
                            <th className="pb-2">Preço</th>
                            <th className="pb-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurant.products.map(product => (
                            <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3">{product.name}</td>
                                <td className="py-3">R$ {product.price.toFixed(2)}</td>
                                <td className="py-3 text-right">
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RestaurantAdmin;
