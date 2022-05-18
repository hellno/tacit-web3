import { useContext, useEffect, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import Web3Modal from 'web3modal'

import { ethers } from 'ethers'
import { isEmpty, startCase } from 'lodash'
import { useForm } from 'react-hook-form'
import {
  connectWallet,
  contractABI,
  contractAddress,
  providerOptions,
  renderWalletConnectComponent
} from '../src/walletUtils'
import { classNames } from '../src/utils'
import Web3NavBar from '../src/components/Web3NavBar'
import { AppContext } from '../src/context'
import { renderFormField, renderWalletAddressInputField } from '../src/formUtils'
import Image from 'next/image'

enum TaskSubmissionState {
  WaitForSending,
  StartedSending,
  WaitingForUserAccept,
  Success,
  UserRejected,
}

export default function Home () {
  const [state, dispatch] = useContext(AppContext)
  const {
    account,
    library
  } = state
  const [web3Modal, setWeb3Modal] = useState()
  const [taskSubmissionState, setTaskSubmissionState] =
    useState<TaskSubmissionState>(TaskSubmissionState.WaitForSending)

  const {
    register,
    handleSubmit
  } = useForm()

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }
  })

  const isWalletConnected = !isEmpty(account)

  const handleFormSubmit = (formData: {
    taskTitle: string
    description: string
    email: string
    bountyAmount: bigint
    bountyCurrency: string
  }) => {
    addTask({
      title: formData.taskTitle,
      description: formData.description,
      bountyAmount: formData.bountyAmount,
      bountyCurrency: formData.bountyCurrency
    })
  }

  const addTask = async ({
    title,
    description,
    bountyAmount,
    bountyCurrency
  }: {
    title: string
    description: string
    bountyAmount: bigint
    bountyCurrency: string
  }) => {
    try {
      if (library) {
        // @ts-ignore
        const signer = library.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.addTask(title, description)
        console.log('Mining...', waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log('Ethereum provider object doesn\'t exist!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const web3ModalTemp = new Web3Modal({
      // network: 'mainnet', // optional
      cacheProvider: true, // optional
      providerOptions // required
    })
    // @ts-ignore
    setWeb3Modal(web3ModalTemp)

    if (web3ModalTemp.cachedProvider) {
      connectWallet(web3ModalTemp, dispatch)
    }
  }, [])

  const renderAmountAndCurrencyFormfield = () => {
    return (
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            name="price"
            id="price"
            className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-sm"
            placeholder="0.00001"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="focus:ring-yellow-500 focus:border-yellow-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-sm"
            >
              <option>ETH</option>
              <option>DAI</option>
              <option>OHM</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // @ts-ignore
  const onFormSubmit = handleSubmit(handleFormSubmit)

  // @ts-ignore
  return (
    <div className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Web3NavBar web3Modal={web3Modal} />
        <main className="mt-16 sm:mt-24">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div
                className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                <div>
                  <a
                    href="#"
                    className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200"
                  >
                    <span
                      className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-yellow-500 rounded-full">
                      WAGMI
                    </span>
                    <span className="ml-4 text-sm">
                      Thank you for being here
                    </span>
                    <ChevronRightIcon
                      className="ml-2 w-5 h-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                  <h1
                    className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                    <span className="md:block">Crowd search tasks</span>{' '}
                    <span className="text-yellow-400 md:block">
                      for service DAOs
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                    qui lorem cupidatat commodo. Elit sunt amet fugiat veniam
                    occaecat fugiat aliqua ad ad non deserunt sunt.
                  </p>
                  <p className="mt-8 text-sm text-white uppercase tracking-wide font-semibold sm:mt-10">
                    Used by
                  </p>
                  <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                    <div className="flex flex-wrap items-start justify-between">
                      <div className="flex justify-center px-1">
                        {/* <Image */}
                        {/*   className="h-9 sm:h-10" */}
                        {/*   src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg" */}
                        {/*   alt="Tuple" */}
                        {/* /> */}
                      </div>
                      <div className="flex justify-center px-1">
                        <Image
                          className="h-9 sm:h-10 invert"
                          src="/arweave.png"
                          alt="Arweave"
                          height="28"
                          width="130"
                        />
                      </div>
                      <div className="flex justify-center px-1">
                        {/* <Image */}
                        {/*   className="h-9 sm:h-10" */}
                        {/*   src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" */}
                        {/*   alt="StaticKit" */}
                        {/*   height="28" */}
                        {/*   width="28" */}
                        {/* /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-sm sm:overflow-hidden">
                  <div className="px-4 py-8 sm:px-10">
                    <div className="mt-6">
                      <form onSubmit={onFormSubmit} className="space-y-6">
                        <div>
                          <label
                            htmlFor="walletAddress"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Wallet Address
                          </label>
                          {isWalletConnected ? renderWalletAddressInputField(account) : (
                            <div className="mt-1">
                              {renderWalletConnectComponent(account, web3Modal, dispatch)}
                            </div>
                          )}
                        </div>
                        {renderFormField({
                          register,
                          name: 'email',
                          type: 'email',
                          required: true
                        })}
                        {renderFormField({
                          register,
                          name: 'taskTitle',
                          type: 'text',
                          required: true
                        })}
                        {renderAmountAndCurrencyFormfield()}
                        <div className="">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Task Description
                          </label>
                          <div className="mt-1">
                            <textarea
                              {...register('description')}
                              id="description"
                              name="description"
                              required
                              rows={3}
                              className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                              defaultValue={''}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Write a few sentences about the task and how others
                            can fulfill it.
                          </p>
                        </div>
                        <div>
                          <button
                            type="submit"
                            disabled={!isWalletConnected}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
                          >
                            Submit Task
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
                    <p className="text-xs leading-5 text-gray-500">
                      By signing up, you agree to be{' '}
                      <a
                        href="#"
                        className="font-medium text-gray-900 hover:underline"
                      >
                        kind
                      </a>{' '}
                      and{' '}
                      <a
                        href="#"
                        className="font-medium text-gray-900 hover:underline"
                      >
                        extra chill
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
