import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, orderId, total }) => {
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);

    const handleCreatePayment = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/payments/create', { orderId });

            // Redirect to Mercado Pago checkout
            window.location.href = response.data.initPoint;
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Erro ao criar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Pagamento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total do pedido:</span>
                            <span className="text-2xl font-bold text-red-600">
                                R$ {total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Você será redirecionado para o Mercado Pago para concluir o pagamento de forma segura.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">PIX</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">PIX</p>
                                <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">💳</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">Cartão de Crédito</p>
                                <p className="text-sm text-gray-500">Parcelamento disponível</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCreatePayment}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Processando...' : 'Ir para Pagamento'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Pagamento processado com segurança pelo Mercado Pago
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;
