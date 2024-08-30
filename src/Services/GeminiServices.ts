import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import Reading from '../Models/reading';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);


export const processImage = async (base64Image: string) => {
    const measureValue = Math.floor(Math.random() * 1000);

    const reading = new Reading({
        measure_uuid: uuidv4(),
        measure_datetime: new Date(),
        measure_type: 'WATER',
        has_confirmed: false,
        image_url: "https://tm.ibxk.com.br/2023/09/15/15154205365257.jpg?ims=750x",
        measure_value: measureValue
    });

    await reading.save();

    return {
        image_url: reading.image_url,
        measure_value: reading.measure_value,
        measure_uuid: reading.measure_uuid
    }
};
export const checkExistingReading = async (customer_code: string, measure_type: string, measure_datetime: string) => {
    const reading = await Reading.findOne({
        customer_code,
        measure_type,
        measure_datetime: new Date(measure_datetime)
    });

    return reading !== null;
};


export const confirmReading = async (measure_uuid: string, confirmed_value: number) => {
    const reading = await Reading.findOneAndUpdate(
        { measure_uuid },
        { measure_value: confirmed_value, has_confirmed: true },
        { new: true }
    );

    if (!reading) {
        throw new Error('Leitura não encontrada');
    }

    return reading;
};
export const findReadingByUUID = async (measure_uuid: string) => {
        return await Reading.findOne({ measure_uuid });
};


export const listReading = async (customerCode: string, measureType?: string) => {
    const filter: any = { customer_code: customerCode };
    if(measureType) {
        filter.measure_type = measureType;
    }

    const readings = await Reading.find(filter);
    
    return readings.map(reading => ({
        measure_uuid: reading.measure_uuid,
        measure_datetime: reading.measure_datetime,
        measure_type: reading.measure_type,
        has_confirmed: reading.has_confirmed,
        image_url: reading.image_url,
        measure_value: reading.measure_value
    }));
};