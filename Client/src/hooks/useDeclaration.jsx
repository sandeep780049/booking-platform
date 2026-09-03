import { useState, useEffect } from "react";
import {
  getAllDeclarations,
  createDeclaration,
  updateDeclaration,
  deleteDeclaration,
} from "../Api/declaration.api";

export function useDeclaration() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        const data = await getAllDeclarations();
        setDeclarations(data);
      } catch (err) {
        console.error("Error fetching declarations:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, []);

  const handleCreateDeclaration = async (declaration) => {
    try {
      const newDeclaration = await createDeclaration(declaration);
      setDeclarations((prev) => [...prev, newDeclaration]);
    } catch (err) {
      console.error("Error creating declaration:", err);
      throw err;
    }
  };

  const handleUpdateDeclaration = async (id, updatedDeclaration) => {
    try {
      const updated = await updateDeclaration(id, updatedDeclaration);
      setDeclarations((prev) =>
        prev.map((declaration) =>
          declaration._id === id ? updated : declaration
        )
      );
    } catch (err) {
      console.error("Error updating declaration:", err);
      throw err;
    }
  };

  const handleDeleteDeclaration = async (id) => {
    try {
      await deleteDeclaration(id);
      setDeclarations((prev) =>
        prev.filter((declaration) => declaration._id !== id)
      );
    } catch (err) {
      console.error("Error deleting declaration:", err);
      throw err;
    }
  };

  return {
    declarations,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      getAllDeclarations()
        .then((data) => setDeclarations(data))
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    },
    createDeclaration: handleCreateDeclaration,
    updateDeclaration: handleUpdateDeclaration,
    deleteDeclaration: handleDeleteDeclaration,
  };
}
