'use client'

import { useEffect, useState } from 'react'
import { getPaymentDetails, PaymentDetails, LoanProductType } from '@/lib/application/products'

interface PaymentCalculatorProps {
  loanAmount: number
  termMonths: number
  productType: LoanProductType
}

export default function PaymentCalculator({ loanAmount, termMonths, productType }: PaymentCalculatorProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)

  useEffect(() => {
    if (loanAmount > 0 && termMonths > 0) {
      const details = getPaymentDetails(loanAmount, termMonths, productType)
      setPaymentDetails(details)
    } else {
      setPaymentDetails(null)
    }
  }, [loanAmount, termMonths, productType])

  if (!paymentDetails) {
    return null
  }

  return (
    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Estimated Payment Details
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Loan Amount:</span>
          <span className="text-xl font-bold text-gray-900">
            ${paymentDetails.loanAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Interest Rate (APR):</span>
          <span className="text-xl font-bold text-blue-600">
            {paymentDetails.aprPercentage}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Loan Term:</span>
          <span className="text-xl font-bold text-gray-900">
            {paymentDetails.termMonths} months
          </span>
        </div>
        
        <div className="border-t border-blue-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">Monthly Payment:</span>
            <span className="text-2xl font-bold text-green-600">
              ${paymentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1 pt-2">
          <div className="flex justify-between">
            <span>Total Interest:</span>
            <span className="font-semibold">
              ${paymentDetails.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount to Repay:</span>
            <span className="font-semibold">
              ${paymentDetails.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border border-blue-200">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This is an estimated payment based on the selected loan amount and term. 
          Final rates and terms are subject to credit approval and underwriting review. 
          Longer terms result in lower monthly payments but higher total interest costs.
        </p>
      </div>
    </div>
  )
}
