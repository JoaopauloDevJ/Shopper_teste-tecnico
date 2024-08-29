import { Schema, model, Document } from 'mongoose';

interface IReading extends Document {
    measure_uuid: string;
    measure_datetime: Date;
    measure_type: string;
    has_confirmed: boolean;
    image_url: string;
    measure_value: number;
}

const readingSchema = new Schema<IReading>({
    measure_uuid: { type: String, required: true, unique: true },
    measure_datetime: { type: Date, required: true },
    measure_type: { type: String, required: true },
    has_confirmed: { type: Boolean, default: false },
    image_url: { type: String, required: true },
    measure_value: { type: Number, required: true }
});

const Reading = model<IReading>('Leitura', readingSchema);

export default Reading;