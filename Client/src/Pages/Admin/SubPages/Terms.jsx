"use client"

import { useState, useEffect } from "react" // Import useEffect
import { motion } from "framer-motion"
import { Search, Edit, FileText, Save, Trash2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"
import { getAllTermDocuments, getAllTerms, createTerms, updateTerms, publishTerms, deleteTermsVersion } from "../../../Api/terms.api.js" // Import new API functions

export default function Dash_Terms() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [createMode, setCreateMode] = useState(false) // New state for creating terms
  const [termContent, setTermContent] = useState("")
  const [originalContent, setOriginalContent] = useState("") // Store original content for comparison
  const [terms, setTerms] = useState([]) // State for API fetched terms
  const [isLoading, setIsLoading] = useState(true) // Loading state for the terms list
  const [error, setError] = useState(null) // Error state for the terms list
  const [isContentLoading, setIsContentLoading] = useState(false) // Loading state for term content
  const [contentError, setContentError] = useState(null) // Error state for term content
  const [isSaving, setIsSaving] = useState(false) // Saving state
  const [showNewTermForm, setShowNewTermForm] = useState(false) // State for new term form
  const [newTermTitle, setNewTermTitle] = useState("") // State for new term title
  const [successMessage, setSuccessMessage] = useState("") // Success message state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // State for delete confirmation dialog
  const [isDeleting, setIsDeleting] = useState(false) // Deleting state
  const [isEditingPublished, setIsEditingPublished] = useState(false) // Track if editing a published term

  useEffect(() => {
    const fetchTermsList = async () => {
      try {
        setIsLoading(true)
        const data = await getAllTermDocuments()
        setTerms(data || [])
        setError(null)
      } catch (err) {
        console.error("Failed to fetch terms list:", err)
        setError("Failed to load terms list. Please try again later.")
        setTerms([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTermsList()
  }, [])

  // Filter terms based on search term
  const filteredTerms = terms.filter((term) => {
    return term.title?.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const handleSelectTerm = async (term) => {
    setSelectedTerm(term);
    setEditMode(false);
    setCreateMode(false); // Exit create mode when selecting a term
    setIsEditingPublished(false);
    setContentError(null); // Clear any previous errors

    if (term) {
      setIsContentLoading(true);
      try {
        const termDetails = await getAllTerms(term.title);

        // Determine which content to show based on term status
        let content = "";
        if (term.status === "draft") {
          // For draft terms, show the draft content
          content = termDetails?.draft?.content || "";
        } else {
          // For published terms, show the published content
          content = termDetails?.current?.content || "";
        }

        // If no content was found, show a message
        if (content === "") {
          setContentError("No content available for this term.");
        }

        setTermContent(content);
        setOriginalContent(content);
      } catch (err) {
        console.error(`Failed to fetch content for ${term.title}:`, err);
        setContentError(err?.response?.data?.message || "Failed to load term content. Please try again.");
        setTermContent("");
        setOriginalContent("");
      } finally {
        setIsContentLoading(false);
      }
    } else {
      setTermContent("");
      setOriginalContent("");
    }
  }
  // Edit button handler
  const handleEdit = async () => {
    if (!selectedTerm) return;
    setEditMode(true);
    setIsEditingPublished(selectedTerm.status === "published");
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!selectedTerm) return;
    setIsSaving(true);
    setContentError(null);
    try {
      // Use updateTerms for both published and draft terms
      const result = await updateTerms(selectedTerm.title, termContent, selectedTerm.version);

      setEditMode(false);
      setSuccessMessage("Changes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      // Refresh terms list and reselect
      const data = await getAllTermDocuments();
      setTerms(data || []);
      const updated = data.find(term => term.title === selectedTerm.title);
      if (updated) {
        setSelectedTerm(updated);
        setTermContent(termContent); // Keep the current content
        setOriginalContent(termContent); // Update original content for comparison
      }
    } catch (err) {
      console.error("Failed to save changes:", err);
      setContentError(err?.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCreateNewTerm = async () => {
    if (!newTermTitle.trim()) {
      setContentError("Please enter a title for the new term");
      return;
    }

    if (!termContent.trim()) {
      setContentError("Please enter content for the new term");
      return;
    }

    try {
      setIsSaving(true);
      await createTerms(newTermTitle.trim(), termContent.trim());

      // Refresh the terms list
      const data = await getAllTermDocuments();
      setTerms(data || []);

      // Reset form state
      setSuccessMessage("New term created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Find and select the newly created term
      const newTerm = data.find(term => term.title.toLowerCase() === newTermTitle.trim().toLowerCase());
      if (newTerm) {
        setCreateMode(false);
        await handleSelectTerm(newTerm); // Use await to ensure content is loaded
      }
    } catch (err) {
      console.error("Failed to create new term:", err);
      setContentError(err?.response?.data?.message || "Failed to create new term. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }
  const handlePublishTerm = async () => {
    if (!selectedTerm || !termContent) return;
    try {
      setIsSaving(true);
      await publishTerms(selectedTerm.title, termContent, selectedTerm.version, "Admin");
      // Get updated term list
      const data = await getAllTermDocuments();
      setTerms(data || []);

      // Find the newly published term in the updated list
      const publishedTerm = data.find(term =>
        term.title === selectedTerm.title &&
        term.status === "published"
      );

      if (publishedTerm) {
        setSelectedTerm(publishedTerm);
      } else {
        // If can't find the exact published term, just update status locally
        setSelectedTerm({ ...selectedTerm, status: "published" });
      }

      setEditMode(false);
      setSuccessMessage("Term published successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to publish term:", err);
      setContentError(err?.response?.data?.message || "Failed to publish term. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTerm = async () => {
    if (!selectedTerm) return;
    try {
      setIsDeleting(true);
      setContentError(null); // Clear any existing errors

      await deleteTermsVersion(selectedTerm.title, selectedTerm.version);

      setSuccessMessage("Term deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the terms list
      const data = await getAllTermDocuments();
      setTerms(data || []);

      // Reset selection state
      setSelectedTerm(null);
      setTermContent("");
      setOriginalContent("");
      setEditMode(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete term:", err);
      setContentError(err?.response?.data?.message || "Failed to delete term. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }

  // Function to enter create mode
  const handleEnterCreateMode = () => {
    setSelectedTerm(null);
    setCreateMode(true);
    setEditMode(false);
    setNewTermTitle("");
    setTermContent("");
    setContentError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }} className="space-y-6"
    >
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Terms & Conditions</h2>        <div className="flex items-center space-x-2">
          <Button onClick={handleEnterCreateMode}>
            <FileText className="mr-2 h-4 w-4" />
            Add New Terms
          </Button>
        </div>      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Terms</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete "{selectedTerm?.title}" (Version {selectedTerm?.version})?
              </p>
              <p className="text-sm text-red-500 font-medium">
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTerm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search terms..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center">Loading terms...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  ) : filteredTerms.length === 0 && !searchTerm ? (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center">No terms documents found.</TableCell>
                    </TableRow>
                  ) : filteredTerms.length === 0 && searchTerm ? (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center">No terms matching your search.</TableCell>
                    </TableRow>
                  ) : (
                    filteredTerms.map((term) => (
                      <TableRow
                        key={term._id || term.id}
                        className={`cursor-pointer ${selectedTerm?._id === term._id || selectedTerm?.id === term.id ? "bg-muted/50" : ""}`}
                        onClick={() => handleSelectTerm(term)}
                      >                        <TableCell className="font-medium">{term.title}</TableCell>
                        <TableCell>{term.version}</TableCell><TableCell>
                          <Badge variant={term.status === "published" ? "default" : "secondary"}>
                            {term.status ? term.status.charAt(0).toUpperCase() + term.status.slice(1) : 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {createMode ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Create New Terms</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the title and content for the new terms document
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateNewTerm}
                      disabled={isSaving || !newTermTitle.trim() || !termContent.trim()}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Terms
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCreateMode(false);
                        setNewTermTitle("");
                        setTermContent("");
                        setContentError(null);
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={newTermTitle}
                      onChange={(e) => {
                        setNewTermTitle(e.target.value)
                        if (contentError) {
                          setContentError(null)
                        }
                      }}
                      placeholder="Enter terms title..."
                      disabled={isSaving}
                      className="mb-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      className="min-h-[400px] font-mono text-sm"
                      value={termContent}
                      onChange={(e) => {
                        setTermContent(e.target.value)
                        if (contentError) {
                          setContentError(null)
                        }
                      }}
                      placeholder="Enter terms content here..."
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {contentError && (
                  <p className="text-red-500 text-sm mt-4">{contentError}</p>
                )}
              </CardContent>
            </Card>
          ) : selectedTerm ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTerm.title}</h3>                    <p className="text-sm text-muted-foreground">
                      Version {selectedTerm.version} • Last updated on{" "}
                      {selectedTerm.updatedAt ? new Date(selectedTerm.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditMode(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </>) : (
                      <>
                        <Button variant="outline" onClick={handleEdit} disabled={isContentLoading}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        {selectedTerm.status === "draft" && (
                          <Button
                            onClick={handlePublishTerm}
                            disabled={isSaving || !termContent}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSaving ? "Publishing..." : "Publish"}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isSaving || isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>                {isContentLoading ? (
                  <div className="flex items-center justify-center min-h-[500px]">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Loading content...</p>
                    </div>
                  </div>) : contentError ? (
                    <div className="text-red-500 min-h-[500px] flex flex-col items-center justify-center">
                      <p className="mb-4">{contentError}</p>
                      <Button
                        variant="outline"
                        onClick={() => handleSelectTerm(selectedTerm)}
                        disabled={isContentLoading}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : editMode ? (
                    <Textarea
                      className="min-h-[500px] font-mono text-sm"
                      value={termContent}
                      onChange={(e) => setTermContent(e.target.value)}
                      disabled={isSaving}
                    />
                  ) : (
                  <div className="prose max-w-none dark:prose-invert min-h-[500px]">
                    {termContent ? (
                      <pre className="whitespace-pre-wrap text-sm">{termContent}</pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">No content available for this term.</p>
                    )}
                  </div>
                )}
                {/* Display saving error if any, distinct from content loading error */}
                {isSaving && contentError && !isContentLoading && (
                  <p className="text-red-500 text-sm mt-2">Error saving: {contentError}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border rounded-lg border-dashed">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No Terms Selected</h3>
                <p className="text-sm text-muted-foreground">Select a terms document from the list or click "Add New Terms"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

