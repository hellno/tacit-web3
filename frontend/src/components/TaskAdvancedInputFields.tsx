import { renderFormField } from '../formUtils'
import { useState } from 'react'
import { MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline'
import { get } from 'lodash'

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
        name: 'ctaReferral',
        type: 'text',
        label: 'Call To Action on Referral Button (optional)',
        placeholder: 'Get referral link',
        defaultValue: get(values, 'ctaReferral')
      })}
      {renderFormField({
        register,
        name: 'ctaSolution',
        type: 'text',
        required: false,
        label: 'Call To Action on Solution Button (optional)',
        placeholder: 'Enter customer details',
        defaultValue: get(values, 'ctaSolution')
      })}
    </div>)}
  </>
}
