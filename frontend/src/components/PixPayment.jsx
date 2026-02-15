import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

const PixPayment = ({ orderId, total, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [pixData, setPixData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        createPixPayment();
        // Start polling for payment status
        const interval = setInterval(checkPaymentStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const createPixPayment = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/payments/pix', { orderId });
            setPixData(response.data);
        } catch (error) {
            console.error('Error creating PIX payment:', error);
            alert('Erro ao gerar QR Code PIX. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        try {
            setChecking(true);
            const response = await axios.get(`/payments/${orderId}/status`);
            if (response.data.paymentStatus === 'APPROVED') {
                onSuccess();
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        } finally {
            setChecking(false);
        }
    };

    const copyPixCode = () => {
        if (pixData?.qrCode) {
            navigator.clipboard.writeText(pixData.qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <Loader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Gerando QR Code PIX...</p>
            </div>
        );
    }

    if (!pixData) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Erro ao gerar QR Code. Tente novamente.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Total */}
            <div className="w-full bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total a pagar:</span>
                    <span className="text-2xl font-bold text-blue-600">
                        R$ {total.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                />
            </div>

            {/* Instructions */}
            <div className="w-full mb-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                    Abra o app do seu banco e escaneie o QR Code acima ou copie o código PIX
                </p>

                {/* Copy Code Button */}
                <button
                    onClick={copyPixCode}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {copied ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Código Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            Copiar Código PIX
                        </>
                    )}
                </button>
            </div>

            {/* Status */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    {checking ? (
                        <Loader className="w-4 h-4 text-yellow-600 animate-spin" />
                    ) : (
                        <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    <span className="text-sm text-yellow-800">
                        Aguardando pagamento...
                    </span>
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
                O pagamento será confirmado automaticamente
            </p>
        </div>
    );
};

export default PixPayment;
