import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export const useGroupManagement = (user, useFriend, t) => {
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [groupMembers, setGroupMembers] = useState([])
  const [searchEmail, setSearchEmail] = useState("")
  const [showFriendsList, setShowFriendsList] = useState(true)

  const {
    friends,
    searchResult,
    loading: friendLoading,
    error,
    searchUser,
    sendRequest,
    clearSearchResult,
    fetchFriends
  } = useFriend()

  // Fetch friends when component mounts or dialog opens
  useEffect(() => {
    if (showGroupDialog && friends.length === 0) {
      fetchFriends()
    }
  }, [showGroupDialog, fetchFriends, friends.length])

  // Clear search results when dialog closes
  useEffect(() => {
    if (!showGroupDialog) {
      clearSearchResult()
      setSearchEmail("")
    }
  }, [showGroupDialog, clearSearchResult])

  const handleSearchFriends = useCallback(async (e) => {
    e.preventDefault()

    if (!searchEmail.trim()) {
      toast(t("pleaseEnterEmail"), { type: "error", position: "top-right" })
      return
    }

    try {
      const result = await searchUser(searchEmail)
      if (!result) {
        toast(t("noUsersFound"), { type: "error", position: "top-right" })
      }
    } catch (err) {
      toast(t("searchFailed"), { type: "error", position: "top-right" })
    }
  }, [searchEmail, searchUser, t])

  const addGroupMember = useCallback((user) => {
    // Check if user is already in group
    if (groupMembers.some((member) => member._id === user._id)) {
      toast(t("userAlreadyInGroup"), { type: "warning", position: "top-right" })
      return
    }

    setGroupMembers((prev) => [...prev, user])
    clearSearchResult()
    setSearchEmail("")
    toast(t("friendAdded"), { type: "success", position: "top-right" })
  }, [groupMembers, clearSearchResult, t])

  const handleSendFriendRequest = useCallback(async (userId) => {
    try {
      await sendRequest(userId)
      toast(t("friendRequestSent"), { type: "success", position: "top-right" })
    } catch (err) {
      toast(t("failedToSendRequest"), { type: "error", position: "top-right" })
    }
  }, [sendRequest, t])

  const removeGroupMember = useCallback((userId) => {
    // Remove from local state
    setGroupMembers((prev) => prev.filter((member) => member._id !== userId))

    // Remove from sessionStorage if present
    try {
      const stored = sessionStorage.getItem("groupMembers")
      if (stored) {
        const sessionMembers = JSON.parse(stored)
        const updatedSessionMembers = sessionMembers.filter((member) => member._id !== userId)
        sessionStorage.setItem("groupMembers", JSON.stringify(updatedSessionMembers))
      }
    } catch { }

    toast(t("friendRemoved"), { type: "success", position: "top-right" })
  }, [t])

  const saveGroupToSession = useCallback(() => {
    if (groupMembers.length > 0) {
      sessionStorage.setItem("groupMembers", JSON.stringify(groupMembers))
    }
  }, [groupMembers])

  return {
    showGroupDialog,
    setShowGroupDialog,
    groupMembers,
    searchEmail,
    setSearchEmail,
    showFriendsList,
    setShowFriendsList,
    friends,
    searchResult,
    friendLoading,
    error,
    handleSearchFriends,
    addGroupMember,
    handleSendFriendRequest,
    removeGroupMember,
    saveGroupToSession
  }
}