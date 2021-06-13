import * as React from 'react'

function SvgDefaultImage(props) {
  return (
    <svg viewBox="0 0 123 124" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none">
        <rect fill="#E7E7E7" width={123} height={124} rx={2} />
        <path
          d="M9 94l21.038-26.94a3.015 3.015 0 014.414-.358l14.814 13.645a3.016 3.016 0 004.541-.535l21.532-32.18a3.006 3.006 0 012.485-1.329 3.01 3.01 0 012.498 1.307L112 94H9zm40.991-50.065c0 4.384-3.58 7.935-8 7.935s-8-3.55-8-7.935c0-4.384 3.58-7.935 8-7.935s8 3.55 8 7.935z"
          fillOpacity={0.574}
          fill="#FFF"
        />
      </g>
    </svg>
  )
}

export default SvgDefaultImage
