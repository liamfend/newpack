import * as React from 'react'

function SvgFilterCalendar(props) {
  return (
    <svg width={14} height={16} xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4.625 9h-1.25A.376.376 0 013 8.625v-1.25C3 7.169 3.169 7 3.375 7h1.25c.206 0 .375.169.375.375v1.25A.376.376 0 014.625 9zM8 8.625v-1.25A.376.376 0 007.625 7h-1.25A.376.376 0 006 7.375v1.25c0 .206.169.375.375.375h1.25A.376.376 0 008 8.625zm3 0v-1.25A.376.376 0 0010.625 7h-1.25A.376.376 0 009 7.375v1.25c0 .206.169.375.375.375h1.25A.376.376 0 0011 8.625zm-3 3v-1.25A.376.376 0 007.625 10h-1.25a.376.376 0 00-.375.375v1.25c0 .206.169.375.375.375h1.25A.376.376 0 008 11.625zm-3 0v-1.25A.376.376 0 004.625 10h-1.25a.376.376 0 00-.375.375v1.25c0 .206.169.375.375.375h1.25A.376.376 0 005 11.625zm6 0v-1.25a.376.376 0 00-.375-.375h-1.25a.376.376 0 00-.375.375v1.25c0 .206.169.375.375.375h1.25a.376.376 0 00.375-.375zM14 3.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 010 14.5v-11A1.5 1.5 0 011.5 2H3V.375C3 .169 3.169 0 3.375 0h1.25C4.831 0 5 .169 5 .375V2h4V.375C9 .169 9.169 0 9.375 0h1.25c.206 0 .375.169.375.375V2h1.5A1.5 1.5 0 0114 3.5zm-1.5 10.813V5h-11v9.313c0 .103.084.187.188.187h10.624a.188.188 0 00.188-.188z"
        fillRule="evenodd"
      />
    </svg>
  )
}

export default SvgFilterCalendar