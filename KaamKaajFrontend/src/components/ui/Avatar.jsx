import React from 'react'
import { getInitials, getAvatarColor } from '../../utils/helpers'

export default function Avatar({ name = '', size = 32, style = {} }) {
  const initials = getInitials(name)
  const color = getAvatarColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.35,
      fontWeight: 600, color: '#fff', flexShrink: 0,
      fontFamily: 'var(--font-body)', ...style,
    }}>
      {initials}
    </div>
  )
}
