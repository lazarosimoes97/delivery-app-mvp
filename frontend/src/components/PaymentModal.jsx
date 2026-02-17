import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PixPayment from './PixPayment';
import CardPayment from './CardPayment';
import { useCart } from '../context/CartContext';

const PaymentModal = ({ isOpen, onClose, orderId, total }) => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState(null);

    const handlePaymentSuccess = () => {
        alert('Pagamento confirmado! Seu pedido está sendo preparado.');
        clearCart();
        onClose();
        navigate('/orders');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Pagamento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {!paymentMethod ? (
                    <div>
                        <p className="text-gray-600 mb-4">Escolha a forma de pagamento:</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setPaymentMethod('pix')}
                                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">PIX</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-gray-800">PIX</p>
                                    <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('card')}
                                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-lg">💳</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-gray-800">Cartão de Crédito</p>
                                    <p className="text-sm text-gray-500">Parcelamento disponível</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : paymentMethod === 'pix' ? (
                    <PixPayment
                        orderId={orderId}
                        total={total}
                        onSuccess={handlePaymentSuccess}
                    />
                ) : paymentMethod === 'card' ? (
                    <CardPayment
                        orderId={orderId}
                        total={total}
                        onSuccess={handlePaymentSuccess}
                    />
                ) : null}

                {paymentMethod && (
                    <button
                        onClick={() => setPaymentMethod(null)}
                        className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        ← Voltar
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
