const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🫐 Iniciando criação da Estação do Açaí...');

    const hashedPassword = await bcrypt.hash('123456', 10);
    const charqueadaLat = -22.50972;
    const charqueadaLng = -47.77806;

    // 1. Criar Usuário Dono do Açaí
    const owner = await prisma.user.create({
        data: {
            name: 'Dono Açaí',
            email: 'dono_acai@app.com',
            password: hashedPassword,
            role: 'RESTAURANT_OWNER'
        }
    });

    console.log('✅ Usuário Dono Açaí criado.');

    // 2. Criar Restaurante
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Puro Açaí & Smoothies',
            description: 'O melhor açaí da cidade, montado do seu jeito, com frutas frescas e muito sabor!',
            imageUrl: '/images/seed/acai_banner.png', // Banner legal
            category: 'Açaí',
            document: '12.345.678/0001-90',
            type: 'Alimentação',
            zipCode: '13515-000',
            state: 'SP',
            city: 'Charqueada',
            street: 'Av. dos Sabores', // Rua diferente
            number: '500',
            latitude: charqueadaLat + 0.005, // Um pouco longe do centro
            longitude: charqueadaLng - 0.005,
            ownerId: owner.id
        }
    });

    console.log('✅ Restaurante Puro Açaí criado.');

    // 3. Criar Produtos com Imagens Premium
    const products = [
        {
            name: 'Açaí Tradicional com Frutas',
            price: 22.90,
            desc: 'Tigela de 500ml com banana, morango, granola crocante e mel orgânico.',
            img: '/images/seed/acai_bowl_fruits.png'
        },
        {
            name: 'Copo da Felicidade (Camadas)',
            price: 18.50,
            desc: '400ml de pura felicidade: camadas de açaí, leite ninho, leite condensado e paçoca.',
            img: '/images/seed/acai_cup_layers.png'
        },
        {
            name: 'Smoothie Refrescante',
            price: 16.00,
            desc: 'Batido cremoso de açaí com banana e um toque de guaraná. Perfeito para dias quentes.',
            img: '/images/seed/acai_smoothie.png'
        },
        {
            name: 'Barca Tropical',
            price: 35.00,
            desc: 'Ideal para dividir! Açaí com kiwi, manga, abacaxi, coco ralado e leite condensado.',
            img: '/images/seed/acai_tropical_mix.png'
        },
        {
            name: 'Açaí Power',
            price: 24.90,
            desc: 'Para quem treina: açaí com pasta de amendoim, mix de castanhas e whey protein opcional.',
            img: '/images/seed/acai_power_nuts.png'
        }
    ];

    for (const prod of products) {
        await prisma.product.create({
            data: {
                name: prod.name,
                description: prod.desc,
                price: prod.price,
                imageUrl: prod.img,
                category: 'Açaí Bowls',
                restaurantId: restaurant.id
            }
        });
    }

    console.log('✅ 5 Produtos de Açaí adicionados com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
