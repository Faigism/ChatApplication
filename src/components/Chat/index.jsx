import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { auth, db as firestoreDb } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, get } from 'firebase/database'
import { toast } from 'react-toastify'

const Chat = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showIcon, setShowIcon] = useState(false)
  const [readMore, setReadMore] = useState({})
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchUserData = async (user) => {
      const db = getDatabase()
      const userRef = ref(db, 'users/' + user.uid)
      const userSnapshot = await get(userRef)
      const userData = userSnapshot.val()

      setUser({ ...user, displayName: userData?.displayName })

      const q = query(collection(firestoreDb, 'messages'), orderBy('timestamp'))
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        )
      })
      return unsubscribeMessages
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user).then((unsubscribeMessages) => {
          return () => unsubscribeMessages()
        })
      } else {
        setUser(null)
        navigate('/')
      }
    })

    return () => {
      unsubscribeAuth()
    }
  }, [navigate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const Logout = async () => {
    try {
      await auth.signOut()
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      toast.dismiss()
      toast.warn('The message cannot be empty')
      return
    }

    try {
      await addDoc(collection(firestoreDb, 'messages'), {
        uid: user?.uid,
        photoUrl: user?.photoURL,
        displayName: user.displayName,
        text: newMessage,
        timestamp: serverTimestamp(),
      })
      setNewMessage('')
      setShowIcon(false)
    } catch (error) {
      toast.error('Failed Message')
    }
  }

  const deleteMessage = async (id, messageUid) => {
    if (user.uid !== messageUid) {
      toast.error('You can only delete your own messages')
      return
    }

    try {
      await deleteDoc(doc(firestoreDb, 'messages', id))
      toast.dismiss()
      toast.success('Message deleted')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to delete message')
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()

    if (isToday) {
      return 'Today'
    } else if (isYesterday) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true }
    return new Date(timestamp).toLocaleTimeString('en-US', options)
  }

  let lastDate = ''

  const toggleReadMore = (id) => {
    setReadMore((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <div className="chat_content" onKeyDown={handleKeyPress} tabIndex="0">
        {messages?.map((msg) => {
          const timestamp = msg?.data?.timestamp?.toDate()
          const formattedDate = formatDate(timestamp)
          const formattedTime = formatTime(timestamp)

          let showDate = false
          if (formattedDate !== lastDate) {
            showDate = true
            lastDate = formattedDate
          }

          const isExpanded = readMore[msg.id]
          const textToDisplay = isExpanded
            ? msg.data.text
            : msg.data.text.substring(0, 150)

          const isOwnMessage = user?.uid === msg.data.uid

          return (
            <div
              className={`user ${isOwnMessage ? 'ownMessage' : 'otherMessage'}`}
              key={msg?.id}
            >
              {msg?.data?.photoUrl ? (
                <img src={msg?.data?.photoUrl} alt="img" />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
              <p className="name">{msg?.data?.displayName}</p>
              <div className="text">
                <p>
                  {textToDisplay}
                  {msg.data.text.length > 150 && (
                    <>
                      {!isExpanded && '...'}
                      <button
                        type="button"
                        className="info-btn"
                        onClick={() => toggleReadMore(msg.id)}
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    </>
                  )}
                </p>

                <span>{formattedTime}</span>
              </div>
              {showDate && (
                <span className="formattedDate">{formattedDate}</span>
              )}
              {user?.uid === msg.data.uid && (
                <i
                  className="fa-solid fa-trash"
                  onClick={() => deleteMessage(msg.id, msg.data.uid)}
                ></i>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="container">
        <div className="chat_input">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              setShowIcon(e.target.value.trim() !== '')
            }}
          />
          {showIcon && (
            <button>
              <i className="fa-solid fa-play" onClick={sendMessage}></i>
            </button>
          )}
        </div>
        <div className="logout">
          <button onClick={Logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </>
  )
}

export default Chat
