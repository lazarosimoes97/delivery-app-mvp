require('dotenv').config();
console.log("CWD:", process.cwd());
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
