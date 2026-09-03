import { getAllInstructors, deleteInstructor, changeDocumentStatusById, getInstructorById, updateInstructor } from "../Api/instructor.api";
import { useState, useEffect } from "react";

export function useInstructors(searchTerm = "", statusFilter = "all") {
    const [instructors, setInstructors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 10;

    const getProfile = async () => {
        setIsLoading(true);
        try {
            const res = await getAllInstructors({ page, limit, search: searchTerm, status: statusFilter });
            const payload = res?.data?.data ?? {};
            setInstructors(payload.instructors ?? []);
            setTotal(payload.total ?? 0);
            setTotalPages(payload.totalPages ?? 0);
            setError(null);
        } catch (err) {
            setError(err);
            setInstructors([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        getProfile();
    }, [page, searchTerm, statusFilter]);

    const deleteInstructorById = async (id) => {
        setIsLoading(true);
        try {
            await deleteInstructor(id);
            getProfile();
            setError(null);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const checkInstructorStatus = async (id) => {
        setIsLoading(true);
        try {
            const res = await getInstructorById(id)
            const payload = res?.data?.data;
            const instructorRecord = payload?.instructor?.[0]?.instructor;
            if (!instructorRecord) {
                return false;
            }
            if (instructorRecord.documentVerified === "pending") {
                return false;
            }
            else if (instructorRecord.documentVerified === "verified") {
                return true;
            }
        } catch (error) {
            console.error("Error fetching instructors:", error)
        }
        finally {
            setIsLoading(false);
        }
    }

    const changeDocumentStatus = async (id, status) => {
        setIsLoading(true);
        try {
            await changeDocumentStatusById(id, status);
            setInstructors((prevInstructors) =>
                prevInstructors.map((instructor) =>
                    instructor.instructor_id === id ? {
                        ...instructor, instructor: {
                            ...instructor.instructor,
                            documentVerified: status
                        }
                    } : instructor
                )
            );
            getProfile();
            setError(null);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const updateInstructorData = async (id, data) => {
        setIsLoading(true);
        try {
            await updateInstructor(id, data);

            // Optimistically update or re-fetch
            getProfile();
            setError(null);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    return { instructors, isLoading, getProfile, error, page, setPage, total, limit, deleteInstructorById, checkInstructorStatus, totalPages, changeDocumentStatus, updateInstructorData };
}