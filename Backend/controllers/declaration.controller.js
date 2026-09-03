import { Declaration } from "../models/declaration.model.js";
import { Adventure } from "../models/adventure.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { translateObjectsFields, translateObjectFields } from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

// Add default declaration if none exists
export const ensureDefaultDeclaration = async () => {
    const count = await Declaration.countDocuments();
    if (count === 0) {
        try {
            await Declaration.create({
                title: "Default Declaration",
                version: "v1.0",
                content: "Default declaration content"
            });
        } catch (error) {
            // If duplicate key error, check if default declaration already exist
            if (error.code === 11000) {
                const existingDefault = await Declaration.findOne({ title: "Default Declaration", version: "v1.0" });
                if (!existingDefault) {
                    throw error; // Re-throw if it's not what we expected
                }
                // Default declaration already exists, no need to create
            } else {
                throw error;
            }
        }
    }
};

// Get all declarations
export const getAllDeclarations = asyncHandler(async (req, res) => {
    const language = getLanguage(req);
    
    const declarationsData = await Declaration.find({}).sort({ createdAt: -1 }).populate('adventures');
    
    // Convert to plain objects
    const plainDeclarations = declarationsData.map(declaration => declaration.toJSON());
    
    let declarations;
    // Translate declaration fields if language is not English
    if (language !== 'en' && plainDeclarations.length > 0) {
        const fieldsToTranslate = ['title', 'content'];
        declarations = await translateObjectsFields(plainDeclarations, fieldsToTranslate, language);
    } else {
        declarations = plainDeclarations;
    }
    
    res.status(200).json(new ApiResponse(200, declarations, "Declarations fetched successfully"));
});

// Get declaration by ID
export const getDeclarationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const language = getLanguage(req);
    
    const declarationData = await Declaration.findById(id).populate('adventures');
    if (!declarationData) {
        throw new ApiError(404, "Declaration not found");
    }
    
    // Convert to plain object
    const plainDeclaration = declarationData.toJSON();
    
    let declaration;
    // Translate declaration fields if language is not English
    if (language !== 'en') {
        const fieldsToTranslate = ['title', 'content'];
        declaration = await translateObjectFields(plainDeclaration, fieldsToTranslate, language);
    } else {
        declaration = plainDeclaration;
    }
    
    res.status(200).json(new ApiResponse(200, declaration, "Declaration fetched successfully"));
});

// Get declarations by title and version
export const getDeclarationByTitleAndVersion = asyncHandler(async (req, res) => {
    const { title, version } = req.query;
    const language = getLanguage(req);
    
    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    
    let query = { title };
    if (version) {
        query.version = version;
    }
    
    const declarationsData = await Declaration.find(query).sort({ createdAt: -1 }).populate('adventures');
    
    // Convert to plain objects
    const plainDeclarations = declarationsData.map(declaration => declaration.toJSON());
    
    let declarations;
    // Translate declaration fields if language is not English
    if (language !== 'en' && plainDeclarations.length > 0) {
        const fieldsToTranslate = ['title', 'content'];
        declarations = await translateObjectsFields(plainDeclarations, fieldsToTranslate, language);
    } else {
        declarations = plainDeclarations;
    }
    
    res.status(200).json(new ApiResponse(200, declarations, "Declarations fetched successfully"));
});

// Get declarations by adventure ID
export const getDeclarationsByAdventureId = asyncHandler(async (req, res) => {
    const { adventureId } = req.params;
    const language = getLanguage(req);
    
    if (!adventureId) {
        throw new ApiError(400, "Adventure ID is required");
    }
      const declarationsData = await Declaration.find({ 
        adventures: adventureId 
    }).sort({ createdAt: -1 }).populate('adventures');
    
    // Convert to plain objects
    const plainDeclarations = declarationsData.map(declaration => declaration.toJSON());
    
    let declarations;
    // Translate declaration fields if language is not English
    if (language !== 'en' && plainDeclarations.length > 0) {
        const fieldsToTranslate = ['title', 'content'];
        declarations = await translateObjectsFields(plainDeclarations, fieldsToTranslate, language);
    } else {
        declarations = plainDeclarations;
    }
    
    res.status(200).json(new ApiResponse(200, declarations, "Declarations fetched successfully"));
});

// Create new declaration
export const createDeclaration = asyncHandler(async (req, res) => {
    const { title, version, content, adventures } = req.body;
    
    if (!title || !version || !content) {
        throw new ApiError(400, "Title, version, and content are required");
    }
    
    // Validate adventures array if provided
    if (adventures && (!Array.isArray(adventures) || adventures.some(id => !id))) {
        throw new ApiError(400, "Adventures must be an array of valid adventure IDs");
    }
    
    // Validate that all adventure IDs exist
    if (adventures && adventures.length > 0) {
        const existingAdventures = await Adventure.find({ _id: { $in: adventures } });
        if (existingAdventures.length !== adventures.length) {
            throw new ApiError(400, "One or more adventure IDs are invalid");
        }
    }
    
    // Check if declaration with same title and version already exists
    const existingDeclaration = await Declaration.findOne({ title, version });
    if (existingDeclaration) {
        throw new ApiError(409, "Declaration with this title and version already exists");
    }
      const declaration = await Declaration.create({
        title,
        version,
        content,
        adventures: adventures || []
    });
    
    // Populate adventures for the response
    await declaration.populate('adventures');
    
    res.status(201).json(new ApiResponse(201, declaration, "Declaration created successfully"));
});

// Update declaration
export const updateDeclaration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, version, content, adventures } = req.body;
    
    const declaration = await Declaration.findById(id);
    if (!declaration) {
        throw new ApiError(404, "Declaration not found");
    }
    
    // Validate adventures array if provided
    if (adventures && (!Array.isArray(adventures) || adventures.some(id => !id))) {
        throw new ApiError(400, "Adventures must be an array of valid adventure IDs");
    }
    
    // Validate that all adventure IDs exist
    if (adventures && adventures.length > 0) {
        const existingAdventures = await Adventure.find({ _id: { $in: adventures } });
        if (existingAdventures.length !== adventures.length) {
            throw new ApiError(400, "One or more adventure IDs are invalid");
        }
    }
    
    // Check if another declaration with same title and version exists (excluding current one)
    if (title && version) {
        const existingDeclaration = await Declaration.findOne({ 
            title, 
            version, 
            _id: { $ne: id } 
        });
        if (existingDeclaration) {
            throw new ApiError(409, "Another declaration with this title and version already exists");
        }
    }
      // Update fields if provided
    if (title) declaration.title = title;
    if (version) declaration.version = version;
    if (content) declaration.content = content;
    if (adventures !== undefined) declaration.adventures = adventures;
    
    await declaration.save();
    
    // Populate adventures for the response
    await declaration.populate('adventures');
    
    res.status(200).json(new ApiResponse(200, declaration, "Declaration updated successfully"));
});

// Delete declaration
export const deleteDeclaration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const declaration = await Declaration.findByIdAndDelete(id);
    if (!declaration) {
        throw new ApiError(404, "Declaration not found");
    }
    
    res.status(200).json(new ApiResponse(200, declaration, "Declaration deleted successfully"));
});

// Get latest declaration by title
export const getLatestDeclarationByTitle = asyncHandler(async (req, res) => {
    const { title } = req.params;
    const language = getLanguage(req);
    
    const declarationData = await Declaration.findOne({ title }).sort({ createdAt: -1 }).populate('adventures');
    if (!declarationData) {
        throw new ApiError(404, "No declaration found with this title");
    }
    
    // Convert to plain object
    const plainDeclaration = declarationData.toJSON();
    
    let declaration;
    // Translate declaration fields if language is not English
    if (language !== 'en') {
        const fieldsToTranslate = ['title', 'content'];
        declaration = await translateObjectFields(plainDeclaration, fieldsToTranslate, language);
    } else {
        declaration = plainDeclaration;
    }
    
    res.status(200).json(new ApiResponse(200, declaration, "Latest declaration fetched successfully"));
});

