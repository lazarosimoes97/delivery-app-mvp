const { PrismaClient } = require('@prisma/client');

console.log('Instantiating PrismaClient...');
try {
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated successfully.');

    prisma.$connect().then(() => {
        console.log('Connected to database.');
        return prisma.user.findMany().then(users => {
            console.log('Users found:', users.length);
            process.exit(0);
        });
    }).catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });

} catch (e) {
    console.error('Instantiation failed:', e);
    process.exit(1);
}
