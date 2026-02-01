interface ProgressBarProps {
  current: number
  total: number
  percentage: number
}

export default function ProgressBar({ current, total, percentage }: ProgressBarProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Application Progress
        </span>
        <span className="text-sm text-gray-500">
          {current} of {total} steps completed
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600">{percentage}% Complete</span>
      </div>
    </div>
  )
}