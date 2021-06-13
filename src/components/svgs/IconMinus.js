import * as React from 'react'

function SvgIconMinus(props) {
  return (
    <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <rect
          strokeOpacity={0.15}
          stroke="#000"
          fill="#FFF"
          x={0.5}
          y={0.5}
          width={13}
          height={13}
          rx={2}
        />
        <path d="M2 2h10v10H2z" />
        <path
          d="M3.094 6.531h7.812a.469.469 0 110 .938H3.094a.469.469 0 110-.938z"
          fillOpacity={0.65}
          fill="#000"
        />
      </g>
    </svg>
  )
}

export default SvgIconMinus
