const prisma = require('../src/prisma');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding database with enhanced data...');

    // 1. Create Users
    const clientPassword = await bcrypt.hash('123456', 10);
    const ownerPassword = await bcrypt.hash('123456', 10);

    const client = await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: {
            name: 'Lázaro Simões',
            email: 'client@example.com',
            password: clientPassword,
            role: 'CLIENT',
        },
    });

    const owner = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
            name: 'Restaurant Owner',
            email: 'owner@example.com',
            password: ownerPassword,
            role: 'RESTAURANT_OWNER',
        },
    });

    console.log('Users created/updated.');

    const restaurantsData = [
        {
            name: 'Fast Pizza',
            description: 'The best pizza in town. Wood-fired and delicious.',
            address: 'Av. Paulista, 1230 - São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            products: [
                { name: 'Pepperoni Pizza', description: 'Classic pepperoni with extra cheese.', price: 45.00, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Margherita Pizza', description: 'Fresh basil, mozzarella, and tomato sauce.', price: 40.00, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Four Cheese', description: 'Mozzarella, parmesan, gorgonzola, and provolone.', price: 50.00, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
                { name: 'Cola 2L', description: 'Ice cold Coca-Cola.', price: 12.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Garlic Bread', description: 'Crispy baguette with garlic butter.', price: 15.00, category: 'Entradas', imageUrl: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
            ]
        },
        {
            name: 'Rosário Lancheria',
            description: 'Combos familiares e lanches deliciosos.',
            address: 'Rua Augusta, 500 - São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            products: [
                { name: 'Combo Tradicional', description: '2 Salada Tradicional, 1 Batata 600gr, 1 Refrigerante 2lts', price: 105.99, category: 'Combos Familia', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Combo Familia 2', description: '5 Saladas Junior, 1 Batata 600gr, 1 Refrigerante 2lts', price: 165.99, category: 'Combos Familia', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Combo Familia 1', description: '4 Saladas Junior, 1 Batata 600gr, 1 Refrigerante 2lts', price: 137.99, category: 'Combos Familia', imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Combo Familia 3', description: '6 Saladas Junior, 1 Batata 600gr, 1 Refrigerante 2lts', price: 193.99, category: 'Combos Familia', imageUrl: 'https://images.unsplash.com/photo-1630384060421-a4323ceca041?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Coca-Cola 2L', description: 'Refrigerante 2 Litros gelado.', price: 14.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
            ]
        },
        {
            name: 'Sushi Zen',
            description: 'Authentic Japanese cuisine. Fresh and elegant.',
            address: 'Liberdade, 88 - São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            products: [
                { name: 'Salmon Nigiri', description: 'Fresh salmon on vinegared rice (4 pcs).', price: 22.00, category: 'Sushi', imageUrl: 'https://images.unsplash.com/photo-1617196019474-460dd280e540?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'California Roll', description: 'Crab, avocado, and cucumber (8 pcs).', price: 20.00, category: 'Rolls', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Sashimi Platter', description: 'Assorted fresh raw fish.', price: 65.00, category: 'Sashimi', imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Miso Soup', description: 'Traditional soybean paste soup.', price: 8.00, category: 'Entradas', imageUrl: 'https://images.unsplash.com/photo-1596450514735-373d722f6239?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Temaki', description: 'Hand-rolled sushi cone with salmon.', price: 24.00, category: 'Temaki', imageUrl: 'https://images.unsplash.com/photo-1534256955018-48b5100f0d28' },
            ]
        },
        {
            name: 'Sabor Brasileiro',
            description: 'Traditional home-cooked Brazilian meals.',
            address: 'Rua do Feijão, 456 - São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            products: [
                { name: 'Feijoada', description: 'Black bean stew with pork and sides.', price: 38.00, category: 'Pratos Principais', imageUrl: 'https://images.unsplash.com/photo-1676318361732-4740266da2b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Picanha Steak', description: 'Grilled picanha with rice and beans.', price: 55.00, category: 'Churrasco', imageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Coxinha', description: 'Chicken croquettes (3 pcs).', price: 12.00, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1626315579930-b49d601b3a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Brigadeiro', description: 'Chocolate truffles (4 pcs).', price: 10.00, category: 'Sobremesas', imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf584?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
                { name: 'Guaraná', description: 'Brazilian soda.', price: 6.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767128-4f8185c76082' },
            ]
        }
    ];

    // 3. Clear existing restaurants/products to avoid duplicates (optional, for safety in seed)
    // For now we will just create new ones. Ideally we check if they exist.
    // simpler approach: `createMany` is not supported for nested writes easily with generic setup, 
    // so we loop.

    // We'll delete all existing restaurants to have a clean state for this request
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.restaurant.deleteMany({});
    console.log('Old data cleared.');

    for (const r of restaurantsData) {
        const restaurant = await prisma.restaurant.create({
            data: {
                name: r.name,
                description: r.description,
                address: r.address,
                imageUrl: r.imageUrl,
                ownerId: owner.id,
                products: {
                    create: r.products
                }
            }
        });
        console.log(`Created restaurant: ${restaurant.name}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// Export for use in HTTP endpoint
module.exports = main;
