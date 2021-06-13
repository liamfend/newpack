import * as React from 'react'

function SvgMyProfile(props) {
  return (
    <svg width={14} height={16} xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2.5H9.5a2.5 2.5 0 10-5 0H2A1.5 1.5 0 00.5 4v10.5A1.5 1.5 0 002 16h10a1.5 1.5 0 001.5-1.5V4A1.5 1.5 0 0012 2.5zM7.836 9.847c1.382 0 2.414.933 2.414 2.286v.146c0 .707-1.161.707-2.506.707H6.067c-1.31-.001-2.317-.032-2.317-.707v-.146c0-1.354 1.032-2.286 2.414-2.286zM6.926 5.6c1.094 0 1.985.873 1.985 1.945 0 1.073-.891 1.946-1.985 1.946-1.095 0-1.985-.873-1.985-1.946 0-1.072.89-1.945 1.985-1.945zM7 1.75a.75.75 0 110 1.5.75.75 0 010-1.5z" />
    </svg>
  )
}

export default SvgMyProfile
