
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps: _totalSteps, 
  steps, 
  className = '' 
}: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={index} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

