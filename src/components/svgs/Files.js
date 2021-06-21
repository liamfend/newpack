import * as React from 'react'

function SvgFiles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 17" {...props}>
      <g fill="none" fillRule="evenodd">
        <path d="M2 0h7l6 6v9a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2z" fill="#38B2A6" />
        <path fill="#FFF" d="M2 5h5v1H2zm0 3h7v1H2zm0 3h9v1H2z" />
        <path fill="#94D5CF" d="M9 0l6 6H9z" />
      </g>
    </svg>
  )
}

export default SvgFiles
