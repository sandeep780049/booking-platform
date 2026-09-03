"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  MessageSquare,
  X,
  Send,
  Search,
  ChevronRight,
  LifeBuoy,
  Users,
  RotateCcw,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "../Pages/AuthProvider"
import { useNavigate, useLocation } from "react-router-dom"
import { getFriends } from "../Api/friend.api"
import { getChatHistoryApi } from "../Api/message.api"

const SUPPORT_FAQS = [
  {
    id: "register",
    question: "How do I register?",
    answer: "Click 'Sign Up' in the top right. Fill in your name, email and password — you're in within seconds.",
  },
  {
    id: "book",
    question: "How do I book an adventure?",
    answer: "Browse adventures, pick a date, add to cart, and checkout. Payments are secured via Stripe.",
  },
  {
    id: "cancel",
    question: "Can I cancel a booking?",
    answer: "Yes. Go to Dashboard → Bookings, select the booking and hit Cancel. Refunds process in 3–5 business days.",
  },
  {
    id: "types",
    question: "What adventure types are available?",
    answer: "Hiking, rock climbing, water sports, safaris, paragliding — all skill levels welcome.",
  },
  {
    id: "ticket",
    question: "I need human support",
    answer: "Redirecting you to our support tickets…",
    action: "tickets",
  },
]

const initSupportMessages = [
  {
    id: 1,
    from: "agent",
    text: "Hey! How can I help you today?",
    ts: new Date(Date.now() - 5 * 60000).toISOString(),
  },
]

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

function formatFullTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (email || "?")[0].toUpperCase()
}

function UserAvatar({ friend, size = "md" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" }
  const initials = getInitials(friend.name, friend.email)
  return (
    <div className={`${sizes[size]} shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center font-semibold text-white select-none`}>
      {friend.profilePicture ? (
        <img src={friend.profilePicture} alt={friend.name || "User"} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

function FriendThread({ friend, currentUserId, onBack }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getChatHistoryApi(friend._id)
      .then((res) => {
        if (!cancelled) {
          const msgs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
          setMessages(msgs)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [friend._id])

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!draft.trim()) return
    const optimistic = {
      _id: `opt-${Date.now()}`,
      sender: { _id: currentUserId },
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      optimistic: true,
    }
    setMessages((prev) => [...prev, optimistic])
    setDraft("")
  }

  const isFromMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender
    return senderId === currentUserId || senderId?.toString() === currentUserId?.toString()
  }

  const getContent = (msg) => msg.content || msg.text || msg.message || ""

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <UserAvatar friend={friend} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
            {friend.name || friend.email}
          </p>
          <p className="text-xs text-gray-400">{friend.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 scrollbar-hide">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 py-8">
            <MessageSquare size={28} strokeWidth={1.5} />
            <p className="text-sm">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = isFromMe(m)
            return (
              <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col gap-0.5 max-w-[75%]">
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      mine
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {getContent(m)}
                  </div>
                  <span className={`text-[10px] text-gray-400 px-1 ${mine ? "text-right" : "text-left"}`}>
                    {formatFullTime(m.createdAt || m.timestamp || new Date())}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message…"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!draft.trim()}
          className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full disabled:opacity-30 hover:bg-gray-700 transition-all shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

function PeopleTab({ currentUserId }) {
  const [friends, setFriends] = useState([])
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [thread, setThread] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getFriends()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setFriends(list)

      const previewMap = {}
      await Promise.allSettled(
        list.map(async (f) => {
          try {
            const hist = await getChatHistoryApi(f._id)
            const msgs = Array.isArray(hist?.data) ? hist.data : Array.isArray(hist) ? hist : []
            if (msgs.length > 0) {
              const last = msgs[msgs.length - 1]
              previewMap[f._id] = {
                text: last.content || last.text || last.message || "",
                ts: last.createdAt || last.timestamp,
              }
            }
          } catch {
            // no preview for this friend
          }
        })
      )
      setPreviews(previewMap)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = friends.filter((f) => {
    const q = search.toLowerCase()
    return (
      (f.name || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q)
    )
  })

  if (thread) {
    return (
      <FriendThread
        friend={thread}
        currentUserId={currentUserId}
        onBack={() => setThread(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends…"
            className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 py-8">
            <Users size={32} strokeWidth={1.5} />
            <p className="text-sm">
              {friends.length === 0 ? "No friends added yet" : "No results found"}
            </p>
            {friends.length === 0 && (
              <p className="text-xs text-center px-6 text-gray-400">
                Add friends from your dashboard to start chatting
              </p>
            )}
          </div>
        ) : (
          filtered.map((friend) => {
            const preview = previews[friend._id]
            return (
              <button
                key={friend._id}
                onClick={() => setThread(friend)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <UserAvatar friend={friend} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {friend.name || friend.email}
                    </p>
                    {preview?.ts && (
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {formatTime(preview.ts)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {preview?.text || <span className="text-gray-400 italic">No messages yet</span>}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function SupportTab({ navigate, onClose }) {
  const [messages, setMessages] = useState(initSupportMessages)
  const [asked, setAsked] = useState(new Set())
  const endRef = useRef(null)

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFAQ = (faq) => {
    if (asked.has(faq.id)) return
    setAsked((prev) => new Set([...prev, faq.id]))

    const userMsg = { id: Date.now(), from: "user", text: faq.question, ts: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])

    setTimeout(() => {
      const agentMsg = { id: Date.now() + 1, from: "agent", text: faq.answer, ts: new Date().toISOString() }
      setMessages((prev) => [...prev, agentMsg])
      if (faq.action === "tickets") {
        setTimeout(() => {
          navigate("/dashboard/tickets")
          onClose()
        }, 900)
      }
    }, 800)
  }

  const reset = () => {
    setMessages(initSupportMessages)
    setAsked(new Set())
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "agent" && (
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold mr-2 mt-auto shrink-0 mb-0.5">
                A
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.from === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Quick Help</p>
          <button
            onClick={reset}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Reset"
          >
            <RotateCcw size={13} className="text-gray-400" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5 max-h-[130px] overflow-y-auto scrollbar-hide">
          {SUPPORT_FAQS.map((faq) => (
            <button
              key={faq.id}
              onClick={() => handleFAQ(faq)}
              disabled={asked.has(faq.id)}
              className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                asked.has(faq.id)
                  ? "bg-gray-50 text-gray-400 border-gray-100 cursor-default"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              }`}
            >
              <span>{faq.question}</span>
              {!asked.has(faq.id) && <ChevronRight size={12} className="shrink-0 ml-2 opacity-50" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState("people")
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === "/chat") return null

  const close = () => setIsOpen(false)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-[9997] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            <motion.div
              className="
                fixed z-[9998]
                inset-0 md:inset-auto
                md:bottom-[5rem] md:right-4
                md:w-[360px] md:h-[520px]
                bg-white
                md:rounded-2xl md:shadow-2xl md:border md:border-gray-100
                flex flex-col overflow-hidden
              "
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.16 } }}
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={close}
                    className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={20} className="text-gray-700" />
                  </button>
                  <h2 className="font-bold text-[15px] text-gray-900 tracking-tight">Messages</h2>
                </div>
                <button
                  onClick={close}
                  className="hidden md:flex p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex border-b border-gray-100 shrink-0">
                <button
                  onClick={() => setTab("people")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors relative ${
                    tab === "people" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Users size={16} />
                  People
                  {tab === "people" && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 rounded-full"
                    />
                  )}
                </button>

                <button
                  onClick={() => setTab("support")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors relative ${
                    tab === "support" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LifeBuoy size={16} />
                  Support
                  {tab === "support" && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 rounded-full"
                    />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    className="h-full"
                    initial={{ opacity: 0, x: tab === "people" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.18 } }}
                    exit={{ opacity: 0, x: tab === "people" ? 10 : -10, transition: { duration: 0.1 } }}
                  >
                    {tab === "people" ? (
                      <PeopleTab currentUserId={user?._id || user?.id} />
                    ) : (
                      <SupportTab navigate={navigate} onClose={close} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[9999] w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle messages"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
