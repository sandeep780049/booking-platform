"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Search, Download, Eye, Trash2, FileText, X, Percent, CheckCircle, XCircle, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "../../../components/ui/dialog"
import { useInstructors } from "../../../hooks/useInstructor"
import { toast } from "sonner"

const statusVariant = (s) =>
    s === "verified" ? "default" : s === "pending" ? "outline" : "secondary"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

export default function InstructorsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedInstructor, setSelectedInstructor] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [commissionEditing, setCommissionEditing] = useState(null) // { id, value }
    const commissionInputRef = useRef(null)

    const { instructors, page, setPage, deleteInstructorById, totalPages, changeDocumentStatus, updateInstructorData } =
        useInstructors(debouncedSearch, statusFilter)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400)
        return () => clearTimeout(t)
    }, [searchTerm])

    useEffect(() => {
        setPage((p) => (p !== 1 ? 1 : p))
    }, [debouncedSearch, statusFilter, setPage])

    const openModal = (instructor) => {
        setSelectedInstructor(instructor)
        setModalOpen(true)
    }

    const handleDocumentStatus = async (status) => {
        const id = toast.loading("Updating status…")
        try {
            await changeDocumentStatus(selectedInstructor.instructor._id, status)
            setSelectedInstructor((prev) => ({
                ...prev,
                instructor: { ...prev.instructor, documentVerified: status },
            }))
            toast.success("Status updated", { id })
        } catch {
            toast.error("Failed to update status", { id })
        }
    }

    const openCommissionInline = (instructor) => {
        setCommissionEditing({
            id: instructor.instructor._id,
            value: instructor.instructor.commissionPercentage ?? 20,
            instructorRowId: instructor._id,
        })
        setTimeout(() => commissionInputRef.current?.focus(), 50)
    }

    const saveCommission = async () => {
        if (!commissionEditing) return
        const pct = Number(commissionEditing.value)
        if (isNaN(pct) || pct < 0 || pct > 100) {
            toast.error("Enter a valid percentage (0–100)")
            return
        }
        const id = toast.loading("Saving commission…")
        try {
            await updateInstructorData(commissionEditing.id, { commissionPercentage: pct })
            toast.success(`Commission set to ${pct}%`, { id })
            setCommissionEditing(null)
        } catch {
            toast.error("Failed to save", { id })
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight">Instructors</h2>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search instructors…"
                        className="w-full sm:w-[280px] pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Adventure</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {instructors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {debouncedSearch || statusFilter !== "all"
                                            ? "No instructors found"
                                            : "No instructors yet."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                instructors.map((instructor) => {
                                    const isEditingThis = commissionEditing?.instructorRowId === instructor._id
                                    return (
                                        <TableRow key={instructor._id}>
                                            <TableCell className="font-medium">{instructor.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{instructor.email}</TableCell>
                                            <TableCell>{instructor?.instructor?.adventure?.name ?? "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(instructor?.instructor?.documentVerified)}>
                                                    {capitalize(instructor?.instructor?.documentVerified)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {isEditingThis ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="relative w-20">
                                                            <Input
                                                                ref={commissionInputRef}
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                className="h-8 pr-6 text-sm"
                                                                value={commissionEditing.value}
                                                                onChange={(e) =>
                                                                    setCommissionEditing((p) => ({ ...p, value: e.target.value }))
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") saveCommission()
                                                                    if (e.key === "Escape") setCommissionEditing(null)
                                                                }}
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={saveCommission}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setCommissionEditing(null)}>
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="relative group inline-flex">
                                                        <button
                                                            onClick={() => openCommissionInline(instructor)}
                                                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer"
                                                        >
                                                            <Percent className="h-3.5 w-3.5" />
                                                            {instructor?.instructor?.commissionPercentage ?? 20}%
                                                        </button>
                                                        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-xs text-white opacity-0 transition-none group-hover:opacity-100">
                                                            Click to edit
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openModal(instructor)} title="View documents">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => deleteInstructorById(instructor._id)}
                                                        title="Delete instructor"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Next
                    </Button>
                </div>
            )}

            {/* Instructor Document Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
                    {selectedInstructor && (
                        <>
                            {/* Modal Header */}
                            <DialogHeader className="px-6 pt-6 pb-4 border-b">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <DialogTitle className="text-lg font-semibold">{selectedInstructor.name}</DialogTitle>
                                        <p className="text-sm text-muted-foreground mt-0.5">{selectedInstructor.email}</p>
                                    </div>
                                    <Badge variant={statusVariant(selectedInstructor.instructor.documentVerified)}>
                                        {capitalize(selectedInstructor.instructor.documentVerified)}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            {/* Documents */}
                            <div className="px-6 py-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Submitted Documents</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Certificate", url: selectedInstructor.instructor.certificate },
                                        { label: "Government ID", url: selectedInstructor.instructor.governmentId },
                                    ].map(({ label, url }) => (
                                        <div key={label} className="rounded-lg border overflow-hidden bg-muted/30">
                                            <div className="h-36 bg-muted relative">
                                                <img
                                                    src={url || "/placeholder.svg"}
                                                    alt={label}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="px-3 py-2.5 flex items-center justify-between">
                                                <p className="text-sm font-medium">{label}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => window.open(url || "/placeholder.svg", "_blank")}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick info */}
                                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                                        <p className="text-xs text-muted-foreground mb-0.5">Adventure</p>
                                        <p className="font-medium">{selectedInstructor.instructor.adventure?.name ?? "—"}</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                                        <p className="text-xs text-muted-foreground mb-0.5">Platform Fee</p>
                                        <p className="font-medium">{selectedInstructor.instructor.commissionPercentage ?? 20}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/20">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive/40 hover:bg-destructive/5"
                                    onClick={() => handleDocumentStatus("rejected")}
                                >
                                    <XCircle className="h-4 w-4 mr-1.5" />
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={selectedInstructor.instructor.documentVerified === "verified"}
                                    onClick={() => handleDocumentStatus("verified")}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    {selectedInstructor.instructor.documentVerified === "verified" ? "Already Approved" : "Approve Documents"}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
