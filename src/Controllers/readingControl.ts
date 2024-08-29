import { Request, Response } from 'express';
import { processImage, confirmLeitura, listLeituras, checkExistingReading, findLeituraByUUID } from '../Services/GeminiServices';

//        POST

export const postLeitura = async (req: Request, res: Response) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (!image || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
            error_code: "INVALID_DATA",
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }

    const existingReading: any = await checkExistingReading(customer_code, measure_type, measure_datetime);
    if (existingReading) {
        return res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: "Já existe uma leitura para este tipo no mês atual"
    });
    }

    try {
        const result = await processImage(image);

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
};


//        PATCH

export const patchLeitura = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    if (!measure_uuid || typeof confirmed_value !== 'number') {
        return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }

    const leitura = await findLeituraByUUID(measure_uuid);
    if (!leitura) {
        return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Leitura não encontrada"
        });
    }

    if (leitura.has_confirmed) {
        return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada"
        });
    }

    try {
        await confirmLeitura(measure_uuid, confirmed_value);

        return res.status(200).json({
        success: true
        });
    } catch (error) {
        return res.status(500).json({
        error_code: "PROCESSING_ERROR",
        error_description: "Erro ao processar a confirmação"
        });
    }
};


//           GET
export const getLeituras = async (req: Request, res: Response) => {
    const { customerCode } = req.params;
    const { measure_type } = req.query;

    if (measure_type && !['WATER', 'GAS'].includes(measure_type.toLocaleString())) {
        return res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: "Parâmetro measure_type diferente de WATER ou GAS"
        });
    }

    try {
        const leituras = await listLeituras(customerCode, measure_type?.toLocaleString());
    
        if (leituras.length === 0) {
            return res.status(404).json({
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhum registro encontrado"
            });
        }

        return res.status(200).json({
            customer_code: customerCode,
            measures: leituras
        });
    } catch (error) {
        return res.status(500).json({
            error_code: "PROCESSING_ERROR",
            error_description: "Erro ao processar a listagem de leituras"
        });
    }
};