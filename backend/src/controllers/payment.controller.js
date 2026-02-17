const { MercadoPagoConfig, Payment } = require('mercadopago');
const prisma = require('../prisma');

// Configure Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const paymentClient = new Payment(client);

// Helper to get MP client for a specific restaurant
const getRestaurantMPClient = (accessToken) => {
    const restaurantConfig = new MercadoPagoConfig({ accessToken });
    return new Payment(restaurantConfig);
};

// Generate OAuth URL for restaurants
exports.getOAuthUrl = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const appId = process.env.MERCADOPAGO_APP_ID;
        const backendUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const redirectUri = encodeURIComponent(`${backendUrl}/api/payments/oauth/callback`);

        // State includes restaurantId to verify later
        const state = restaurantId;

        const url = `https://auth.mercadopago.com.br/authorization?client_id=${appId}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${redirectUri}`;

        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar URL do Mercado Pago' });
    }
};

// Handle OAuth Callback
exports.handleOAuthCallback = async (req, res) => {
    const { code, state: restaurantId } = req.query;

    if (!code) {
        return res.status(400).send('Código de autorização ausente');
    }

    try {
        const response = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
                client_id: process.env.MERCADOPAGO_APP_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL}/api/payments/oauth/callback`
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Save to restaurant
            await prisma.restaurant.update({
                where: { id: restaurantId },
                data: {
                    mpAccessToken: data.access_token,
                    mpUserId: data.user_id.toString()
                }
            });

            // Redirecionar de volta para o admin com sucesso
            res.redirect(`${process.env.FRONTEND_URL}/admin?success=mp_connected`);
        } else {
            console.error('MP OAuth Error:', data);
            res.redirect(`${process.env.FRONTEND_URL}/admin?mp_status=error`);
        }
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.status(500).send('Erro ao processar autorização');
    }
};

// Create PIX payment
exports.createPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                restaurant: true,
                user: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Se o restaurante tiver conta MP conectada, usamos o token dele
        const restaurantClient = order.restaurant.mpAccessToken ? getRestaurantMPClient(order.restaurant.mpAccessToken) : null;
        const clientToUse = restaurantClient || paymentClient;

        // Se estiver usando a conta do restaurante, podemos cobrar uma comissão (application_fee)
        // Nota: application_fee requer que a App ID que gerou o token seja a mesma do paymentClient
        let paymentData = {
            transaction_amount: Number(order.total),
            description: `Pedido #${order.id.slice(0, 8)} - ${order.restaurant.name}`,
            payment_method_id: 'pix',
            payer: {
                email: order.user.email,
                first_name: order.user.name.split(' ')[0],
                last_name: order.user.name.split(' ').slice(1).join(' ') || 'User',
            },
            notification_url: `${process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL}/api/payments/webhook`,
            external_reference: orderId,
        };

        // Adicionar taxa da plataforma (10%) se o restaurante estiver conectado
        // COMENTADO TEMPORARIAMENTE PARA DEPURAR ERRO EM PRODUÇÃO
        /*
        if (order.restaurant.mpAccessToken) {
            const fee = Number((order.total * 0.10).toFixed(2));
            paymentData.application_fee = fee;
        }
        */

        console.log('Enviando dados para Mercado Pago:', JSON.stringify(paymentData, null, 2));

        const payment = await clientToUse.create({ body: paymentData });

        console.log('Resposta do Mercado Pago:', JSON.stringify(payment, null, 2));

        if (!payment.point_of_interaction || !payment.point_of_interaction.transaction_data) {
            throw new Error('Resposta do Mercado Pago não contém dados do QR Code');
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PENDING',
                paymentId: String(payment.id),
                mpQrCode: payment.point_of_interaction.transaction_data.qr_code,
                mpQrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64
            }
        });

        res.json({
            id: payment.id,
            qr_code: payment.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error('ERRO DETALHADO PIX:', error);
        // Log extra para o objeto de erro do MP se existir
        if (error.response) {
            console.error('RESPOSTA DE ERRO MP:', JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({
            message: 'Erro ao processar pagamento PIX',
            details: error.message
        });
    }
};

// Create card payment
exports.createCardPayment = async (req, res) => {
    try {
        const { orderId, token, installments, paymentMethodId, payerEmail } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                restaurant: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Se o restaurante tiver conta MP conectada, usamos o token dele
        const restaurantClient = order.restaurant.mpAccessToken ? getRestaurantMPClient(order.restaurant.mpAccessToken) : null;
        const clientToUse = restaurantClient || paymentClient;

        let paymentData = {
            transaction_amount: Number(order.total),
            token,
            description: `Pedido #${order.id.slice(0, 8)} - ${order.restaurant.name}`,
            installments: Number(installments),
            payment_method_id: paymentMethodId,
            payer: {
                email: payerEmail || order.user.email,
            },
            notification_url: `${process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL}/api/payments/webhook`,
            external_reference: orderId,
        };

        // Adicionar taxa da plataforma (10%) se o restaurante estiver conectado
        if (order.restaurant.mpAccessToken) {
            const fee = Number((order.total * 0.10).toFixed(2));
            paymentData.application_fee = fee;
        }

        const payment = await clientToUse.create({ body: paymentData });

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: payment.status === 'approved' ? 'PREPARING' : 'PENDING',
                paymentId: String(payment.id),
            }
        });

        res.json({
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail
        });
    } catch (error) {
        console.error('Erro ao processar pagamento com cartão:', error);
        res.status(500).json({ message: 'Erro ao processar pagamento com cartão' });
    }
};

// Webhook to receive payment notifications
exports.webhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;

            // Get payment details from Mercado Pago
            const payment = await paymentClient.get({ id: paymentId });

            // Find order by external_reference
            const orderId = payment.external_reference;

            if (!orderId) {
                return res.status(200).send('OK');
            }

            // Update order payment status
            let paymentStatus = 'PENDING';
            let orderStatus = 'PENDING';

            switch (payment.status) {
                case 'approved':
                    paymentStatus = 'APPROVED';
                    orderStatus = 'PREPARING';
                    break;
                case 'rejected':
                    paymentStatus = 'REJECTED';
                    orderStatus = 'CANCELED';
                    break;
                case 'in_process':
                    paymentStatus = 'IN_PROCESS';
                    break;
                case 'pending':
                    paymentStatus = 'PENDING';
                    break;
                default:
                    paymentStatus = 'PENDING';
            }

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus,
                    status: orderStatus,
                    paymentMethod: payment.payment_method_id
                }
            });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error');
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                paymentStatus: true,
                paymentMethod: true,
                status: true,
                paymentId: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({ error: 'Erro ao buscar status do pagamento' });
    }
};
