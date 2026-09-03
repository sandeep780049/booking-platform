"use client"

import { useState, useRef } from "react"
import { Smile, Send, Paperclip, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MessageInput({ onSendMessage }) {
    const [message, setMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [attachments, setAttachments] = useState([])
    const fileInputRef = useRef(null)

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (message.trim() || attachments.length > 0) {
            const processedAttachments = await Promise.all(
                attachments.map(async (attachment) => {
                    const base64Data = await fileToBase64(attachment.file)
                    return base64Data
                }),
            )
            onSendMessage(message, processedAttachments)
            setMessage("")
            setAttachments([])
        }
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            const newAttachments = files.map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file),
                file,
            }))
            setAttachments([...attachments, ...newAttachments])
        }
    }

    const removeAttachment = (id) => {
        setAttachments(attachments.filter((attachment) => attachment.id !== id))
    }

    const emojiOptions = ["😊", "👍", "❤️", "🙏", "😂", "🎉", "👋", "🤔", "👌", "🔥"]

    return (
        <div className="message-input-container">
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-neutral-50 rounded-lg border border-black/10">
                    <AnimatePresence>
                        {attachments.map((attachment) => (
                            <motion.div
                                key={attachment.id}
                                className="relative group"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {attachment.type.startsWith("image/") ? (
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-black/10">
                                        <img
                                            src={attachment.url}
                                            alt={attachment.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-center p-1 border border-black/10 bg-white">
                                        <div className="text-xl">📄</div>
                                        <div className="text-[8px] text-neutral-500 truncate w-full">
                                            {attachment.name}
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center hover:bg-neutral-800 transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                        className="w-full py-2 pl-10 pr-10 rounded-full border border-black/10 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white text-sm"
                    />

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-black hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-50"
                        >
                            <Smile size={18} />
                        </button>
                    </div>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <label className="cursor-pointer text-black hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-50">
                            <Paperclip size={18} />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!message.trim() && attachments.length === 0}
                    className={`
                        p-2 rounded-full flex items-center justify-center 
                        transition-all duration-200
                        ${message.trim() || attachments.length > 0
                            ? "bg-black text-white hover:bg-neutral-800"
                            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        }
                    `}
                >
                    <Send size={18} />
                </button>
            </form>

            {showEmojiPicker && (
                <motion.div
                    className="absolute bottom-14 left-4 bg-white p-2 rounded-lg border border-black/10 flex flex-wrap gap-1 max-w-xs z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                >
                    {emojiOptions.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                setMessage(message + emoji)
                                setShowEmojiPicker(false)
                            }}
                            className="w-8 h-8 text-xl hover:bg-neutral-50 rounded transition-colors flex items-center justify-center"
                        >
                            {emoji}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
