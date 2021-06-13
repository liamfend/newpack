import * as React from 'react'

function SvgIconPlus(props) {
  return (
    <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <rect stroke="#D9D9D9" fill="#FFF" x={0.5} y={0.5} width={13} height={13} rx={2} />
        <path d="M2 2h10v10H2z" />
        <path
          d="M6.61 6.61V3.015a.39.39 0 01.78 0v3.593h3.594a.39.39 0 010 .782H7.391v3.593a.39.39 0 01-.782 0V7.391H3.016a.39.39 0 010-.782h3.593z"
          fillOpacity={0.65}
          fill="#000"
        />
      </g>
    </svg>
  )
}

export default SvgIconPlus
