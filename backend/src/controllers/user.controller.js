const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        res.json(user);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'E-mail já está em uso' });
        }
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user.id;

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_restaurantId: { userId, restaurantId }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            return res.json({ favorited: false });
        } else {
            await prisma.favorite.create({
                data: { userId, restaurantId }
            });
            return res.json({ favorited: true });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar favorito' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            include: {
                restaurant: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(favorites.map(f => f.restaurant));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
};
