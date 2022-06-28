import { classNames } from '../utils'
import { MarkdownComponent } from '../markdownUtils'
import { Tab } from '@headlessui/react'

export default function TaskDescriptionInputField ({
  register,
  watch,
  errorsForField
}) {
  const formTaskDescription = watch('description')

  return <div>
    <label
      htmlFor="description"
      className="mb-2 block text-md font-medium text-gray-700"
    >
      Task Description
    </label>
    <Tab.Group>
      <Tab.List className="flex items-center">
        <Tab
          className={({ selected }) => classNames(selected ? 'text-gray-900 bg-gray-100 hover:bg-gray-300' : 'text-gray-500  hover:text-gray-900 bg-white hover:bg-gray-200', 'px-2 py-1.5 border border-transparent text-sm font-medium rounded-l-sm')}
        >
          Write
        </Tab>
        <Tab
          className={({ selected }) => classNames(selected ? 'text-gray-900 bg-gray-100 hover:bg-gray-300' : 'text-gray-500  hover:text-gray-900 bg-white hover:bg-gray-200', 'px-2 py-1.5 border border-transparent text-sm font-medium rounded-r-sm')}
        >
          Preview
        </Tab>
      </Tab.List>
      <Tab.Panels className="mt-2">
        <Tab.Panel className="p-0.5 -m-0.5 rounded-lg">
          <div>
            <textarea
              {...register('description', { required: true })}
              id="description"
              name="description"
              rows={8}
              className={classNames(
                errorsForField
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'text-gray-900 focus:ring-gray-500 focus:border-gray-500 border-gray-300',
                ' sm:text-sm mt-1 block w-full shadow-sm rounded-sm'
              )}
              defaultValue={''}
              placeholder="Describe what you are looking for and how your community can fulfill it to claim a reward."
            />
            <p className="mt-2 text-sm text-gray-500">
              Your can style this description with{' '}
              <a className="underline text-gray-500 hover:text-gray-600"
                 href="https://commonmark.org/help/"
                 target="_blank" rel="noopener noreferrer"
              >
                Markdown formatting
              </a>.</p>
          </div>
        </Tab.Panel>
        <Tab.Panel className="p-0.5 -m-0.5 rounded-sm">
          <div className="">
            <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
              <MarkdownComponent content={formTaskDescription} />
            </div>
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  </div>
}
