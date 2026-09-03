import { Terms } from "../models/terms.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  translateObjectsFields,
  translateObjectFields,
} from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

// Add default terms and condition if none exists
export const ensureDefaultTerms = async () => {
  const count = await Terms.countDocuments();
  if (count === 0) {
    try {
      await Terms.create({
        title: "Default Terms", // Added title
        version: "v1.0",
        content: "Hello",
        status: "published",
        publishedBy: "System",
        publishedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      // If duplicate key error, check if default terms already exist
      if (error.code === 11000) {
        const existingDefault = await Terms.findOne({
          title: "Default Terms",
          version: "v1.0",
        });
        if (!existingDefault) {
          throw error; // Re-throw if it's not what we expected
        }
        // Default terms already exist, no need to create
      } else {
        throw error;
      }
    }
  }
};

// Get current published terms, latest draft, and history for a specific title
export const getTerms = asyncHandler(async (req, res) => {
  const { title } = req.query; // Expect title in query params
  const language = getLanguage(req);

  if (!title) {
    throw new ApiError(400, "Title is required to fetch terms");
  }

  const current = await Terms.findOne({ title, status: "published" }).sort({
    publishedAt: -1,
  });
  const draft = await Terms.findOne({ title, status: "draft" }).sort({
    updatedAt: -1,
  });
  const history = await Terms.find({ title, status: "published" }).sort({
    publishedAt: -1,
  });

  // Translate terms if language is not English
  let translatedCurrent = null,
    translatedDraft = null,
    translatedHistory = [];

  if (language !== "en") {
    const fieldsToTranslate = ["title", "content"];

    if (current) {
      const plainCurrent = current.toJSON();
      translatedCurrent = await translateObjectFields(
        plainCurrent,
        fieldsToTranslate,
        language
      );
    }

    if (draft) {
      const plainDraft = draft.toJSON();
      translatedDraft = await translateObjectFields(
        plainDraft,
        fieldsToTranslate,
        language
      );
    }

    if (history.length > 0) {
      const plainHistory = history.map((term) => term.toJSON());
      translatedHistory = await translateObjectsFields(
        plainHistory,
        fieldsToTranslate,
        language
      );
    }
  } else {
    translatedCurrent = current ? current.toJSON() : null;
    translatedDraft = draft ? draft.toJSON() : null;
    translatedHistory = history.map((term) => term.toJSON());
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        current: translatedCurrent,
        draft: translatedDraft,
        history: translatedHistory,
      },
      "Terms fetched successfully"
    )
  );
});

// Save or update draft for a specific title
export const saveDraft = asyncHandler(async (req, res) => {
  const { title, content, version } = req.body;

  if (!title || !version) {
    throw new ApiError(400, "Title and version are required for draft");
  }

  // Check if a document with this title and version already exists (regardless of status)
  const existingDocument = await Terms.findOne({ title, version });

  if (existingDocument) {
    if (existingDocument.status === "published") {
      throw new ApiError(
        409,
        "A published version with this title and version already exists. Please use a different version."
      );
    } else {
      // Update existing draft
      existingDocument.content = content;
      existingDocument.updatedAt = new Date();
      await existingDocument.save();
      return res
        .status(200)
        .json(
          new ApiResponse(200, existingDocument, "Draft updated successfully")
        );
    }
  }

  // Create new draft
  const draft = await Terms.create({
    title,
    version,
    content,
    status: "draft",
    updatedAt: new Date(),
  });

  res.status(201).json(new ApiResponse(201, draft, "Draft saved successfully"));
});

// Publish terms (creates new published version for a specific title)
export const publishTerms = asyncHandler(async (req, res) => {
  const { title, content, version, publishedBy } = req.body;
  if (!title || !version) {
    throw new ApiError(400, "Title and version are required for publishing");
  }

  // Check if this title and version combination already exists
  const existingDocument = await Terms.findOne({ title, version });
  if (existingDocument && existingDocument.status === "published") {
    throw new ApiError(
      409,
      "A published version with this title and version already exists"
    );
  }

  // Delete existing drafts for this title and version
  await Terms.deleteMany({ title, version, status: "draft" });

  const published = await Terms.create({
    title,
    version,
    content,
    status: "published",
    publishedBy,
    publishedAt: new Date(),
    updatedAt: new Date(),
  });
  res
    .status(201)
    .json(new ApiResponse(201, published, "Terms published successfully"));
});

// Restore a previous version as draft for a specific title
export const restoreVersion = asyncHandler(async (req, res) => {
  const { version } = req.params;
  const { title } = req.query; // Expect title in query params
  if (!title) {
    throw new ApiError(400, "Title is required to restore a version");
  }
  const prev = await Terms.findOne({ title, version, status: "published" });
  if (!prev)
    throw new ApiError(
      404,
      "Published version not found for the given title and version"
    );

  // Check if a draft for this title already exists, and handle (e.g., disallow, or overwrite)
  const existingDraft = await Terms.findOne({ title, status: "draft" });
  if (existingDraft) {
    // Option 1: Disallow - throw new ApiError(409, "A draft for this title already exists. Publish or delete it first.");
    // Option 2: Overwrite (or update) - for simplicity, let's create a new versioned draft
    // Or, simply delete the old draft:
    // await Terms.deleteOne({ _id: existingDraft._id });
  }

  const draft = await Terms.create({
    title,
    version: `${version}-restored-draft-${Date.now()}`,
    content: prev.content,
    status: "draft",
    updatedAt: new Date(),
  });
  res
    .status(201)
    .json(new ApiResponse(201, draft, "Version restored as draft"));
});

// Delete a version for a specific title
export const deleteVersion = asyncHandler(async (req, res) => {
  const { version } = req.params;
  const { title } = req.query; // Expect title in query params
  if (!title) {
    throw new ApiError(400, "Title is required to delete a version");
  }
  const deleted = await Terms.findOneAndDelete({ title, version });
  if (!deleted)
    throw new ApiError(404, "Version not found for the given title");
  res
    .status(200)
    .json(new ApiResponse(200, deleted, "Version deleted successfully"));
});

// Get all term documents (irrespective of title or status)
export const getAllTermDocuments = asyncHandler(async (req, res) => {
  const language = getLanguage(req);

  const allTermsData = await Terms.find({}).sort({ title: 1, updatedAt: -1 });

  // Convert to plain objects
  const plainTerms = allTermsData.map((term) => term.toJSON());

  let allTerms;
  // Translate terms if language is not English
  if (language !== "en" && plainTerms.length > 0) {
    const fieldsToTranslate = ["title", "content"];
    allTerms = await translateObjectsFields(
      plainTerms,
      fieldsToTranslate,
      language
    );
  } else {
    allTerms = plainTerms;
  }

  // Returns an empty array if no terms are found, which is appropriate for this type of query.
  res
    .status(200)
    .json(
      new ApiResponse(200, allTerms, "All terms documents fetched successfully")
    );
});


export const getLiveTerms = asyncHandler(async (req, res) => {
    const liveTerms = await Terms.find({ status: "published" }).sort({ publishedAt: -1 });
    
    if (!liveTerms || liveTerms.length === 0) {
        throw new ApiError(404, "No live terms found");
    }

    const language = getLanguage(req);
    let translatedLiveTerms;

    // Convert to plain objects
    const plainLiveTerms = liveTerms.map((term) => term.toJSON());

    if (language !== 'en') {
        const fieldsToTranslate = ['title', 'content'];
        translatedLiveTerms = await translateObjectsFields(plainLiveTerms, fieldsToTranslate, language);
    } else {
        translatedLiveTerms = plainLiveTerms;
    }

    res.status(200).json(new ApiResponse(200, translatedLiveTerms, "Live terms fetched successfully"));
});

// Create new terms document (always starts as v1.0 draft)
export const createTerms = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  // Check if any version of this title already exists
  const existingTerm = await Terms.findOne({ title });
  if (existingTerm) {
    throw new ApiError(
      409,
      "A terms document with this title already exists. Use update instead."
    );
  }

  const newTerms = await Terms.create({
    title,
    version: "v1.0",
    content,
    status: "draft",
    updatedAt: new Date(),
  });

  res
    .status(201)
    .json(new ApiResponse(201, newTerms, "Terms created successfully"));
});

// Update existing terms document (creates new draft version)
export const updateTerms = asyncHandler(async (req, res) => {
  const { title, content, baseVersion } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  // Find the base version (usually the latest published version)
  const baseTerms = await Terms.findOne({
    title,
    version: baseVersion || (await getLatestVersion(title)),
  });

  if (!baseTerms) {
    throw new ApiError(404, "Base terms document not found");
  }

  // Generate new version number
  const newVersion = await generateNextVersion(title);

  // Delete any existing drafts for this title to avoid conflicts
  await Terms.deleteMany({ title, status: "draft" });

  // Create new draft version
  const updatedTerms = await Terms.create({
    title,
    version: newVersion,
    content,
    status: "draft",
    updatedAt: new Date(),
  });

  res
    .status(201)
    .json(new ApiResponse(201, updatedTerms, "Terms updated successfully"));
});

// Helper function to get the latest version for a title
const getLatestVersion = async (title) => {
  const latestTerm = await Terms.findOne({ title }).sort({ version: -1 });
  return latestTerm ? latestTerm.version : "v1.0";
};

// Helper function to generate next version number
const generateNextVersion = async (title) => {
  const allVersions = await Terms.find({ title }).select("version");

  if (allVersions.length === 0) {
    return "v1.0";
  }

  // Extract version numbers and find the highest
  const versionNumbers = allVersions
    .map((term) => {
      const versionStr = term.version.replace(/^v/, "");
      return parseFloat(versionStr);
    })
    .filter((num) => !isNaN(num));

  const maxVersion = Math.max(...versionNumbers);
  return `v${(maxVersion + 0.1).toFixed(1)}`;
};

