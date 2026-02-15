const prisma = require('../prisma');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, restaurantId } = req.body;
        const userId = req.user.id;

        // Verify ownership
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        if (restaurant.ownerId !== userId) {
            return res.status(403).json({ error: 'You are not the owner of this restaurant' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category: category || 'General',
                imageUrl,
                restaurantId,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product', details: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, imageUrl } = req.body;
        const userId = req.user.id;

        const product = await prisma.product.findUnique({ where: { id }, include: { restaurant: true } });

        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.restaurant.ownerId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                category: category,
                imageUrl
            }
        });

        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ error: 'Error updating product', details: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const product = await prisma.product.findUnique({ where: { id }, include: { restaurant: true } });

        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.restaurant.ownerId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error deleting product', details: error.message });
    }
};
