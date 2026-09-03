import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  website: { type: String, trim: true },
  description: { type: String, trim: true },
  logoUrl: { type: String },
  logoPublicId: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Sponsor = mongoose.model('Sponsor', sponsorSchema);
