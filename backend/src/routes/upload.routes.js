const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Rota para upload de imagem única
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        // Retorna a URL segura do Cloudinary
        res.json({
            url: req.file.path,
            id: req.file.filename
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro interno no servidor de upload' });
    }
});

module.exports = router;
