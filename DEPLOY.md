# Guia de Deploy - Render.com

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com) (gratuita)
2. Conta no [GitHub](https://github.com)
3. Projeto commitado no GitHub

## 🚀 Passo a Passo

### 1. Preparar o Repositório GitHub

```bash
# Se ainda não inicializou o git
git init
git add .
git commit -m "Preparar projeto para deploy"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/delivery-app-mvp.git
git branch -M main
git push -u origin main
```

### 2. Criar Banco de Dados PostgreSQL no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `delivery-app-db`
   - **Database**: `delivery_app`
   - **User**: `delivery_app_user`
   - **Region**: escolha a mais próxima (ex: Oregon)
   - **Plan**: **Free**
4. Clique em **"Create Database"**
5. **IMPORTANTE**: Copie a **Internal Database URL** (você vai precisar)

### 3. Deploy do Backend

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `delivery-app-backend`
   - **Region**: mesma do banco de dados
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. **Environment Variables** (clique em "Advanced"):
   ```
   DATABASE_URL = [Cole a Internal Database URL do passo 2]
   JWT_SECRET = [Gere uma string aleatória, ex: minha-chave-super-secreta-123]
   PORT = 3000
   NODE_ENV = production
   FRONTEND_URL = [Deixe em branco por enquanto, vamos preencher depois]
   ```

5. Clique em **"Create Web Service"**
6. Aguarde o deploy (5-10 minutos)
7. **IMPORTANTE**: Copie a URL do backend (ex: `https://delivery-app-backend.onrender.com`)

### 4. Executar Migrações do Banco

Após o deploy do backend:

1. No dashboard do backend, vá em **"Shell"** (menu lateral)
2. Execute os comandos:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

### 5. Deploy do Frontend

1. No Dashboard do Render, clique em **"New +"** → **"Static Site"**
2. Conecte o mesmo repositório GitHub
3. Configure:
   - **Name**: `delivery-app-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL = [Cole a URL do backend do passo 3]/api
   ```
   Exemplo: `https://delivery-app-backend.onrender.com/api`

5. Clique em **"Create Static Site"**
6. Aguarde o deploy (3-5 minutos)
7. **IMPORTANTE**: Copie a URL do frontend (ex: `https://delivery-app-frontend.onrender.com`)

### 6. Atualizar CORS no Backend

1. Volte ao dashboard do **backend**
2. Vá em **"Environment"**
3. Adicione/atualize a variável:
   ```
   FRONTEND_URL = [Cole a URL do frontend do passo 5]
   ```
   Exemplo: `https://delivery-app-frontend.onrender.com`

4. Clique em **"Save Changes"**
5. O backend vai fazer redeploy automaticamente

### 7. Testar a Aplicação

1. Acesse a URL do frontend
2. Teste o registro de usuário
3. Teste o login
4. Navegue pelos restaurantes

## 🎉 Pronto!

Sua aplicação está no ar! 

- **Frontend**: `https://delivery-app-frontend.onrender.com`
- **Backend**: `https://delivery-app-backend.onrender.com`

## ⚠️ Limitações do Plano Gratuito

- O backend "dorme" após **15 minutos** de inatividade
- A primeira requisição após o sleep demora **~30 segundos**
- Você tem **750 horas/mês** de uso gratuito

## 🔄 Atualizações Futuras

Sempre que você fizer push para o GitHub:
- O Render vai fazer **deploy automático**
- Não precisa fazer nada manualmente!

## 🆘 Problemas Comuns

### Backend não inicia
- Verifique se a `DATABASE_URL` está correta
- Verifique os logs no dashboard do Render

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está correto
- Verifique se `FRONTEND_URL` está configurado no backend

### Erro de CORS
- Certifique-se que `FRONTEND_URL` no backend está correto
- Deve ser a URL exata do frontend (sem barra no final)

## 📝 Credenciais de Teste

Após executar o seed:

**Cliente:**
- Email: `cliente@teste.com`
- Senha: `senha123`

**Dono de Restaurante:**
- Email: `dono@teste.com`
- Senha: `senha123`
