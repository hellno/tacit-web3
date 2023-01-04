import { Combobox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { classNames } from '../utils'

export function FormCombobox ({
  items,
  className = ''
}) {
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase())
      })

  return (
    <Combobox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <div className="relative">
        <Combobox.Input
          className={className || 'w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm'}
          onChange={(event) => setQuery(event.target.value)}
          // @ts-ignore
          displayValue={(item) => item?.name}
          placeholder={`${items[0].name}`}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <div className="h-5 w-5 text-gray-400" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </Combobox.Button>

        {filteredItems.length > 0 && (
          <Combobox.Options
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item.name}
                value={item}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-cyan-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({
                  active,
                  selected
                }) => (
                  <>
                    <span className={classNames('block truncate', selected && 'font-semibold')}>{item.name}</span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-cyan-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
