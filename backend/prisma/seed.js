const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Iniciando Reset e Seed do Banco de Dados...');

    // 1. Limpar TODAS as tabelas
    console.log('🧹 Limpando dados antigos...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Dados de Charqueada (Centro)
    const charqueadaLat = -22.50972;
    const charqueadaLng = -47.77806;

    const restaurantsData = [
        {
            name: 'Charqueada Burguer',
            category: 'Hambúrguer',
            description: 'O melhor hambúrguer artesanal da região, feito na brasa.',
            image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
            products: [
                { name: 'X-Tudo Charqueada', price: 28.90, desc: 'Pão, carne 180g, queijo, bacon, ovo, alface e tomate.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
                { name: 'Smash Simples', price: 18.00, desc: 'Pão, blend 90g e queijo prato.', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80' },
                { name: 'Batata Frita G', price: 15.00, desc: 'Porção generosa de batatas crocantes.', img: 'https://images.unsplash.com/photo-1630384066255-4427b59ac3a5?w=500&q=80' },
                { name: 'Milkshake Chocolate', price: 14.00, desc: '500ml de pura cremosidade.', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80' },
                { name: 'Coca Zero 600ml', price: 8.50, desc: 'Refrescante e gelada.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' }
            ]
        },
        {
            name: 'Pizza da Praça',
            category: 'Pizza',
            description: 'Pizzas assadas no forno a lenha com ingredientes selecionados.',
            image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80',
            products: [
                { name: 'Calabresa Família', price: 45.00, desc: 'Molho, mussarela, calabresa e cebola.', img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80' },
                { name: 'Marguerita Média', price: 38.00, desc: 'Mussarela, tomate e manjericão fresco.', img: 'https://images.unsplash.com/photo-1573821663912-5699037ea012?w=500&q=80' },
                { name: 'Frango com Catupiry', price: 48.00, desc: 'O clássico preferido de todos.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' }, // Reusando um estável
                { name: 'Brotinho Chocolate', price: 25.00, desc: 'Pizza doce com chocolate ao leite.', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&q=80' },
                { name: 'Guaraná Antártica 2L', price: 12.00, desc: 'Tamanho família.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' }
            ]
        },
        {
            name: 'Cantina do Sol',
            category: 'Brasileira',
            description: 'Comida caseira feita com carinho para o seu almoço.',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
            products: [
                { name: 'Feijoada Completa', price: 35.00, desc: 'Acompanha arroz, couve e farofa.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80' },
                { name: 'Filé de Frango Grelhado', price: 24.90, desc: 'Prato comercial bem servido.', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80' },
                { name: 'Parmegiana de Carne', price: 42.00, desc: 'Serve até duas pessoas.', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80' },
                { name: 'Pudim de Leite', price: 8.00, desc: 'Sobremesa clássica da casa.', img: 'https://images.unsplash.com/photo-1590473031965-14261d718b91?w=500&q=80' },
                { name: 'Suco de Laranja 500ml', price: 10.00, desc: 'Fruta espremida na hora.', img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80' }
            ]
        },
        {
            name: 'Sushi Charqueada',
            category: 'Japonesa',
            description: 'Sushis e Sashimis fresquinhos todos os dias.',
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
            products: [
                { name: 'Combo 20 Peças', price: 55.00, desc: 'Variedade de niguiris, uramakis e hossomakis.', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80' },
                { name: 'Temaki Salmão Completo', price: 26.00, desc: 'Com cream cheese e cebolinha.', img: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=500&q=80' },
                { name: 'Yakisoba Misto', price: 32.00, desc: 'Carne, frango e legumes.', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80' },
                { name: 'Hot Roll (10 unid)', price: 22.00, desc: 'Sushi frito crocante.', img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&q=80' },
                { name: 'Cerveja Sapporo', price: 18.00, desc: 'Importada direto do Japão.', img: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=500&q=80' }
            ]
        },
        {
            name: 'Padaria Central',
            category: 'Padaria',
            description: 'Pães quentinhos, bolos e café colonial de qualidade.',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
            products: [
                { name: 'Cesta de Pães', price: 15.00, desc: 'Pão francês, integral e queijo.', img: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80' },
                { name: 'Bolo de Cenoura G', price: 25.00, desc: 'Com muita cobertura de chocolate.', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' },
                { name: 'Cappuccino Especial', price: 9.50, desc: 'Com borda de Nutella.', img: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80' },
                { name: 'Coxinha de Frango', price: 6.00, desc: 'A melhor da cidade.', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80' },
                { name: 'Pão de Queijo Copo', price: 8.00, desc: 'Porção com 10 unidades.', img: 'https://images.unsplash.com/photo-1598103442097-8b74302b452a?w=500&q=80' }
            ]
        }
    ];

    for (let i = 0; i < restaurantsData.length; i++) {
        const data = restaurantsData[i];

        // Criar um usuário dono exclusivo para cada restaurante
        const owner = await prisma.user.create({
            data: {
                name: `Dono ${data.name}`,
                email: `dono${i + 1}@app.com`,
                password: hashedPassword,
                role: 'RESTAURANT_OWNER'
            }
        });

        // Criar o restaurante
        const restaurant = await prisma.restaurant.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.image,
                category: data.category,
                document: `00.000.000/000${i + 1}-00`,
                type: 'Alimentação',
                zipCode: '13515-000',
                state: 'SP',
                city: 'Charqueada',
                street: 'Rua Principal',
                number: `${100 * (i + 1)}`,
                latitude: charqueadaLat + (Math.random() - 0.5) * 0.01,
                longitude: charqueadaLng + (Math.random() - 0.5) * 0.01,
                ownerId: owner.id
            }
        });

        // Criar os produtos
        for (const prod of data.products) {
            await prisma.product.create({
                data: {
                    name: prod.name,
                    description: prod.desc,
                    price: prod.price,
                    imageUrl: prod.img,
                    category: data.category,
                    restaurantId: restaurant.id
                }
            });
        }
    }

    // Criar um usuário cliente para testes fácil
    await prisma.user.create({
        data: {
            name: 'Usuario Teste',
            email: 'user@teste.com',
            password: hashedPassword,
            role: 'CLIENT'
        }
    });

    console.log('✅ Banco de dados resetado e 5 estabelecimentos criados com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
