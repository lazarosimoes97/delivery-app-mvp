import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('/orders', {
                restaurantId: cart.restaurantId,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });

            // Open payment modal with order ID
            setCurrentOrderId(response.data.id);
            setShowPaymentModal(true);
        } catch (error) {
            console.error(error);
            alert('Falha ao realizar pedido: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800">Seu Carrinho</h2>

            {cart.items.length > 0 ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        {cart.items.map((item) => (
                            <div key={item.productId} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border-b border-gray-100 last:border-b-0 gap-3 md:gap-0">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <button
                                                onClick={() => updateQuantity(item.productId, -1)}
                                                className="p-1 px-2 hover:bg-gray-200 text-gray-600 transition"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2 text-sm font-bold text-gray-700 min-w-[20px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, 1)}
                                                className="p-1 px-2 hover:bg-gray-200 text-gray-600 transition"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between md:justify-end items-center w-full md:w-auto gap-4">
                                    <div className="font-bold text-gray-800">R$ {(item.price * item.quantity).toFixed(2)}</div>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 rounded-full hover:bg-red-50 transition"
                                        aria-label="Remover item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                            <span className="text-lg md:text-xl font-bold text-gray-700">Total:</span>
                            <span className="text-lg md:text-xl font-bold text-red-600">R$ {cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 md:gap-4">
                        <button
                            onClick={clearCart}
                            className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition"
                        >
                            Limpar Carrinho
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition"
                        >
                            Finalizar Pedido
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Seu carrinho está vazio</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                    >
                        Buscar Restaurantes
                    </button>
                </div>
            )}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                }}
                orderId={currentOrderId}
                total={cartTotal}
            />
        </div>
    );
};

export default Cart;
