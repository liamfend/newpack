import * as React from 'react'

function SvgTag(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" {...props}>
      <path
        fillRule="evenodd"
        d="M9.27 4.97a1.24 1.24 0 110-2.5 1.24 1.24 0 010 2.5M12.37 0H7.42c-.34 0-.8.2-1.05.44L.18 6.6a.62.62 0 000 .88l5.34 5.34c.24.24.63.24.88 0l6.16-6.17c.24-.24.44-.72.44-1.06V.6a.62.62 0 00-.62-.62"
      />
    </svg>
  )
}

export default SvgTag
