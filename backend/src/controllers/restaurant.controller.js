const prisma = require('../prisma');

exports.createRestaurant = async (req, res) => {
    try {
        const { name, description, address, imageUrl } = req.body;
        const ownerId = req.user.id; // From auth middleware

        // Check if user is restaurant owner
        if (req.user.role !== 'RESTAURANT_OWNER') {
            return res.status(403).json({ error: 'Access denied. Only restaurant owners can create restaurants.' });
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                description,
                address,
                imageUrl,
                ownerId,
            },
        });

        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Error creating restaurant', details: error.message });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                products: true, // simplified for MVP
            }
        });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching restaurants', details: error.message });
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching restaurant', details: error.message });
    }
};
exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, type, imageUrl } = req.body;
        const userId = req.user.id;

        const restaurant = await prisma.restaurant.findUnique({ where: { id } });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (restaurant.ownerId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this restaurant' });
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                name,
                description,
                category,
                type,
                imageUrl
            }
        });

        res.json(updatedRestaurant);
    } catch (error) {
        res.status(500).json({ error: 'Error updating restaurant', details: error.message });
    }
};
