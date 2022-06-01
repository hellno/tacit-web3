import React from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { classNames } from './utils'

export const CustomLink = ({
  as,
  href,
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  ...otherProps
}) => (
  <Link as={as} href={href}>
    <a className="underline" {...otherProps} />
  </Link>
)

export const CustomList = ({
  children,
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  ...props
}) => {
  return <li className={classNames(props.ordered ? 'list-decimal' : 'list-disc', 'ml-4')}>{children}</li>
}

export const MarkdownComponent = ({ content }) => (
  <ReactMarkdown
    children={content}
    remarkPlugins={[remarkGfm, remarkHtml]}
    components={{
      a: CustomLink,
      li: CustomList
    }}
  />
)
