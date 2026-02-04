'use client'

import { FormField } from '@/lib/application/types'

interface FormFieldProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
}

export default function FormFieldComponent({ field, value, onChange, error }: FormFieldProps) {
  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white px-3 py-2"
  const errorClasses = error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case 'number':
        // Check if this is a currency field based on field name
        const isCurrencyField = ['annualRevenue', 'monthlyRevenue', 'monthlyExpenses', 'existingDebt', 'averageBalance'].includes(field.name)
        
        if (isCurrencyField) {
          // Format display value with commas
          const displayValue = value ? Number(value).toLocaleString() : ''
          
          return (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                id={field.id}
                name={field.name}
                value={displayValue}
                onChange={(e) => {
                  // Remove commas and non-numeric characters except digits
                  const numericValue = e.target.value.replace(/[^0-9]/g, '')
                  onChange(numericValue)
                }}
                placeholder={field.placeholder}
                required={field.required}
                className={`${baseClasses} ${errorClasses} pl-7`}
              />
            </div>
          )
        }
        
        return (
          <input
            type="number"
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.name}
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.id} className="ml-2 block text-sm text-gray-900">
              {field.label}
            </label>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}_${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${field.id}_${option.value}`} className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )

      case 'file':
        return (
          <div>
            <input
              type="file"
              id={field.id}
              name={field.name}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onChange({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                  })
                }
              }}
              required={field.required}
              className={`${baseClasses} ${errorClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {value && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {value.name} ({Math.round(value.size / 1024)} KB)
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Don't render label for checkbox (it's handled inside the field)
  if (field.type === 'checkbox') {
    return (
      <div>
        {renderField()}
        {field.helpText && (
          <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}