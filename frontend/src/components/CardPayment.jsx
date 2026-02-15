import { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import axios from 'axios';

const CardPayment = ({ orderId, total, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        securityCode: '',
        installments: 1
    });

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            value = value.substring(0, 19); // Max 16 digits + 3 spaces
        }

        // Format expiration date
        if (name === 'expirationDate') {
            value = value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            value = value.substring(0, 5);
        }

        // Format security code
        if (name === 'securityCode') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }

        // Format cardholder name (uppercase)
        if (name === 'cardholderName') {
            value = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
        if (cardNumberClean.length < 13 || cardNumberClean.length > 16) {
            alert('Número do cartão inválido');
            return;
        }

        if (!formData.cardholderName || formData.cardholderName.length < 3) {
            alert('Nome do titular inválido');
            return;
        }

        const [month, year] = formData.expirationDate.split('/');
        if (!month || !year || month < 1 || month > 12) {
            alert('Data de validade inválida');
            return;
        }

        if (formData.securityCode.length < 3) {
            alert('Código de segurança inválido');
            return;
        }

        try {
            setLoading(true);

            // For now, we'll use a simple token simulation
            // In production, you would use Mercado Pago SDK to tokenize
            const token = `test_card_${Date.now()}`;

            const response = await axios.post('/payments/card', {
                orderId,
                token,
                installments: parseInt(formData.installments),
                paymentMethodId: 'visa' // This should be detected from card number
            });

            if (response.data.status === 'approved') {
                onSuccess();
            } else {
                alert('Pagamento não aprovado. Tente novamente ou use outro cartão.');
            }

        } catch (error) {
            console.error('Error processing card payment:', error);
            const errorMessage = error.response?.data?.error || 'Erro ao processar pagamento';
            alert(errorMessage);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total a pagar:</span>
                    <span className="text-2xl font-bold text-blue-600">
                        R$ {total.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Card Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                    <CreditCard className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
            </div>

            {/* Cardholder Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Titular
                </label>
                <input
                    type="text"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    placeholder="NOME COMO NO CARTÃO"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Expiration Date and Security Code */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validade
                    </label>
                    <input
                        type="text"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                    </label>
                    <input
                        type="text"
                        name="securityCode"
                        value={formData.securityCode}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            {/* Installments */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parcelas
                </label>
                <select
                    name="installments"
                    value={formData.installments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="1">1x de R$ {total.toFixed(2)} sem juros</option>
                    <option value="2">2x de R$ {(total / 2).toFixed(2)} sem juros</option>
                    <option value="3">3x de R$ {(total / 3).toFixed(2)} sem juros</option>
                    <option value="4">4x de R$ {(total / 4).toFixed(2)} sem juros</option>
                    <option value="5">5x de R$ {(total / 5).toFixed(2)} sem juros</option>
                    <option value="6">6x de R$ {(total / 6).toFixed(2)} sem juros</option>
                </select>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processando...
                    </>
                ) : (
                    'Pagar Agora'
                )}
            </button>

            {/* Test Card Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 font-medium mb-1">Cartão de Teste:</p>
                <p className="text-xs text-yellow-700">
                    Número: 5031 4332 1540 6351<br />
                    CVV: 123 | Validade: 11/25<br />
                    Nome: APRO (aprovado) ou OTHE (rejeitado)
                </p>
            </div>
        </form>
    );
};

export default CardPayment;
