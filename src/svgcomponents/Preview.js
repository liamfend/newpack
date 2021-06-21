import * as React from 'react'

function SvgPreview(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17" {...props}>
      <path
        d="M.814.02h16.24c.45 0 .813.36.813.803v12.026a.807.807 0 01-.812.802H.815a.807.807 0 01-.813-.802V.823C.002.61.088.406.24.256A.817.817 0 01.814.02zm.812 1.604v10.424h14.617V1.624H1.626zm6.496 13.63v-1.603h1.624v1.604h3.249v1.603h-8.12v-1.603h3.247z"
        fill="#38B2A6"
      />
    </svg>
  )
}

export default SvgPreview
