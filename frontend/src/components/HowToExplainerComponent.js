import Image from 'next/image'

export default function HowToExplainerComponent () {
  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative bg-white pt-16 pb-32 overflow-hidden">
      <div className="relative">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
          <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0">
            <div>
              {/* <div> */}
              {/*   <span className="h-12 w-12 rounded-sm flex items-center justify-center bg-indigo-600"> */}
              {/*     <InboxIcon className="h-6 w-6 text-white" aria-hidden="true" /> */}
              {/*   </span> */}
              {/* </div> */}
              <div className="mt-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  How to use Tacit on Testnet
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Switch your wallet to Goerli Ethereum Testnet in your wallet.
                  <br /><br />
                  If you don't see Goerli as an option, you have to add it first.
                  You can easily add it on {' '}
                  <a className="underline font-medium"
                     target="_blank" rel="noopener noreferrer"
                     href="https://chainlist.org/chain/5">chainlist.org/chain/5
                  </a>. Connect your wallet on chainlist and click "Add to Browser/Metamask".
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => goToTop()}
                    className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-sm shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get started
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="mt-8 border-t border-gray-200 pt-6"> */}
            {/*   <blockquote> */}
            {/*     <div> */}
            {/*       <p className="text-base text-gray-500"> */}
            {/*         &ldquo;Cras velit quis eros eget rhoncus lacus ultrices sed diam. Sit orci risus aenean curabitur */}
            {/*         donec aliquet. Mi venenatis in euismod ut.&rdquo; */}
            {/*       </p> */}
            {/*     </div> */}
            {/*     <footer className="mt-3"> */}
            {/*       <div className="flex items-center space-x-3"> */}
            {/*         <div className="flex-shrink-0"> */}
            {/*           <img */}
            {/*             className="h-6 w-6 rounded-full" */}
            {/*             src="https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80" */}
            {/*             alt="" */}
            {/*           /> */}
            {/*         </div> */}
            {/*         <div className="text-base font-medium text-gray-700">Marcia Hill, Digital Marketing Manager</div> */}
            {/*       </div> */}
            {/*     </footer> */}
            {/*   </blockquote> */}
            {/* </div> */}
          </div>
          <div className="mt-12 sm:mt-16 lg:mt-0">
            <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
              <img
                className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                src="/HowToConnectGoerli1.png"
                alt="Inbox user interface"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
          <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2">
            <div>
              {/* <div> */}
              {/*   <span className="h-12 w-12 rounded-sm flex items-center justify-center bg-indigo-600"> */}
              {/*     <SparklesIcon className="h-6 w-6 text-white" aria-hidden="true" /> */}
              {/*   </span> */}
              {/* </div> */}
              <div className="mt-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  Get ETH and tokens to create a bounty
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Use any of the following links to receive ETH and ERC20 tokens in your wallet on Goerli testnet:
                  <ul>
                    <li className="list-disc ml-4">
                      <a className="underline font-medium"
                         target="_blank" rel="noopener noreferrer"
                         href="https://faucets.chain.link/goerli">ChainLink Goerli Faucet
                      </a>{' '}
                    </li>
                    <li className="list-disc ml-4">
                      <a className="underline font-medium"
                         target="_blank" rel="noopener noreferrer"
                         href="https://erc20faucet.com">ERC20 Faucet
                      </a>
                    </li>
                    <li className="list-disc ml-4">
                      <a className="underline font-medium"
                         target="_blank" rel="noopener noreferrer"
                         href="https://faucet.paradigm.xyz/">Paradigm Faucet
                      </a>
                    </li>
                  </ul>
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => goToTop()}
                    className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-sm shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get started
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 lg:mt-8 lg:col-start-1">
            <div className="pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
              <div
                className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:w-auto lg:max-w-none">
                <Image
                  className=""
                  src="/HowToConnectGoerli2.png"
                  width="1332px"
                  height="840px"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
