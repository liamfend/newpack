import * as React from 'react'

function SvgArrow(props) {
  return (
    <svg viewBox="0 0 13 9" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9.5 5.52L7.72 7.24a1.04 1.04 0 00-.04 1.44.98.98 0 001.4.04l3.6-3.48a1.03 1.03 0 00.3-.74c0-.3-.12-.56-.3-.74L9.1.28a.98.98 0 00-1.4.04 1.04 1.04 0 00.03 1.45l1.76 1.7H1c-.55 0-1 .47-1 1.03s.45 1.02 1 1.02h8.5z" />
    </svg>
  )
}

export default SvgArrow
