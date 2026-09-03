import moongoose from 'mongoose';

const locationSchema = new moongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    address: {
        type: String,
        required: true,
    },
    instructorLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    waitingList: [
        {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'Instructor',
        }
    ],
}, {
    timestamps: true,
});

export const Location = moongoose.model('Location', locationSchema);