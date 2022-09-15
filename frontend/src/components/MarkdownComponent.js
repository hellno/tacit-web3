import {
  CustomLineBreak,
  CustomLink,
  CustomList,
  CustomTable,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTr
} from '../markdownUtils'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

const MarkdownComponent = ({ content }) => (
  <div>
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm, remarkHtml, remarkBreaks]}
      components={{
        a: CustomLink,
        li: CustomList,
        br: CustomLineBreak,
        tr: CustomTr,
        table: CustomTable,
        th: CustomTh,
        td: CustomTd,
        thead: CustomThead,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg">{children}</h3>
      }}
    />
  </div>
)

export default MarkdownComponent
