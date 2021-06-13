import * as React from 'react'

function SvgShrink(props) {
  return (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.738 5.033l2.21-2.21 1.228 1.23-2.209 2.209 1.268 1.267H8.471V3.765zM5.033 9.738L3.765 8.471h3.764v3.764l-1.267-1.268-2.21 2.21-1.228-1.23zM12.967 16H3.035A3.038 3.038 0 010 12.966V3.034A3.038 3.038 0 013.035 0h9.93A3.038 3.038 0 0116 3.034v9.93A3.036 3.036 0 0112.967 16zM3.035 1.655a1.38 1.38 0 00-1.38 1.38v9.929c0 .761.618 1.38 1.38 1.38h9.93a1.38 1.38 0 001.38-1.38v-9.93a1.38 1.38 0 00-1.38-1.38z"
        fill="#38b2a6"
      />
    </svg>
  )
}

export default SvgShrink