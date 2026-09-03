import { Sponsor } from '../models/sponsor.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Create sponsor
export const createSponsor = asyncHandler(async (req, res) => {
  const { name, website, description } = req.body;
  if (!name) throw new ApiError(400, 'Name is required');

  let logoUrl = null;
  let logoPublicId = null;
  if (req.file) {
    const uploadRes = await uploadOnCloudinary(req.file.path);
    if (uploadRes) {
      logoUrl = uploadRes.secure_url;
      logoPublicId = uploadRes.public_id;
    }
  }

  const sponsor = await Sponsor.create({ name, website, description, logoUrl, logoPublicId });
  res.status(201).json(new ApiResponse(201, sponsor, 'Sponsor created'));
});

// List sponsors
export const listSponsors = asyncHandler(async (req, res) => {
  const sponsors = await Sponsor.find({}).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, sponsors, 'Sponsors fetched'));
});

// Update sponsor
export const updateSponsor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) throw new ApiError(404, 'Sponsor not found');

  const { name, website, description, isActive } = req.body;
  if (name !== undefined) sponsor.name = name;
  if (website !== undefined) sponsor.website = website;
  if (description !== undefined) sponsor.description = description;
  if (isActive !== undefined) sponsor.isActive = isActive;

  if (req.file) {
    // delete old logo if exists
    if (sponsor.logoPublicId) {
      await deleteFromCloudinary(sponsor.logoPublicId);
    }
    const uploadRes = await uploadOnCloudinary(req.file.path);
    if (uploadRes) {
      sponsor.logoUrl = uploadRes.secure_url;
      sponsor.logoPublicId = uploadRes.public_id;
    }
  }

  await sponsor.save();
  res.status(200).json(new ApiResponse(200, sponsor, 'Sponsor updated'));
});

// Delete sponsor
export const deleteSponsor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) throw new ApiError(404, 'Sponsor not found');
  if (sponsor.logoPublicId) await deleteFromCloudinary(sponsor.logoPublicId);
  await sponsor.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, 'Sponsor deleted'));
});
