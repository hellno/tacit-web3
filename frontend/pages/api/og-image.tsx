// eslint-disable-next-line no-unused-vars
import { withOGImage } from 'next-api-og-image'

enum QueryParams {
  'title',
  'bounty',
}

export default withOGImage<'query', keyof typeof QueryParams>({
  strategy: 'query', // Query strategy is the default one
  dev: {
    inspectHtml: true,
    errorsInResponse: true
  },
  template: {
    react: ({
      title,
      bounty
    }) => {
      return (
        <html>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script async dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: {
                        light: '#FFABAB',
                        DEFAULT: '#FF8788'
                      },
                      secondary: {
                        light: '#4d9dde',
                        DEFAULT: '#0072D0'
                      },
                      light: {
                        DEFAULT: '#FBFBFB'
                      },
                      background: '#141414'
                    }
                  }
                }
              }`
          }} />
        </head>
        <body className="">
        <div className="relative">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div
              className="bg-gradient-to-b from-background to-primary relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              {/* <div className="absolute inset-0"> */}
              {/*   <img */}
              {/*     className="h-full w-full object-cover" */}
              {/*     src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100" */}
              {/*     alt="People working on laptops" */}
              {/*   /> */}
              {/*   <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" /> */}
              {/* </div> */}
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-24 lg:px-8">
                <div
                  className="inline-flex items-center text-white rounded-full pb-20 lg:text-lg xl:text-base"
                >
                  <span className="ml-2 mr-2 text-sm">Welcome to</span>
                  <span
                    className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-secondary rounded-full">
                  TACIT
                </span>
                </div>
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-primary">{title}</span>
                  <span className="mt-2 block text-light">{bounty}</span>
                </h1>
                {/* <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-200 sm:max-w-3xl"> */}
                {/*   Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt */}
                {/*   amet fugiat veniam occaecat fugiat aliqua. */}
                {/* </p> */}
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
                    <a
                      href="#"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-2xl font-medium rounded-md shadow-lg text-light bg-secondary-light sm:px-8"
                    >
                      Earn the bounty on Tacit
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
        </html>
      )
    }
  }
})
