import { asyncHandler } from "../utils/asyncHandler.js";
import { Location } from "../models/location.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createLocation = asyncHandler(async (req, res) => {
    const { name, description, location, address, instructorLimit } = req.body;

    if (!name || !description || !location || !address) {
        throw new ApiError(400, "All fields are required");
    }

    const newLocation = await Location.create({
        name,
        description,
        location,
        address,
        instructorLimit: instructorLimit || null,
    });

    return res.status(201).json(
        new ApiResponse(201, newLocation, "Location created successfully")
    );
});

export const updateLocation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, location, address, instructorLimit } = req.body;

    if (!id) {
        throw new ApiError(400, "Location ID is required");
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        id,
        { name, description, location, address, instructorLimit: instructorLimit !== undefined ? instructorLimit : undefined },
        { new: true }
    );

    if (!updatedLocation) {
        throw new ApiError(404, "Location not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedLocation, "Location updated successfully")
    );
});

export const getLocationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Location ID is required");
    }

    const location = await Location.findById(id);

    if (!location) {
        throw new ApiError(404, "Location not found");
    }

    return res.status(200).json(
        new ApiResponse(200, location, "Location fetched successfully")
    );
});

export const getLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({});

    return res.status(200).json(
        new ApiResponse(200, locations, "All locations fetched successfully")
    );
});

export const deleteLocation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Location ID is required");
    }

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
        throw new ApiError(404, "Location not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedLocation, "Location deleted successfully")
    );
});

export const searchLocation = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new ApiError(400, "Search query is required");
    }

    const locations = await Location.find({
        name: { $regex: query, $options: "i" },
    });

    return res.status(200).json(
        new ApiResponse(200, locations, "Locations fetched successfully")
    );
});