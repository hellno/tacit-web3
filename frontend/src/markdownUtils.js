import React from 'react'
import Link from 'next/link'

import { classNames } from './utils'

export const CustomLink = ({
  as,
  href,
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  ...props
}) => (
  <>
    <Link as={as} href={href}>
      <a className="underline" {...props} />
    </Link>
    <br />
  </>
)

export const CustomList = ({
  children,
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  ...props
}) => {
  return <li className={classNames(props.ordered ? 'list-decimal' : 'list-disc', 'ml-4')}>{children}</li>
}

export const CustomLineBreak = () => {
  return <><br /></>
}

export const CustomTr = ({
  key,
  children
}) => {
  return <tr key={key}>{children}</tr>
}
export const CustomTd = ({ children }) => {
  return <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{children}</td>
}

export const CustomTh = ({ children }) => {
  return <th scope="col" className="py-4 px-3 text-left text-sm font-semibold text-gray-900">{children}</th>
}

export const CustomThead = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>
}

export const CustomTable = ({ children }) => {
  return <table className="my-4 min-w-full divide-y divide-gray-300">{children}</table>
}
