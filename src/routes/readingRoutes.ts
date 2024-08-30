import { Router } from 'express';
import { postReading, patchReading, getReading } from '../Controllers/readingControl';
import { processImage } from '../Services/GeminiServices';

const router = Router();

router.post('/', postReading);
router.patch('/:id', patchReading);
router.get('/:customerCode/list', getReading);

router.post('/url', async (req, res) => {
    const { imageUrl, customer_code, measure_datetime, measure_type } = req.body;
    
    if(!imageUrl || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
            error_code: "INVALID_DATA",
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }

    try {
        const result = await processImage(imageUrl);
        return res.status(200).json({
            image_url: result.image_url,
            measure_value: result.measure_value,
            measure_uuid: result.measure_uuid
        });
    } catch (error) {
        return res.status(500).json({
            error_code: "PROCESSING_ERROR",
            error_description: "Erro ao processar a imagem"
        });
    }
});

export default router;