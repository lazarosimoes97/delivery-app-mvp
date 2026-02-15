const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Iniciando seed...');

    // Limpar banco de dados (ordem inversa para respeitar chaves estrangeiras)
    try {
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.restaurant.deleteMany();
        await prisma.user.deleteMany();
        console.log('🧹 Banco de dados limpo.');
    } catch (error) {
        console.warn('⚠️  Não foi possível limpar algumas tabelas (talvez já estejam vazias).', error.message);
    }

    // Senha padrão para todos os usuários
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Criar Usuário Dono (Restaurant Owner)
    const owner = await prisma.user.create({
        data: {
            name: 'João Dono',
            email: 'dono@garagemburguer.com',
            password: hashedPassword,
            role: 'RESTAURANT_OWNER',
        },
    });

    console.log(`👤 Usuário Dono criado: ${owner.email}`);

    // 2. Criar Restaurante "Garagem Burguer"
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Garagem Burguer',
            description: 'Hambúrgueres artesanais feitos na brasa. Defumados e suculentos.',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            category: 'Hambúrguer',
            document: '12.345.678/0001-90',
            type: 'Lanchonete',

            // Endereço Detalhado (Exemplo: Av. Paulista, SP)
            zipCode: '01310-100',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Bela Vista',
            street: 'Avenida Paulista',
            number: '1000',
            complement: 'Loja 1',
            reference: 'Próximo ao MASP',
            latitude: -23.561414,
            longitude: -46.655881,

            ownerId: owner.id,
        },
    });

    console.log(`🍔 Restaurante criado: ${restaurant.name}`);

    // 3. Criar Produtos para o Restaurante
    const products = await prisma.product.createMany({
        data: [
            {
                name: 'X-Garagem Bacon',
                description: 'Pão brioche, burger 180g, queijo cheddar, bacon crocante e maionese da casa.',
                price: 32.90,
                category: 'Lanches',
                imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80',
                restaurantId: restaurant.id,
            },
            {
                name: 'Smash Duplo',
                description: 'Dois burgers de 90g amassados na chapa, queijo prato e cebola caramelizada.',
                price: 28.50,
                category: 'Lanches',
                imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=765&q=80',
                restaurantId: restaurant.id,
            },
            {
                name: 'Batata Rústica',
                description: 'Batatas cortadas rusticamente com alecrim e alho.',
                price: 18.00,
                category: 'Acompanhamentos',
                imageUrl: 'https://images.unsplash.com/photo-1573080496987-a20c90c79f97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
                restaurantId: restaurant.id,
            },
            {
                name: 'Coca-Cola Lata',
                description: 'Lata 350ml gelada.',
                price: 6.00,
                category: 'Bebidas',
                imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
                restaurantId: restaurant.id,
            },
        ],
    });

    console.log(`🍟 Produtos criados.`);

    // 4. Criar Usuário Cliente para Teste
    const client = await prisma.user.create({
        data: {
            name: 'Maria Cliente',
            email: 'maria@email.com',
            password: hashedPassword, // 123456
            role: 'CLIENT',
        },
    });

    console.log(`👩 Usuário Cliente criado: ${client.email}`);

    console.log('✅ Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
