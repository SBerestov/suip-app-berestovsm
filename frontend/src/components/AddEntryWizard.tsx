import React from 'react';
import { useNotifications } from '../context/NotificationContext';

interface AddEntryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  tableType: string;
  onAddEntry: (data: any) => Promise<void>;
}

interface FormStep {
  column: string;
  translated: string;
  value: string;
}

export const AddEntryWizard: React.FC<AddEntryWizardProps> = ({ 
  isOpen,
  onClose,
  tableType,
  onAddEntry
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [steps, setSteps] = React.useState<FormStep[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { showNotification } = useNotifications();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadFormFields();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, tableType]);

  const loadFormFields = async () => {
    try {
      const response = await fetch(`/api/add-form-fields?table=${tableType}`);
      const data = await response.json();

      const filteredSteps = data.columns
        .filter((col: string) => col !== 'COMMENT' && col !== 'IMAGE_PATH')
        .map((col: string, index: number) => ({
          column: col,
          translated: data.columns_translated[index],
          value: ''
        }));

      setSteps(filteredSteps);
      setCurrentStep(0);
      setFormData({});
    } catch (error) {
      console.log('Ошибка загрузки полей', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({});
    onClose();
  };

  const handleInputChange = (value: string) => {
    const currentColumn = steps[currentStep]?.column;
    if (currentColumn) {
      setFormData(prev => ({ ...prev, [currentColumn]: value }));
    }
  };

  const handleInputSubmit = (e: any) => {
    e.preventDefault();
    handleNext();
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(steps.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onAddEntry(formData);
      showNotification(tableType, 'success');
      handleClose();
    } catch (error: any) {
      alert('Ошибка добавления записи: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepData = steps[currentStep];

  const getTitle = () => {
    if (currentStep >= steps.length) {
      return "Проверьте и отредактируйте данные";
    }
    return currentStepData?.translated || "Добавление записи";
  };

  if (!isOpen || steps.length === 0) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black opacity-50 z-[999]' />

      <div className="fixed w-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-xl z-[1000]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[24px] font-bold leading-none">{getTitle()}</h2>
          <button className="cursor-pointer" onClick={handleClose}>
            <img src="/images/close.svg" height={24} width={24} alt="Закрыть" />
          </button>
        </div>

        {(currentStep >= steps.length) ? (
          <>
            {steps.map((step) => (
              <div key={step.column} className="flex items-center flex-wrap mb-4">
                <label className="basis-[150px] mr-5 text-sm text-[#515151]">
                  {step.translated}:
                </label>
                <input
                  className="text-[16px] font-semibold border-0 pt-1.25 outline-none relative border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none"
                  type="text"
                  onChange={(e) => setFormData(prev => ({ ...prev, [step.column]: e.target.value}))}
                  value={String(formData[step.column] || '')}
                />
              </div>
            ))}
            <div className="col-span-3">
              <label className="pb-1.25 basis-[150px] mr-5 text-sm text-[#515151]">
                Комментарий
              </label>
              <textarea
                onChange={(e) => setFormData(prev => ({ ...prev, COMMENT: e.target.value}))}
                value={formData.COMMENT}
                className="w-[100%] min-h-[100px] rounded-xl border-2 border-[#9f9f9f] py-3 px-4.5 text-[16px] font-semibold box-content font-sans"
              />
            </div>
          </>
        ) : (
          <form onSubmit={handleInputSubmit} className='items-center flex gap-3 mb-3.75 w-full'>
            <input
              type="text"
              value={formData[currentStepData.column] || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full text-base rounded-xl py-1.75 px-5 border-2 border-[#767676]"
              autoFocus
              required
            />
            {currentStep >= steps.length && (
              <button 
                type='button' 
                onClick={handleSubmit} 
                disabled={isLoading}
                className='block cursor-pointer self-end py-3 px-5 bg-black box-border border-0 rounded-xl text-white h-max text-base text-bold items-center'
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            )}
          </form>
        )}
        
        <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-[#0079FF] gap-1 cursor-pointer disabled:opacity-50"
            >
              {currentStep > 0 && (
                <>
                  <img src="/images/arrow-left.svg" height={24} width={24} alt="Назад" />
                  <span className="text-base font-[400] ">Назад</span>
                </>
              )}
            </button>
          
          <div className="flex items-center gap-1">
            <span className="text-black text-3xl font-semibold leading-8">
              {`0${currentStep + 1}`}
            </span>
            <span className="font-semibold text-[#b1b1b1] self-end">
              {`/ 0${steps.length + 1}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};