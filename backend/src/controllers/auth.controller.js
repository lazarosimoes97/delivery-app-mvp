const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, restaurant } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // If role is RESTAURANT_OWNER, create user and restaurant in a transaction
        if (role === 'RESTAURANT_OWNER' && restaurant) {
            const result = await prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role,
                    },
                });

                const newRestaurant = await prisma.restaurant.create({
                    data: {
                        name: restaurant.name,
                        document: restaurant.document,
                        type: restaurant.type,
                        category: restaurant.category,
                        description: restaurant.description,
                        address: restaurant.address,
                        ownerId: user.id
                    }
                });

                return { user, restaurant: newRestaurant };
            });

            const token = jwt.sign({ id: result.user.id, role: result.user.role }, JWT_SECRET, {
                expiresIn: '1d',
            });

            return res.status(201).json({
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role
                },
                restaurant: result.restaurant,
                token
            });
        }

        // Regular CLIENT registration
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CLIENT',
            },
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
};
