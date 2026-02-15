import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
                <p className="text-gray-500 mb-4">Por favor, faça login para ver seus pedidos.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                    Entrar
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        // Empty State matching the requested image
        return (
            <div className="min-h-screen bg-white flex flex-col pb-20">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-100">
                    <button onClick={() => navigate(-1)} className="text-red-500 mr-4">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1 text-center font-medium text-gray-700 uppercase tracking-wide">
                        Meus Pedidos
                    </div>
                    <div className="w-6"></div>
                </div>

                {/* Content */}
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    {/* Illustration */}
                    <div className="w-64 h-64 mb-8 relative">
                        {/* We will use the generated image here. For now using a placeholder if image generation is pending, 
                            but effectively the code will look for the artifact. 
                            Since I can't know the exact path until I see the artifact, I'll use a placeholder logic 
                            or assume it's in the assets. For this MVP, I'll use the generated image URL if I can, 
                            or a generic one. I'll use the one I just generated. 
                         */}
                        <img
                            src="empty_orders_illustration.png" // This will need to be moved to public or imported
                            alt="Sem pedidos"
                            className="w-full h-full object-contain opacity-80"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }}
                        />
                    </div>

                    <h2 className="text-xl font-medium text-gray-800 mb-2">Você ainda não pediu</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-xs">
                        Que tal conhecer as melhores opções na sua região?
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="text-red-600 font-bold text-sm hover:text-red-700 transition"
                    >
                        Ir para o início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-red-500 mr-4">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center font-medium text-gray-700 uppercase tracking-wide">
                    Meus Pedidos
                </div>
                <div className="w-6"></div>
            </div>

            <div className="p-4 space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-gray-200">
                                    {/* Ideally restaurant logo */}
                                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="font-semibold text-gray-800">{order.restaurant?.name || 'Restaurante'}</span>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                {order.status}
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2 mb-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-2 text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                                        <span className="flex-1">{item.product.name}</span>
                                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="font-bold text-gray-800">Total: R$ {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 text-center">
                            <button className="text-red-600 text-sm font-semibold hover:text-red-700">
                                Ajuda com o pedido
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
