import * as React from 'react'

function SvgCreateZipcode(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 12" {...props}>
      <path d="M13.998 12H1.002C.45 12 .001 11.526 0 10.942V7.13c0-.257.13-.495.34-.624a.65.65 0 01.683 0c.21.129.34.367.34.624v3.429h12.273V1.44H1.364v1.938h7.43c.377 0 .682.323.682.72 0 .398-.305.72-.681.72h-7.78c-.56 0-1.014-.48-1.015-1.073V1.058C0 .475.45 0 1.002 0h12.996C14.55 0 15 .475 15 1.058v9.884c0 .584-.449 1.057-1.002 1.058z" />
      <rect width={4} height={2} x={3} y={7} rx={1} />
    </svg>
  )
}

export default SvgCreateZipcode
