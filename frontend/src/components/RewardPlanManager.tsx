import { Fragment, useState } from 'react'
import { TagIcon } from '@heroicons/react/20/solid'
import { classNames } from '../utils'
import { FormCombobox } from './FormCombobox'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

const initialConditions = [{
  id: 2,
  type: 'condition',
  condition: 'If',
  options: [{ name: 'Total days booked is more than' }, { name: 'Membership time is more than' }],
  optionsDetails: [{ name: 'day(s)' }, { name: 'week(s)' }]
}]

const additionalConditions = [
  {
    id: 3,
    type: 'operator',
    operator: 'and'
  },
  {
    id: 4,
    type: 'condition',
    condition: 'If',
    options: [{ name: 'Average rating was above' }, { name: 'Host hosted 10 users' }, { name: 'User had first stay' }],
    optionsDetails: [{ name: 'Stars ⭐️' }, { name: 'Successful Host Legendary NFT' }]
  }
]
const initialOutputs = [{
  id: 6,
  type: 'output',
  options: [{ name: 'Send ERC20 Tokens' }, { name: 'Send NFT' }],
  optionsDetails: [{ name: 'Governance tokens' }, { name: 'Successful Host Legendary NFT' }],
  comment: 'Handing out governance tokens to active users distributes ownership and increases governance participation'
}]
const additionalOutputs = [
  {
    id: 7,
    type: 'operator',
    operator: 'and'
  },
  {
    id: 8,
    type: 'output',
    options: [{ name: 'Send NFT' }, { name: 'Send ERC20 Tokens' }],
    optionsDetails: [{ name: 'Successful Host Legendary NFT' }, { name: 'Governance tokens' }]
  }]

export const RewardPlanManager = () => {
  const [conditions, setConditions] = useState(initialConditions)
  const [outputs, setOutputs] = useState(initialOutputs)

  const activities = [
    {
      id: 1,
      type: 'command',
      command: 'When',
      options: [{ name: 'Host finished first stay' }, { name: 'Host hosted 10 users' }, { name: 'User had first stay' }]
    },
    ...conditions,
    {
      id: 5,
      type: 'action',
      action: 'add-rule',
      // @ts-ignore
      onClick: () => setConditions([...conditions, ...additionalConditions])
    },
    ...outputs,
    {
      id: 9,
      type: 'action',
      action: 'Add another reward',
      // @ts-ignore
      onClick: () => setOutputs([...outputs, ...additionalOutputs])
    }
  ]

  const resetRewardPlan = () => {
    setConditions(initialConditions)
    setOutputs(initialOutputs)
  }

  const renderActivityElement = (activity) => {
    switch (activity.type) {
      case 'command':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {activity.command}
              </span>
              <FormCombobox
                className="flex-1 mr-8 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          {/* <div className="ml-20 mt-2 min-w-0 flex-1"> */}
          {/*   <div> */}
          {/*     <div className="text-sm"> */}
          {/*       <a href="#" className="font-medium text-gray-900"> */}
          {/*         Person name goes here hello */}
          {/*       </a> */}
          {/*     </div> */}
          {/*   </div> */}
          {/*   <div className="mt-2 text-sm text-gray-700"> */}
          {/*     <p>{activity.comment}</p> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      case 'condition':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-6 text-gray-500 sm:text-sm">
                {activity.condition}
              </span>
              <FormCombobox
                className="flex-1 mr-16 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          <div className="ml-14 mt-2 min-w-full flex-1">
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="3"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {activity.optionsDetails.map(detail =>
                    <option>{detail.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>{activity.comment}</p>
            </div>
          </div>
        </div>
      case 'output':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-500 sm:text-sm">
                Then
              </span>
              <FormCombobox
                className="flex-1 mr-8 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          <div className="ml-14 mt-2 min-w-full flex-1">
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {activity.optionsDetails.map(detail =>
                    <option>{detail.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="min-w-0 w-72 mt-2 text-sm text-gray-700">
              <p>{activity.comment}</p>
            </div>
          </div>
        </div>
      case 'operator':
        return <div className="-my-4 flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {activity.operator}
              </span>
            </div>
          </div>
        </div>
      case 'tags':
        return <>
          <div>
            <div className="relative px-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 py-0">
            <div className="text-sm leading-8 text-gray-500">
                        <span className="mr-0.5">
                          <a href={activity.person.href} className="font-medium text-gray-900">
                            {activity.person.name}
                          </a>{' '}
                          added tags
                        </span>{' '}
              <span className="mr-0.5">
                  {activity.tags.map((tag) => (
                    <Fragment key={tag.name}>
                      <a
                        href={tag.href}
                        className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm"
                      >
                        <span className="absolute flex flex-shrink-0 items-center justify-center">
                          <span
                            className={classNames(tag.color, 'h-1.5 w-1.5 rounded-full')}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="ml-3.5 font-medium text-gray-900">{tag.name}</span>
                      </a>{' '}
                    </Fragment>
                  ))}
                </span>
              {/* <span className="whitespace-nowrap">{activity.date}</span> */}
            </div>
          </div>
        </>
      case 'action':
        return activity.action === 'add-rule'
          ? <div>
            <div className="relative px-1">
              <div
                className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={activity.onClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 relative inline-flex items-center rounded-lg border border-gray-100 px-12 py-0.5 text-sm"
                >
                  <PlusCircleIcon className="-ml-1 mr-2 h-4 w-4"
                                  aria-hidden="true" />
                  <span className="my-0.5 font-medium">Add rule</span>
                </button>
              </div>
            </div>
          </div>
          : <div>
            <div className="relative px-1">
              <div
                className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={activity.onClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 relative inline-flex items-center rounded-lg border border-gray-100 px-12 py-0.5 text-sm"
                >
                  <span className="my-0.5 font-medium">{activity.action}</span>
                </button>
              </div>
            </div>
          </div>
      default:
        return null
    }
  }

  const canReset = (conditions.length !== initialConditions.length) || (outputs.length !== initialOutputs.length)

  return <div className="mb-8 flow-root">
    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
      <button
        type="button"
        className={classNames(canReset ? 'cursor-pointer hover:bg-gray-400' : 'cursor-default',
          'rounded-md bg-gray-300 text-white shadow-sm focus:outline-none')}
        onClick={() => canReset ? resetRewardPlan() : null}
      >
        <span
          className="inline-flex justify-center py-0.5 px-2 text-sm font-medium">
          Reset
        </span>
      </button>
    </div>
    <ul role="list" className="-mb-8">
      {activities.map((activity, activityIdx) => (
        <li key={activityIdx}>
          <div className="relative pb-8">
            {activityIdx !== activities.length - 1
              ? (<span className="absolute top-5 left-8 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />)
              : null}
            <div className="relative flex items-start space-x-3">
              {renderActivityElement(activity)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
}
