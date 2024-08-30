import { Request, Response } from 'express';

import { processImage, confirmReading, listReading, checkExistingReading, findReadingByUUID } from '../Services/GeminiServices';


export const postReading = async (req: Request, res: Response) => {
    const { imageUrl, customer_code, measure_datetime, measure_type } = req.body;

    if (!imageUrl || !customer_code || !measure_datetime || !measure_type) {
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
};


export const patchReading = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    if (!measure_uuid || typeof confirmed_value !== 'number') {
        return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }

    const reading = await findReadingByUUID(measure_uuid);
    if (!reading) {
        return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Leitura não encontrada"
        });
    }

    if (reading.has_confirmed) {
        return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada"
        });
    }

    try {
        await confirmReading(measure_uuid, confirmed_value);

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


export const getReading = async (req: Request, res: Response) => {
    const { customerCode } = req.params;
    const { measure_type } = req.query;

    if (measure_type && !['WATER', 'GAS'].includes(measure_type.toLocaleString())) {
        return res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: "Parâmetro measure_type diferente de WATER ou GAS"
        });
    }

    try {
        const readings = await listReading(customerCode, measure_type?.toLocaleString());
        if (readings.length === 0) {
            return res.status(404).json({
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhum registro encontrado"
            });
        }
        return res.status(200).json({
            customer_code: customerCode,
            measures: readings
        });
    } catch (error) {
        return res.status(500).json({
            error_code: "PROCESSING_ERROR",
            error_description: "Erro ao processar a listagem de leituras"
        });
    }
};
