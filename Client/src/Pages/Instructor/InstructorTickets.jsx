import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Plus, Clock, TicketIcon, FileText, Loader2, ChevronRight, Send, User, UserCog } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { useTranslation } from 'react-i18next'
import { toast } from "sonner"
import InstructorLayout from './InstructorLayout'
import { useTicket } from "../../hooks/useTicket"

export const InstructorTickets = () => {
    const { t } = useTranslation()
    const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [isTicketDetailDialogOpen, setIsTicketDetailDialogOpen] = useState(false)
    const [ticketDetailLoading, setTicketDetailLoading] = useState(false)
    const [newResponse, setNewResponse] = useState('')
    const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

    // Form state for new ticket
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: '',
        priority: 'medium'
    })
    const [attachments, setAttachments] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState({})

    const {
        tickets,
        loading,
        error,
        getUserTickets,
        createTicket,
        getTicketById,
        addTicketResponse,
        clearError,
    } = useTicket()

    // Fetch instructor tickets on component mount
    useEffect(() => {
        getUserTickets()
    }, [getUserTickets])

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            clearError()
        }
    }, [clearError])

    // Show error toast when error occurs
    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const handleOpenTicketDetail = async (ticket) => {
        setIsTicketDetailDialogOpen(true)
        setTicketDetailLoading(true)
        try {
            const result = await getTicketById(ticket._id)
            if (result.success) {
                setSelectedTicket(result.data.data)
            } else {
                toast.error(result.error || 'Failed to load ticket details')
                setIsTicketDetailDialogOpen(false)
            }
        } catch (error) {
            toast.error('Failed to load ticket details')
            console.error('Error loading ticket details:', error)
            setIsTicketDetailDialogOpen(false)
        } finally {
            setTicketDetailLoading(false)
        }
    }

    const handleAddResponse = async () => {
        if (!newResponse.trim()) {
            toast.error('Please enter a response message')
            return
        }

        setIsSubmittingResponse(true)
        try {
            const result = await addTicketResponse(selectedTicket._id, newResponse.trim())
            if (result.success) {
                setSelectedTicket(result.data.data)
                setNewResponse('')
                toast.success('Response added successfully')
                // Refresh tickets list to update response count
                getUserTickets()
            } else {
                toast.error(result.error || 'Failed to add response')
            }
        } catch (error) {
            toast.error('Failed to add response')
            console.error('Error adding response:', error)
        } finally {
            setIsSubmittingResponse(false)
        }
    }

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear field error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required'
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required'
        }

        if (!formData.category) {
            errors.category = 'Category is required'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitTicket = async () => {
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const ticketData = {
                ...formData,
                attachments: attachments
            }

            const result = await createTicket(ticketData)

            if (result.success) {
                toast.success('Ticket created successfully!')
                setIsNewTicketDialogOpen(false)
                resetForm()
                // Refresh tickets list
                getUserTickets()
            } else {
                toast.error(result.error || 'Failed to create ticket')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error('Ticket creation error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            subject: '',
            description: '',
            category: '',
            priority: 'medium'
        })
        setAttachments([])
        setFormErrors({})
    }

    const handleDialogClose = () => {
        setIsNewTicketDialogOpen(false)
        resetForm()
    }

    const handleTicketDetailDialogClose = () => {
        setIsTicketDetailDialogOpen(false)
        setSelectedTicket(null)
        setNewResponse('')
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'border-green-200 text-green-700'
            case 'medium':
                return 'border-yellow-200 text-yellow-700'
            case 'high':
                return 'border-orange-200 text-orange-700'
            case 'critical':
                return 'border-red-200 text-red-700'
            default:
                return 'border-gray-200 text-gray-700'
        }
    }

    // Show loading spinner while fetching tickets
    if (loading && tickets.length === 0) {
        return (
            <InstructorLayout>
                <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                        <p className="text-gray-500">Loading tickets...</p>
                    </div>
                </div>
            </InstructorLayout>
        )
    }

    // Show error state
    if (error && tickets.length === 0) {
        return (
            <InstructorLayout>
                <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Button
                            onClick={() => {
                                clearError()
                                getUserTickets()
                            }}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </InstructorLayout>
        )
    }

    return (
        <InstructorLayout>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{t("instructor.supportTickets")}</h1>
                        <p className="text-sm text-neutral-500 mt-1">{t("instructor.manageYourSupportRequests")}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200">
                                    <CardTitle className="text-lg font-semibold">{t("instructor.supportTickets")}</CardTitle>
                                    <Button
                                        onClick={() => setIsNewTicketDialogOpen(true)}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800 h-9"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t("instructor.newTicket")}
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                                            <p className="text-gray-500">Loading tickets...</p>
                                        </div>
                                    ) : tickets.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-500">No tickets yet</p>
                                            <p className="text-sm text-gray-400 mt-1">Create your first support ticket to get help</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {tickets.map((ticket) => (
                                                <div
                                                    key={ticket._id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => handleOpenTicketDetail(ticket)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex flex-col gap-2">
                                                            <Badge
                                                                className={`rounded-full ${getStatusColor(ticket.status)}`}
                                                            >
                                                                {ticket.status}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className={`rounded-full text-xs ${getPriorityColor(ticket.priority)}`}
                                                            >
                                                                {ticket.priority}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{ticket.subject}</p>
                                                            <p className="text-sm text-gray-600 mb-1">{ticket.category}</p>
                                                            <p className="text-sm text-gray-500">
                                                                <Clock className="inline h-3 w-3 mr-1" />
                                                                {formatDate(ticket.createdAt)}
                                                            </p>
                                                            {ticket.responses && ticket.responses.length > 0 && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="rounded-2xl border-gray-200">
                                <CardHeader>
                                    <CardTitle>{t("instructor.needHelp")}</CardTitle>
                                    <CardDescription>{t("instructor.contactSupportTeam")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <TicketIcon className="h-5 w-5 text-black" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{t("instructor.supportTicket")}</p>
                                            <p className="text-sm text-gray-500">{t("instructor.responseWithin24h")}</p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-black text-white hover:bg-gray-800 rounded-xl"
                                        onClick={() => setIsNewTicketDialogOpen(true)}
                                    >
                                        {t("instructor.createTicket")}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* New Ticket Dialog */}
                    <Dialog open={isNewTicketDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogContent className="max-w-2xl p-6 rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>{t("instructor.createNewTicket")}</DialogTitle>
                                <DialogDescription>
                                    {t("instructor.fillTicketDetails")}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="subject">{t("instructor.subject")}</Label>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleFormChange('subject', e.target.value)}
                                        placeholder={t("instructor.enterBriefSubject")}
                                        className="mt-2"
                                    />
                                    {formErrors.subject && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.subject}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">{t("instructor.description")}</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleFormChange('description', e.target.value)}
                                        placeholder={t("instructor.describeIssueDetail")}
                                        className="mt-2"
                                        rows={4}
                                    />
                                    {formErrors.description && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="category">{t("instructor.category")}</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder={t("instructor.selectCategory")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Account Issues">{t("instructor.accountIssues")}</SelectItem>
                                            <SelectItem value="Billing & Payments">{t("instructor.billingPayments")}</SelectItem>
                                            <SelectItem value="Technical Support">{t("instructor.technicalSupport")}</SelectItem>
                                            <SelectItem value="Session Management">{t("instructor.sessionManagement")}</SelectItem>
                                            <SelectItem value="Booking Support">{t("instructor.bookingSupport")}</SelectItem>
                                            <SelectItem value="Profile & Verification">{t("instructor.profileVerification")}</SelectItem>
                                            <SelectItem value="Other">{t("instructor.other")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.category && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="priority">{t("instructor.priority")}</Label>
                                    <Select value={formData.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">{t("instructor.low")}</SelectItem>
                                            <SelectItem value="medium">{t("instructor.medium")}</SelectItem>
                                            <SelectItem value="high">{t("instructor.high")}</SelectItem>
                                            <SelectItem value="critical">{t("instructor.critical")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={handleDialogClose}>
                                    {t("instructor.cancel")}
                                </Button>
                                <Button
                                    onClick={handleSubmitTicket}
                                    disabled={isSubmitting}
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("instructor.creating")}...
                                        </>
                                    ) : (
                                        t("instructor.createTicket")
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Ticket Detail Dialog */}
                    <Dialog open={isTicketDetailDialogOpen} onOpenChange={handleTicketDetailDialogClose}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("instructor.ticketDetails")}</DialogTitle>
                                <DialogDescription>
                                    {t("instructor.viewTicketConversation")}
                                </DialogDescription>
                            </DialogHeader>

                            {ticketDetailLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                                    <p className="text-gray-500">Loading ticket details...</p>
                                </div>
                            ) : selectedTicket ? (
                                <div className="space-y-6">
                                    {/* Ticket Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.ticketId")}</label>
                                            <p className="text-sm text-gray-900">{selectedTicket._id}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.status")}</label>
                                            <div className="mt-1">
                                                <Badge className={getStatusColor(selectedTicket.status)}>
                                                    {selectedTicket.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.priority")}</label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                                                    {selectedTicket.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.category")}</label>
                                            <p className="text-sm text-gray-900">{selectedTicket.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.created")}</label>
                                            <p className="text-sm text-gray-900">{formatDateTime(selectedTicket.createdAt)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">{t("instructor.lastUpdated")}</label>
                                            <p className="text-sm text-gray-900">{formatDateTime(selectedTicket.updatedAt)}</p>
                                        </div>
                                    </div>

                                    {/* Conversation History */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-3 block">{t("instructor.conversation")}</label>
                                        <div className="space-y-4 max-h-80 overflow-y-auto border rounded-lg p-4 bg-white">
                                            {/* Original ticket message */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-900">{t("instructor.you")}</span>
                                                        <span className="text-xs text-gray-500">{formatDateTime(selectedTicket.createdAt)}</span>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">{selectedTicket.subject}</p>
                                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Responses */}
                                            {selectedTicket.responses && selectedTicket.responses.map((response, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${response.isAdmin ? 'bg-green-100' : 'bg-blue-100'
                                                        }`}>
                                                        {response.isAdmin ? (
                                                            <UserCog className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {response.isAdmin ? t("instructor.supportTeam") : t("instructor.you")}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{formatDateTime(response.createdAt)}</span>
                                                        </div>
                                                        <div className={`rounded-lg p-3 ${response.isAdmin ? 'bg-green-50' : 'bg-blue-50'
                                                            }`}>
                                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{response.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Add Response (only if ticket is not closed) */}
                                    {selectedTicket.status !== 'closed' && (
                                        <div>
                                            <Label htmlFor="newResponse">{t("instructor.addResponse")}</Label>
                                            <div className="mt-2 space-y-3">
                                                <Textarea
                                                    id="newResponse"
                                                    value={newResponse}
                                                    onChange={(e) => setNewResponse(e.target.value)}
                                                    placeholder={t("instructor.typeYourResponse")}
                                                    rows={3}
                                                />
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handleAddResponse}
                                                        disabled={isSubmittingResponse || !newResponse.trim()}
                                                        className="bg-black text-white hover:bg-gray-800"
                                                    >
                                                        {isSubmittingResponse ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                {t("instructor.sending")}...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                {t("instructor.sendResponse")}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTicket.status === 'closed' && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">{t("instructor.ticketClosed")}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-neutral-500">{t("instructor.failedToLoadTicketDetails")}</p>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </InstructorLayout>
    )
}

export default InstructorTickets
