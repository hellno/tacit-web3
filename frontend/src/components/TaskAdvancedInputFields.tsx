import { renderFormField } from '../formUtils'
import { useState } from 'react'
import { MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline'
import { get } from 'lodash'
import { classNames } from '../utils'

export default function TaskAdvancedInputFields ({
  register,
  values,
  allowHide = true
}) {
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)

  const showFields = showAdvancedFields || !allowHide

  return <>
    {allowHide && (<div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <button
          type="button"
          onClick={() => setShowAdvancedFields(!showAdvancedFields)}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-white bg-gray-400 hover:bg-gray-300 focus:outline-none"
        >
          {showAdvancedFields ? 'Hide' : 'Show'} Advanced Options
          {showAdvancedFields
            ? <MinusSmIcon className="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />
            : <PlusSmIcon className="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>)}
    {showFields && (<div className="mt-4 space-y-4 ">
      {renderFormField({
        register,
        name: 'ctaSolution',
        type: 'text',
        required: false,
        label: 'Call To Action on Solution Button',
        placeholder: 'Enter customer details',
        defaultValue: get(values, 'ctaSolution')
      })}
      {renderFormField({
        register,
        name: 'subtitleSolution',
        type: 'text',
        label: 'Subtitle of Solution Button',
        placeholder: 'Submit your answer to become eligible for a reward',
        defaultValue: get(values, 'subtitleSolution')
      })}
      {renderFormField({
        register,
        name: 'ctaReferral',
        type: 'text',
        label: 'Call To Action on Referral Button',
        placeholder: 'Get referral link',
        defaultValue: get(values, 'ctaReferral')
      })}
      {renderFormField({
        register,
        name: 'subtitleReferral',
        type: 'text',
        label: 'Subtitle of Referral Button',
        placeholder: 'Invite others to earn and get a share of their reward',
        defaultValue: get(values, 'subtitleReferral')
      })}
      {renderFormField({
        register,
        name: 'headerSolutionModal',
        type: 'text',
        label: 'Header Title of the Solution Window',
        placeholder: 'Submit your solution',
        defaultValue: get(values, 'headerSolutionModal')
      })}
      {renderFormField({
        register,
        name: 'subtitleSolutionModal',
        type: 'text',
        label: 'Subtitle of the Solution Window',
        placeholder: 'Submit your solution',
        defaultValue: get(values, 'subtitleSolutionModal')
      })}
      <div>
        <label
          htmlFor="multiQuestionField"
          className="block text-md font-medium text-gray-700"
        >
          Questions to answer when submitting a solution
        </label>
        <div>
            <textarea
              {...register('multiQuestionField')}
              id="multiQuestionField"
              name="multiQuestionField"
              rows={8}
              className={classNames(
                get(values, 'multiQuestionField')
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'text-gray-900 focus:ring-gray-500 focus:border-gray-500 border-gray-300',
                ' sm:text-sm mt-1 block w-full shadow-sm rounded-sm'
              )}
              defaultValue={''}
              placeholder="Questions go here, type one question per line. The UI will show separate answer fields for each question."
            />
        </div>
      </div>
      {renderFormField({
        register,
        name: 'primaryColorHex',
        type: 'text',
        label: 'Primary Brand Color',
        placeholder: '#0072D0',
        defaultValue: get(values, 'primaryColorHex')
      })}
      {renderFormField({
        register,
        name: 'hideShareButton',
        type: 'checkbox',
        label: 'Hide Share Button',
        placeholder: 'true',
        defaultValue: get(values, 'hideShareButton')
      })}
    </div>)}
  </>
}
