import UserLayout from "./UserLayout"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from '../../components/ui/separator'
import { Award } from "lucide-react"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { useAuth } from '../AuthProvider'
import { useEffect, useState } from 'react'
import { getUserAdventureExperiences, getUserAchievements, evaluateMyAchievements } from "../../Api/user.api"

export default function UserProfilePage() {
    const { user } = useAuth();
    const [loadingAchievements, setLoadingAchievements] = useState(true)
    const [achievementsError, setAchievementsError] = useState(null)
    const [userAchievements, setUserAchievements] = useState(null)
    const [levelData, setLevelData] = useState({
        overallLevel: 0,
        totalExperience: 0,
        averageLevel: 0,
        adventureCount: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingAchievements(true);
                setAchievementsError(null);

                // Fetch adventure experiences for level data
                const experienceResponse = await getUserAdventureExperiences();
                if (experienceResponse.success) {
                    setLevelData(experienceResponse.data.levelData || {
                        overallLevel: 0,
                        totalExperience: 0,
                        averageLevel: 0,
                        adventureCount: 0
                    });
                }

                // First, evaluate achievements based on latest data
                try {
                    await evaluateMyAchievements();
                } catch (err) {
                    console.warn('Achievement evaluation skipped:', err?.response?.data?.message || err.message);
                }

                // Fetch user achievements (levels, badges, stats) after evaluation
                try {
                    const achievementsResponse = await getUserAchievements();
                    if (achievementsResponse?.success) {
                        setUserAchievements(achievementsResponse.data);
                    }
                } catch (err) {
                    console.warn('Could not load achievements:', err?.response?.data?.message || err.message);
                    setAchievementsError(err?.response?.data?.message || err.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setAchievementsError("Failed to load profile data");
            } finally {
                setLoadingAchievements(false);
            }
        };

        fetchData();
    }, []);

    // Normalize experience/level from the most authoritative source available
    const xpFromAchievements = Number.isFinite(userAchievements?.totalExperiencePoints)
        ? userAchievements.totalExperiencePoints
        : 0;
    const xpFromLevelData = Number.isFinite(levelData?.totalExperience)
        ? levelData.totalExperience
        : 0;
    // Prefer the highest known XP to avoid stale zeros overriding real values
    const totalXP = Math.max(xpFromAchievements, xpFromLevelData);
    const levelFromXP = Math.floor(totalXP / 100);
    const apiLevel = Number.isFinite(userAchievements?.level) ? userAchievements.level : null;
    const normalizedLevel = apiLevel !== null ? Math.max(apiLevel, levelFromXP) : levelFromXP;
    const nextLevelXP = (normalizedLevel + 1) * 100;

    const userProfile = {
        name: user.user.name || "John Doe",
        email: user.user.email || "",
        level: normalizedLevel,
        joinDate: user.user.updatedAt
            ? new Date(user.user.updatedAt).toLocaleDateString()
            : "2023-01-01",
        completedAdventures: userAchievements?.totalCompletedAdventures || 0,
        experience: totalXP,
        nextLevel: nextLevelXP,
    }
    const progressPercentage = totalXP > 0 ? ((totalXP % 100) / 100) * 100 : 0;

    // Get achievements list
    const achievements = userAchievements?.achievements || [];

    return (
        <UserLayout>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
                            <p className="text-gray-600 text-lg">Manage your personal information and achievements</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Card className="rounded-2xl border-0 shadow-xl bg-white overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <Avatar className="h-28 w-28 mb-4 border-4 border-gray-200 shadow-lg">
                                            <AvatarFallback className="bg-gray-900 text-white text-3xl font-bold">
                                                {userProfile.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-2xl font-bold text-gray-900">{userProfile.name}</h3>
                                        <p className="text-gray-600 mt-1">{userProfile.email}</p>
                                        <div className="mt-3 bg-gray-100 px-4 py-2 rounded-full">
                                            <span className="text-gray-900 font-bold text-lg">Level {Math.floor(userProfile.level / 100)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-semibold mb-3 text-gray-900 text-lg">Account Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                                <span className="text-gray-600">Member since</span>
                                                <span className="text-gray-900 font-medium">{userProfile.joinDate}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                                <span className="text-gray-600">Completed Adventures</span>
                                                <span className="text-gray-900 font-medium">{userProfile.completedAdventures}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                                <span className="text-gray-600">Experience Points</span>
                                                <span className="text-gray-900 font-medium">{userProfile.experience} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Adventure Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="font-semibold mb-4 text-lg">Experience Progress</h4>
                                            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                                    style={{ width: `${progressPercentage}%` }}
                                                >
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-3 text-sm font-medium">
                                                <span className="text-gray-900">{userProfile.experience} XP</span>
                                                <span className="text-gray-500">{userProfile.nextLevel} XP (Next Level)</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-semibold mb-4 text-lg">Achievements</h4>
                                            {loadingAchievements && (
                                                <div className="text-sm text-gray-500">Loading achievements...</div>
                                            )}
                                            {achievementsError && (
                                                <div className="text-sm text-red-500">{achievementsError}</div>
                                            )}
                                            {!loadingAchievements && !achievementsError && (
                                                achievements.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        {achievements.map((a, idx) => {
                                                            const title = a.title || a.name || a.code || a.achievementCode || `Achievement ${idx + 1}`

                                                            return (
                                                                <div key={idx} className="relative flex flex-col items-center p-5 rounded-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 border-4 border-yellow-500 shadow-2xl hover:shadow-3xl hover:scale-110">
                                                                    {/* Shine effects */}
                                                                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-white/40 to-orange-200/30"></div>
                                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>

                                                                    {/* Trophy icon with golden glow */}
                                                                    <div className="relative mb-3 animate-pulse">
                                                                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl opacity-60"></div>
                                                                        <Award className="h-14 w-14 relative z-10 text-yellow-600 drop-shadow-2xl" strokeWidth={2.5} />
                                                                    </div>

                                                                    {/* Title with golden text */}
                                                                    <span className="text-sm font-bold text-center relative z-10 text-amber-900">{title}</span>

                                                                    {/* Trophy badge */}
                                                                    <div className="mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                                                                        🏆 Unlocked
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">No achievements yet.</div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    )
}
