"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Eye, Check, Plus, Award, Clock, Heart } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { useTranslation } from "react-i18next"

export const InstructorSelection = ({
    mockInstructors,
    selectedInstructor,
    handleInstructorSelect,
    openInstructorDialog,
    isInstructorDialogOpen,
    setIsInstructorDialogOpen,
    currentInstructor,
    groupMembers,
}) => {
    const { t } = useTranslation()
    const [activeGalleryImage, setActiveGalleryImage] = useState(0)

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    }

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t("selectInstructor")}</h2>
                {groupMembers.length > 0 && (
                    <Badge className="bg-gray-100 text-gray-900 border-gray-200 w-fit">
                        {t("groupOf")} {groupMembers.length + 1}
                    </Badge>
                )}
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {mockInstructors.map((instructor) => (
                    <motion.div key={instructor._id} variants={itemVariants}>
                        <Card
                            className={cn(
                                "overflow-hidden h-full transition-all duration-300 border-2 hover:shadow-xl group cursor-pointer",
                                selectedInstructor && selectedInstructor._id === instructor._id
                                    ? "border-gray-900 shadow-lg bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400 bg-white",
                            )}
                        >
                            <div className="flex flex-col">
                                <div className="w-full p-6 flex justify-center items-start bg-gray-50">
                                    <Avatar className="h-28 w-28 border-4 border-white shadow-lg ring-2 ring-gray-200">
                                        <AvatarImage
                                            src={instructor.instructorId?.profilePicture || "/placeholder.svg"}
                                            alt={instructor.instructorId?.name}
                                        />
                                        <AvatarFallback className="bg-gray-900 text-white text-xl font-bold">
                                            {instructor.instructorId?.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center leading-tight">{instructor.instructorId?.name}</h3>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                                        <span className="text-center line-clamp-2">{instructor.instructorId?.instructor.description[0]}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) =>
                                            star <= instructor.instructorId?.instructor.avgReview ? (
                                                <Star key={star} className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            ) : (
                                                <Star key={star} className="w-4 h-4 text-gray-300" />
                                            ),
                                        )}
                                        <span className="text-sm ml-1.5 font-medium text-gray-900">{instructor.instructorId?.instructor.avgReview}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
                                        <div>
                                            <span className="font-bold text-gray-900 text-xl">
                                                ${instructor.price + groupMembers.length * 30}
                                            </span>
                                            <span className="text-sm font-normal text-gray-500 ml-1">/session</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1.5 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                                                onClick={() => openInstructorDialog(instructor)}
                                            >
                                                <Eye size={14} />
                                                {t("view")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className={cn(
                                                    "flex items-center gap-1.5 transition-all duration-200 font-medium",
                                                    selectedInstructor && selectedInstructor._id === instructor._id
                                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                                        : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900",
                                                )}
                                                onClick={() =>
                                                    selectedInstructor?._id === instructor._id
                                                        ? handleInstructorSelect(null)
                                                        : handleInstructorSelect(instructor._id)
                                                }
                                            >
                                                {selectedInstructor && selectedInstructor._id === instructor._id ? (
                                                    <>
                                                        <Check size={14} />
                                                        {t("selected")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={14} />
                                                        {t("select")}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Instructor Dialog */}
            <Dialog open={isInstructorDialogOpen} onOpenChange={setIsInstructorDialogOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white rounded-xl border border-gray-200">
                    <DialogHeader className="p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-3xl font-bold text-gray-900">{currentInstructor?.instructorId?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left side - Photo and Gallery */}
                            <div className="md:w-1/2">
                                <Tabs defaultValue="profile" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
                                        <TabsTrigger
                                            value="profile"
                                            className="data-[state=active]:bg-gray-900 data-[state=active]:text-white font-medium"
                                        >
                                            {t("profile")}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="gallery"
                                            className="data-[state=active]:bg-gray-900 data-[state=active]:text-white font-medium"
                                        >
                                            {t("gallery")}
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="profile" className="mt-4">
                                        <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={currentInstructor?.instructorId.profilePicture || "/placeholder.svg"}
                                                alt={currentInstructor?.instructorId.name}
                                                className="w-full aspect-[3/4] object-cover"
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="gallery" className="mt-4">
                                        <div className="space-y-4">
                                            <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                                                <img
                                                    src={
                                                        (currentInstructor?.instructorId.instructor.portfolioMedias &&
                                                            currentInstructor?.instructorId.instructor.portfolioMedias.length > 0 &&
                                                            currentInstructor?.instructorId.instructor?.portfolioMedias[activeGalleryImage]) ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={`${currentInstructor?.instructorId.name} gallery`}
                                                    className="w-full aspect-[3/4] object-cover"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {currentInstructor?.instructorId.instructor.portfolioMedias?.map((img, index) => (
                                                    <div
                                                        key={index}
                                                        className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeGalleryImage === index ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200 hover:border-gray-400"}`}
                                                        onClick={() => setActiveGalleryImage(index)}
                                                    >
                                                        <img src={img || "/placeholder.svg"} alt="" className="w-full h-16 object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{t("about")}</h3>
                                    <p className="text-gray-700 leading-relaxed">{currentInstructor?.instructorId.instructor.description[0]}</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{t("languages")}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentInstructor?.languages?.map((language, index) => (
                                            <Badge key={index} variant="outline" className="bg-gray-100 border-gray-300 text-gray-900 font-medium">
                                                {language}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Details */}
                            <div className="md:w-1/2">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-600 mt-1 flex-wrap">
                                            <span className="text-sm font-medium">{currentInstructor?.specialty}</span>
                                            <span className="text-gray-300">•</span>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Clock size={14} />
                                                <span>{currentInstructor?.experience}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                        <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                        <span className="font-bold text-gray-900">{currentInstructor?.instructorId.instructor.avgReview}</span>
                                    </div>
                                </div>

                                <Separator className="my-6 bg-gray-200" />

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">{t("achievements")}</h3>
                                        <ul className="space-y-3">
                                            {currentInstructor?.achievements?.map((achievement, index) => (
                                                <li key={index} className="text-sm flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    <Check size={16} className="text-gray-900 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700 leading-relaxed">{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">{t("certificates")}</h3>
                                        <ul className="space-y-3">
                                            {currentInstructor?.certificates?.map((certificate, index) => (
                                                <li key={index} className="text-sm flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    <Award size={16} className="text-gray-900 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700 leading-relaxed">{certificate}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-5 md:gap-4 md:flex-row justify-between items-center">
                                    <div className="font-bold text-gray-900 text-3xl">
                                        ${currentInstructor?.price + groupMembers.length * 30}
                                        <span className="text-base font-normal text-gray-500 ml-1">/session</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            className={cn(
                                                "flex items-center gap-2 transition-all duration-200 font-medium px-6",
                                                selectedInstructor && selectedInstructor._id === currentInstructor?._id
                                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                                    : "bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white",
                                            )}
                                            onClick={() => {
                                                handleInstructorSelect(currentInstructor?._id)
                                                setIsInstructorDialogOpen(false)
                                            }}
                                        >
                                            {selectedInstructor && selectedInstructor._id === currentInstructor?._id ? (
                                                <>
                                                    <Check size={16} />
                                                    {t("selected")}
                                                </>
                                            ) : (
                                                <>
                                                    <Heart size={16} />
                                                    {t("selectInstructor")}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
