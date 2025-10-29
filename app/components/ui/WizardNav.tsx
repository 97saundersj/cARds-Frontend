import React from "react";

const STEP_LABELS = [
  "Card Management",
  "Card Front",
  "AR Card",
  "Landing Page",
];

export function WizardNav(props: any) {
  const { currentStep = 1, totalSteps = 4, goToStep } = props;

  const getStepClass = (step: number) => {
    if (step === currentStep) return "bg-primary";
    if (step < currentStep) return "bg-success";
    return "bg-secondary";
  };

  const getTextClass = (step: number) => {
    if (step === currentStep) return "text-secondary";
    if (step < currentStep) return "text-success";
    return "text-muted";
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        {STEP_LABELS.map((label, index) => {
          const step = index + 1;
          const isClickable = step <= currentStep;

          return (
            <React.Fragment key={step}>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className={`btn border-0 p-0 bg-transparent`}
                  disabled={!isClickable}
                  onClick={() => goToStep?.(step)}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${getStepClass(
                      step
                    )}`}
                    style={{ width: 40, height: 40 }}
                  >
                    {step < currentStep ? <i className="fas fa-check" /> : step}
                  </div>
                </button>
                <div
                  className={`ms-2 d-none d-md-block fw-bold ${getTextClass(step)}`}
                >
                  {label}
                </div>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-grow-1 mx-3 opacity-50 ${
                    step < currentStep ? "bg-success" : "bg-secondary"
                  }`}
                  style={{ height: 2 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="d-md-none mt-2 text-center">
        <small className="text-muted">
          Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep - 1]}
        </small>
      </div>
    </div>
  );
}
