import React, { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="toast">
      {message}
    </div>
  )
}
