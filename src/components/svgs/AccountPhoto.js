import * as React from 'react'

function SvgAccountPhoto(props) {
  return (
    <svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none">
        <circle fill="#F8F8F6" cx={44.116} cy={43.838} r={43.784} />
        <path
          d="M44.154 87.795a43.58 43.58 0 0024.054-7.202c-2.597-13.44-7.754-14.32-7.754-14.32H26.612s-4.212.331-7.603 13.587a43.583 43.583 0 0025.145 7.935z"
          fill="#FCCE01"
        />
        <circle fill="#3B3B3B" cx={43.691} cy={37.915} r={21.135} />
        <path
          d="M36.871 55.52h13.544v10.833a6.77 6.77 0 11-13.54 0V55.52h-.004z"
          fill="#000"
          opacity={0.1}
        />
        <path
          d="M38.164 55.018h10.958a1.293 1.293 0 011.293 1.293v9.54a6.77 6.77 0 01-6.77 6.77 6.77 6.77 0 01-6.77-6.77v-9.54c0-.715.579-1.293 1.293-1.293h-.004z"
          fill="#FFDDCA"
        />
        <path
          d="M36.898 60.633a19.491 19.491 0 0013.544.039v-1.664H36.898v1.625z"
          fill="#000"
          opacity={0.1}
        />
        <circle fill="#FFDDCA" cx={43.691} cy={42.13} r={19.41} />
        <path
          d="M30 24.898s11.707 21 34.288 14.102l-8.397-15.58L46.369 20 30 24.898z"
          fill="#000"
          opacity={0.1}
        />
        <path
          d="M29.87 24.23s12.545 21.606 34.418 14.063L55.76 22.75l-9.521-3.42-16.37 4.898z"
          fill="#3B3B3B"
        />
        <ellipse fill="#FFDDCA" cx={24.277} cy={42.111} rx={1.806} ry={3.385} />
        <ellipse fill="#FFDDCA" cx={63.101} cy={42.111} rx={1.806} ry={3.385} />
        <path fill="#3B3B3B" d="M28.646 24.72l3.787-1.954.853 3.13-2.32 1.58z" />
      </g>
    </svg>
  )
}

export default SvgAccountPhoto
