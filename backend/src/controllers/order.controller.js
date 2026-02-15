const prisma = require('../prisma');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { restaurantId, items } = req.body;
        const userId = req.user.id;

        // Validate items and calculate total
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (product.restaurantId !== restaurantId) {
                return res.status(400).json({ error: 'All items must be from the same restaurant' });
            }

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price, // Store price at time of order
            });
        }

        const order = await prisma.order.create({
            data: {
                userId,
                restaurantId,
                total,
                status: 'PENDING',
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order', details: error.message });
    }
};

// Get orders for the logged-in user
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                restaurant: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
};

// Get orders for a restaurant (Owner only)
exports.getRestaurantOrders = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user.id;

        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant || restaurant.ownerId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const orders = await prisma.order.findMany({
            where: { restaurantId },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching restaurant orders', details: error.message });
    }
}

// Update order status (Owner only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { restaurant: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.restaurant.ownerId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Error updating order', details: error.message });
    }
};
