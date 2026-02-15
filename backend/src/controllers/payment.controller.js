const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const prisma = require('../prisma');

// Configure Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

// Create payment preference
exports.createPayment = async (req, res) => {
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

        // Create preference for Mercado Pago
        const preference = {
            items: order.items.map(item => ({
                title: item.product.name,
                unit_price: item.price,
                quantity: item.quantity,
            })),
            payer: {
                email: order.user.email,
                name: order.user.name
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/orders/${orderId}/success`,
                failure: `${process.env.FRONTEND_URL}/orders/${orderId}/failure`,
                pending: `${process.env.FRONTEND_URL}/orders/${orderId}/pending`
            },
            auto_return: 'approved',
            external_reference: orderId,
            notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            statement_descriptor: order.restaurant.name,
        };

        const response = await preferenceClient.create({ body: preference });

        // Update order with payment ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentId: response.id,
                paymentStatus: 'PENDING'
            }
        });

        res.json({
            preferenceId: response.id,
            initPoint: response.init_point,
            sandboxInitPoint: response.sandbox_init_point
        });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Erro ao criar pagamento' });
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
                status: true
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
