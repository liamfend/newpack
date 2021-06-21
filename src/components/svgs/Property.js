import * as React from 'react'

function SvgProperty(props) {
  return (
    <svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 8h6v8h-6V8zm2 5v3h2v-3h-2zm-2-7h6v1h-6zM0 0h9v16H0V0zm2 2v2h2V2H2zm0 3v2h2V5H2zm0 3v2h2V8H2zm3-6v2h2V2H5zm0 3v2h2V5H5zm0 3v2h2V8H5z"
        fillRule="evenodd"
      />
    </svg>
  )
}

export default SvgProperty
