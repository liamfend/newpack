import * as React from 'react'

function SvgFailedError(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} {...props}>
      <g fill="#F9A600">
        <path d="M12.46 18.643a1.491 1.491 0 102.983 0 1.491 1.491 0 00-2.983 0zm.497-9.446v5.718a.25.25 0 00.249.248h1.491a.25.25 0 00.249-.248V9.197a.25.25 0 00-.249-.248h-1.491a.25.25 0 00-.249.248z" />
        <path d="M14 0C6.269 0 0 6.269 0 14s6.269 14 14 14 14-6.269 14-14S21.731 0 14 0zm0 25.625C7.581 25.625 2.375 20.419 2.375 14S7.581 2.375 14 2.375 25.625 7.581 25.625 14 20.419 25.625 14 25.625z" />
      </g>
    </svg>
  )
}

export default SvgFailedError
