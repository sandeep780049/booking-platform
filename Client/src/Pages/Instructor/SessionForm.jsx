"use client"

import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { ArrowLeft } from 'lucide-react'
import { Button } from "../../components/ui/button"
import InstructorLayout from "./InstructorLayout"
import SessionCalendar from "../../components/SessionCalendar"
import { useAuth } from '../AuthProvider'
import { useEffect, useState } from "react"
import { getAdventure } from "../../Api/adventure.api"
import { toast } from 'sonner';

const SessionForm = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()    
    const { user } = useAuth();
    const [adventureTypes, setAdventureTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    }

    useEffect(() => {
         // Check if the user has instructor data and adventure ID
        if (user?.user?.instructor?.adventure) {
            getAdventure(user.user.instructor.adventure).then((res) => {
                setAdventureTypes(res.data)
                setIsLoading(false)
            }).catch((err) => {
                console.error(err);
                toast.error("Failed to load adventure data")
            });
        } else {
            toast.error("No adventure ID found for instructor")
        }
    }, [user]);

    return (
        <InstructorLayout>
            <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/instructor/sessions")}
                            className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
                            <span className="hidden sm:inline">{t("instructor.createNewSession")}</span>
                            <span className="sm:hidden">New Session</span>
                        </h2>
                    </div>
                </div>

                <motion.div className="grid gap-4 sm:gap-6" variants={fadeIn} initial="hidden" animate="visible">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <SessionCalendar adventureTypes={adventureTypes} />
                    )}
                </motion.div>
            </div>
        </InstructorLayout>
    )
}

export default SessionForm
