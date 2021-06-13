import * as React from 'react'

function SvgWarning(props) {
  return (
    <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0 7a7 7 0 017-7 7 7 0 017 7 7 7 0 01-7 7 7 7 0 01-7-7zm7 6A6 6 0 107 1a6 6 0 100 12zm.662-2.125a.6.6 0 11-1.198.001.6.6 0 011.198-.001zm-.002-2.25c0 .27-.273.475-.6.475-.327 0-.6-.205-.6-.475v-5.25c0-.27.273-.475.6-.475.327 0 .6.205.6.475v5.25z" />
    </svg>
  )
}

export default SvgWarning
