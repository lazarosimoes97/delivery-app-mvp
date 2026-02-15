const { MercadoPagoConfig, Payment } = require('mercadopago');
const prisma = require('../prisma');

// Configure Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const paymentClient = new Payment(client);

// Create PIX payment
exports.createPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                restaurant: true,
                user: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        // Create PIX payment
        const paymentData = {
            transaction_amount: order.total,
            description: `Pedido ${order.restaurant.name}`,
            payment_method_id: 'pix',
            payer: {
                email: order.user.email,
                first_name: order.user.name.split(' ')[0],
                last_name: order.user.name.split(' ').slice(1).join(' ') || order.user.name.split(' ')[0]
            },
            notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            external_reference: orderId
        };

        const payment = await paymentClient.create({ body: paymentData });

        // Update order with payment ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentId: payment.id.toString(),
                paymentStatus: 'PENDING',
                paymentMethod: 'pix'
            }
        });

        // Return QR Code data
        res.json({
            paymentId: payment.id,
            status: payment.status,
            qrCode: payment.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
            ticketUrl: payment.point_of_interaction.transaction_data.ticket_url
        });

    } catch (error) {
        console.error('Error creating PIX payment:', error);
        res.status(500).json({ error: 'Erro ao criar pagamento PIX', details: error.message });
    }
};

// Create card payment
exports.createCardPayment = async (req, res) => {
    try {
        const { orderId, token, installments, paymentMethodId } = req.body;

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                restaurant: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        // Create card payment
        const paymentData = {
            transaction_amount: order.total,
            token,
            description: `Pedido ${order.restaurant.name}`,
            installments: installments || 1,
            payment_method_id: paymentMethodId,
            payer: {
                email: order.user.email,
                first_name: order.user.name.split(' ')[0],
                last_name: order.user.name.split(' ').slice(1).join(' ') || order.user.name.split(' ')[0]
            },
            notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            external_reference: orderId
        };

        const payment = await paymentClient.create({ body: paymentData });

        // Update order with payment info
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentId: payment.id.toString(),
                paymentStatus: payment.status === 'approved' ? 'APPROVED' : 'PENDING',
                paymentMethod: paymentMethodId,
                status: payment.status === 'approved' ? 'PREPARING' : 'PENDING'
            }
        });

        res.json({
            paymentId: payment.id,
            status: payment.status,
            statusDetail: payment.status_detail
        });

    } catch (error) {
        console.error('Error creating card payment:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento', details: error.message });
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
