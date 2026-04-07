import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Reply, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { messageService } from '../../services/endpoints'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import { extractApiError } from '../../utils/helpers'
import Avatar from '../ui/Avatar'
import Pagination from '../ui/Pagination'

// Format time — shows relative time for recent, date for older
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function DiscussionBoard({ workspaceId, myRole }) {
  const { user }     = useAuthStore()
  const { addToast } = useToastStore()

  const [messages, setMessages]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(0)
  const [newMessage, setNewMessage]     = useState('')
  const [posting, setPosting]           = useState(false)
  const [expandedReplies, setExpandedReplies] = useState({}) // messageId → bool
  const [replyingTo, setReplyingTo]     = useState(null)     // messageId
  const [replyContent, setReplyContent] = useState('')
  const [postingReply, setPostingReply] = useState(false)

  const textareaRef = useRef(null)
  const replyRef    = useRef(null)

  const fetchMessages = async (p = 0, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await messageService.list(workspaceId, p)
      setMessages(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
    } catch (_) {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchMessages(0)
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchMessages(page, true), 30000)
    return () => clearInterval(interval)
  }, [workspaceId])

  // Focus reply box when replying
  useEffect(() => {
    if (replyingTo && replyRef.current) {
      replyRef.current.focus()
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [replyingTo])

  const handlePost = async () => {
    if (!newMessage.trim()) return
    setPosting(true)
    try {
      await messageService.post(workspaceId, newMessage.trim())
      setNewMessage('')
      setPage(0)
      fetchMessages(0)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setPosting(false)
  }

  const handleReply = async (messageId) => {
    if (!replyContent.trim()) return
    setPostingReply(true)
    try {
      await messageService.reply(workspaceId, messageId, replyContent.trim())
      setReplyContent('')
      setReplyingTo(null)
      // Expand replies for the message we just replied to
      setExpandedReplies((prev) => ({ ...prev, [messageId]: true }))
      fetchMessages(page, true)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setPostingReply(false)
  }

  const handleDelete = async (messageId) => {
    try {
      await messageService.delete(workspaceId, messageId)
      addToast('Message deleted', 'info')
      fetchMessages(page, true)
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const toggleReplies = (messageId) => {
    setExpandedReplies((prev) => ({ ...prev, [messageId]: !prev[messageId] }))
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* ── Post new message box ── */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Avatar name={user?.username || 'U'} size={34} />
          <div style={{ flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                // Cmd/Ctrl + Enter to post
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handlePost()
              }}
              placeholder="Share an update, ask a question, or flag a blocker..."
              rows={3}
              style={{
                width: '100%', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg2)', color: 'var(--text)',
                fontSize: '0.875rem', padding: '0.7rem 0.9rem',
                fontFamily: 'var(--font-body)', outline: 'none',
                resize: 'vertical', minHeight: 80,
                transition: 'var(--transition)', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--violet)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
            />
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginTop: '0.5rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                {newMessage.length}/2000 · ⌘Enter to post
              </span>
              <button
                onClick={handlePost}
                disabled={posting || !newMessage.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.82rem', fontWeight: 500,
                  padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)',
                  cursor: posting || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  border: 'none', fontFamily: 'var(--font-body)',
                  background: posting || !newMessage.trim() ? 'var(--bg2)' : 'var(--grad2)',
                  color: posting || !newMessage.trim() ? 'var(--text3)' : '#fff',
                  opacity: posting || !newMessage.trim() ? 0.6 : 1,
                  transition: 'var(--transition)',
                  boxShadow: posting || !newMessage.trim() ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
                }}
              >
                <Send size={13} />
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Header with refresh ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
          {loading ? 'Loading...' : `${messages.length} post${messages.length !== 1 ? 's' : ''} on this page`}
        </span>
        <button
          onClick={() => fetchMessages(page, true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.75rem', color: 'var(--text3)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '0.875rem', color: 'var(--text3)' }}>
          Loading discussion...
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && messages.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.1rem',
            fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem',
          }}>
            No discussions yet
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.6 }}>
            Start the conversation — share an update, flag a blocker, or ask your team a question.
          </div>
        </div>
      )}

      {/* ── Message list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const isOwn    = msg.authorId === user?.userId || msg.authorUsername === user?.username
            const canDelete = isOwn || myRole === 'ADMIN'
            const repliesExpanded = expandedReplies[msg.id]
            const hasReplies = msg.replyCount > 0

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* ── Top-level post ── */}
                <div style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Avatar name={msg.authorUsername} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Author + time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                          {msg.authorUsername}
                          {isOwn && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text3)', fontWeight: 400, marginLeft: '0.3rem' }}>
                              (you)
                            </span>
                          )}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                          {timeAgo(msg.createdAt)}
                        </span>
                        {msg.edited && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text3)', fontStyle: 'italic' }}>
                            edited
                          </span>
                        )}
                      </div>

                      {/* Message content */}
                      <div style={{
                        fontSize: '0.875rem', color: 'var(--text)',
                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {msg.content}
                      </div>

                      {/* Action row */}
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap',
                      }}>
                        {/* Reply button */}
                        <button
                          onClick={() => {
                            if (replyingTo === msg.id) cancelReply()
                            else { setReplyingTo(msg.id); setReplyContent('') }
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.75rem', fontWeight: 500,
                            padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer', fontFamily: 'var(--font-body)',
                            background: replyingTo === msg.id ? 'var(--violet-alpha)' : 'var(--bg2)',
                            color: replyingTo === msg.id ? 'var(--violet)' : 'var(--text2)',
                            border: `1px solid ${replyingTo === msg.id ? 'rgba(124,58,237,0.2)' : 'var(--border)'}`,
                            transition: 'var(--transition)',
                          }}
                        >
                          <Reply size={11} />
                          {replyingTo === msg.id ? 'Cancel' : 'Reply'}
                        </button>

                        {/* Show/hide replies toggle */}
                        {hasReplies && (
                          <button
                            onClick={() => toggleReplies(msg.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontSize: '0.75rem', fontWeight: 500,
                              padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer', fontFamily: 'var(--font-body)',
                              background: 'var(--bg2)', color: 'var(--text2)',
                              border: '1px solid var(--border)', transition: 'var(--transition)',
                            }}
                          >
                            {repliesExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                          </button>
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            title="Delete message"
                            style={{
                              display: 'flex', alignItems: 'center',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text3)', padding: '0.25rem',
                              borderRadius: 4, transition: 'var(--transition)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Reply input box ── */}
                <AnimatePresence>
                  {replyingTo === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg2)',
                        padding: '0.85rem 1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                        <Avatar name={user?.username || 'U'} size={28} />
                        <div style={{ flex: 1 }}>
                          <textarea
                            ref={replyRef}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleReply(msg.id)
                              if (e.key === 'Escape') cancelReply()
                            }}
                            placeholder={`Replying to ${msg.authorUsername}...`}
                            rows={2}
                            style={{
                              width: '100%', border: '1px solid var(--border2)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg3)', color: 'var(--text)',
                              fontSize: '0.85rem', padding: '0.6rem 0.85rem',
                              fontFamily: 'var(--font-body)', outline: 'none',
                              resize: 'vertical', minHeight: 60,
                              transition: 'var(--transition)', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--violet)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={cancelReply}
                              style={{
                                fontSize: '0.78rem', padding: '0.3rem 0.75rem',
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontWeight: 500,
                                background: 'var(--bg3)', color: 'var(--text2)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(msg.id)}
                              disabled={postingReply || !replyContent.trim()}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.78rem', padding: '0.3rem 0.75rem',
                                borderRadius: 'var(--radius-sm)', cursor: postingReply || !replyContent.trim() ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-body)', fontWeight: 500,
                                background: postingReply || !replyContent.trim() ? 'var(--bg2)' : 'var(--grad2)',
                                color: postingReply || !replyContent.trim() ? 'var(--text3)' : '#fff',
                                border: 'none', opacity: postingReply || !replyContent.trim() ? 0.6 : 1,
                                transition: 'var(--transition)',
                              }}
                            >
                              <Send size={11} />
                              {postingReply ? 'Sending...' : 'Send reply'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Replies list ── */}
                <AnimatePresence>
                  {repliesExpanded && hasReplies && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg2)',
                      }}
                    >
                      {msg.replies.map((reply, rIdx) => {
                        const isOwnReply    = reply.authorUsername === user?.username
                        const canDeleteReply = isOwnReply || myRole === 'ADMIN'

                        return (
                          <div
                            key={reply.id}
                            style={{
                              padding: '0.85rem 1.25rem 0.85rem 2.5rem',
                              borderBottom: rIdx < msg.replies.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                              {/* Indent line */}
                              <div style={{
                                position: 'relative', flexShrink: 0,
                              }}>
                                <Avatar name={reply.authorUsername} size={28} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Author + time */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                                    {reply.authorUsername}
                                    {isOwnReply && (
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 400, marginLeft: '0.3rem' }}>(you)</span>
                                    )}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                                    {timeAgo(reply.createdAt)}
                                  </span>
                                </div>

                                {/* Reply content */}
                                <div style={{
                                  fontSize: '0.855rem', color: 'var(--text)',
                                  lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}>
                                  {reply.content}
                                </div>

                                {/* Delete reply */}
                                {canDeleteReply && (
                                  <button
                                    onClick={() => handleDelete(reply.id)}
                                    title="Delete reply"
                                    style={{
                                      display: 'flex', alignItems: 'center',
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: 'var(--text3)', padding: '0.2rem',
                                      borderRadius: 4, marginTop: '0.35rem',
                                      transition: 'var(--transition)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => { setPage(p); fetchMessages(p) }}
      />
    </div>
  )
}