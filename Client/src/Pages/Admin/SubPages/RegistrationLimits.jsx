import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "../../../components/ui/card";
import { useRegistrationLimits } from "../../../hooks/useRegistrationLimits";
import { fetchAllAdventures } from "../../../Api/adventure.api";
import { LimitForm } from "./RegistrationLimits/LimitForm";
import { LimitsTable } from "./RegistrationLimits/LimitsTable";

export default function RegistrationLimits() {
    const {
        limits,
        isLoading,
        loadLimits,
        createLimit,
        updateLimit,
        deleteLimit,
        moveFromWaitlist,
    } = useRegistrationLimits();

    const [adventures, setAdventures] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ limit: "" });
    const [formData, setFormData] = useState({
        adventure: "",
        location: "",
        limit: "",
    });

    useEffect(() => {
        loadLimits();
        fetchAdventures();
    }, []);

    const fetchAdventures = async () => {
        try {
            const response = await fetchAllAdventures();
            setAdventures(response.data.adventures || []);
        } catch (error) {
            toast.error("Failed to fetch adventures");
        }
    };

    const handleAdventureChange = (adventureId) => {
        setFormData({ ...formData, adventure: adventureId, location: "" });
        const selectedAdventure = adventures.find((a) => a._id === adventureId);
        setLocations(selectedAdventure?.location || []);
    };

    const handleCreateLimit = async (e) => {
        e.preventDefault();

        if (!formData.adventure || !formData.location || !formData.limit) {
            toast.error("All fields are required");
            return;
        }

        if (formData.limit < 1) {
            toast.error("Limit must be at least 1");
            return;
        }

        setIsCreating(true);
        try {
            await createLimit({
                adventure: formData.adventure,
                location: formData.location,
                limit: parseInt(formData.limit),
            });
            setFormData({ adventure: "", location: "", limit: "" });
            setLocations([]);
        } catch (error) {
            toast.error(error.message || "Failed to create registration limit");
        } finally {
            setIsCreating(false);
        }
    };

    const handleStartEdit = (limit) => {
        setEditingId(limit._id);
        setEditFormData({ limit: limit.limit });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({ limit: "" });
    };

    const handleUpdateLimit = async (id) => {
        if (!editFormData.limit || editFormData.limit < 1) {
            toast.error("Limit must be at least 1");
            return;
        }

        try {
            await updateLimit(id, { limit: parseInt(editFormData.limit) });
            setEditingId(null);
            setEditFormData({ limit: "" });
        } catch (error) {
            toast.error(error.message || "Failed to update limit");
        }
    };

    const handleDeleteLimit = async (id) => {
        if (!confirm("Are you sure you want to delete this limit?")) {
            return;
        }

        try {
            await deleteLimit(id);
        } catch (error) {
            toast.error(error.message || "Failed to delete limit");
        }
    };

    const handleMoveFromWaitlist = async (limitId) => {
        try {
            await moveFromWaitlist(limitId);
        } catch (error) {
            toast.error(error.message || "Failed to move instructor");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-black">
                    Registration Limits
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    Manage instructor registration limits by adventure and location
                </p>
            </div>

            <LimitForm
                formData={formData}
                adventures={adventures}
                locations={locations}
                isCreating={isCreating}
                onFormChange={setFormData}
                onAdventureChange={handleAdventureChange}
                onSubmit={handleCreateLimit}
            />

            <LimitsTable
                limits={limits}
                editingId={editingId}
                editFormData={editFormData}
                onEditStart={handleStartEdit}
                onEditChange={setEditFormData}
                onEditSave={handleUpdateLimit}
                onEditCancel={handleCancelEdit}
                onDelete={handleDeleteLimit}
                onMoveFromWaitlist={handleMoveFromWaitlist}
            />
        </div>
    );
}
