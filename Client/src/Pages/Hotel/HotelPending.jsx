"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { ClipboardCheck, Clock, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function HotelPendingReview() {
    const navigate = useNavigate()

    useEffect(() => {
        // You would typically check if the user is authenticated and has a pending hotel application
        // If not, redirect to the appropriate page
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <Card className="shadow-lg border-gray-200">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Application Under Review</CardTitle>
                        <CardDescription>Thank you for registering your hostel with us</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-600">
                            Our team is currently reviewing your hostel application. This process typically takes 1-3 business days.
                        </p>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-700 flex items-center justify-center mb-2">
                                <ClipboardCheck className="mr-2 h-5 w-5" />
                                What happens next?
                            </h3>
                            <ul className="text-sm text-blue-600 text-left list-disc pl-5 space-y-1">
                                <li>Our team will verify all submitted documents</li>
                                <li>We may contact you for additional information if needed</li>
                                <li>Once confirmed, you can see your hostel listing</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
