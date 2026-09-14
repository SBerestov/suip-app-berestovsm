import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { DatePicker } from '../DatePicker';
import { getSelectSource, getSelectOptions } from '../../fieldConfig';

interface AddEntryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  tableType: string;
  onAddEntry: (data: any) => Promise<number>;
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
  const [materialsCatalog, setMaterialsCatalog] = React.useState<
    { ID: number; NAME: string; TYPE: string; QUANTITY: number }[]
  >([]);
  const [stagedMaterials, setStagedMaterials] = React.useState<
    { material_id: number; name: string; planned: string; actual: string }[]
  >([]);
  const [pickerMaterialId, setPickerMaterialId] = React.useState("");
  const [pickerPlanned, setPickerPlanned] = React.useState("");
  const [pickerActual, setPickerActual] = React.useState("");
  const [options, setOptions] = React.useState<Record<string, string[]>>({});
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

      if (tableType === 'works') {
        filteredSteps.push({
          column: '__materials__',
          translated: 'Материалы',
          value: ''
        });

        const matResponse = await fetch('/api/materials');
        const matData = await matResponse.json();
        setMaterialsCatalog(matData.data);
      }

      const sources = new Set(
        data.columns
          .map((col: string) => getSelectSource(tableType, col))
          .filter(Boolean)
      );
      const loadedOptions: Record<string, string[]> = {};
      if (sources.has('os_models')) {
        const res = await fetch('/api/options/os_models');
        loadedOptions.os_models = (await res.json()).data;
      }
      if (sources.has('equipment_models')) {
        const res = await fetch('/api/options/equipment_models');
        loadedOptions.equipment_models = (await res.json()).data;
      }
      setOptions(loadedOptions);

      setSteps(filteredSteps);
      setCurrentStep(0);
      setFormData({});
      setStagedMaterials([]);
      setPickerMaterialId("");
      setPickerPlanned("");
      setPickerActual("");
    } catch (error) {
      console.log('Ошибка загрузки полей', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({});
    setStagedMaterials([]);
    setPickerMaterialId("");
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
      const addedId = await onAddEntry(formData);

      if (tableType === 'works' && stagedMaterials.length > 0) {
        for (const sm of stagedMaterials) {
          const response = await fetch(`/api/works/${addedId}/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              MATERIAL_ID: sm.material_id,
              PLANNED_QUANTITY: sm.planned,
              ACTUAL_QUANTITY: sm.actual,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Ошибка добавления материала');
          }
        }
      }

      showNotification(tableType, 'success');
      handleClose();
    } catch (error: any) {
      alert('Ошибка добавления записи: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageMaterial = () => {
    if (!pickerMaterialId) return;
    const material = materialsCatalog.find((m) => m.ID === Number(pickerMaterialId));
    if (!material) return;

    const requested = Number(pickerActual) || 0;
    if (requested > material.QUANTITY) {
      alert(
        `Недостаточно на складе: остаток ${material.QUANTITY}, запрошено ${requested}`
      );
      return;
    }

    setStagedMaterials((prev) => [
      ...prev,
      {
        material_id: material.ID,
        name: material.NAME || material.TYPE,
        planned: pickerPlanned,
        actual: pickerActual,
      },
    ]);
    setPickerMaterialId("");
    setPickerPlanned("");
    setPickerActual("");
  };

  const handleUnstageMaterial = (materialId: number) => {
    setStagedMaterials((prev) =>
      prev.filter((m) => m.material_id !== materialId)
    );
  };

  const currentStepData = steps[currentStep];
  const currentSelectSource = currentStepData
    ? getSelectSource(tableType, currentStepData.column)
    : undefined;
  const currentSelectOptions = currentSelectSource
    ? getSelectOptions(tableType, currentSelectSource, options)
    : [];

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

      <div className="fixed w-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-xl z-[1000] md:w-150">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[24px] font-bold leading-none">{getTitle()}</h2>
          <button className="cursor-pointer" onClick={handleClose}>
            <img src="/images/close.svg" height={24} width={24} alt="Закрыть" />
          </button>
        </div>

        {(currentStep >= steps.length) ? (
          <>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-h-75 overflow-y-auto overflow-x-hidden pr-2 mr-[-8px]'>
              {steps.map((step) =>
                step.column === '__materials__' ? (
                  <div key={step.column} className="flex items-center flex-wrap">
                    <label className="basis-[150px] mr-5 text-sm text-[#515151]">
                      {step.translated}:
                    </label>
                    <ul className="flex flex-col gap-1">
                      {stagedMaterials.length === 0 ? (
                        <span className="text-sm text-gray-500">Материалы не выбраны</span>
                      ) : (
                        stagedMaterials.map((sm) => (
                          <li key={sm.material_id} className="text-sm font-semibold">
                            {sm.name}
                            {sm.planned ? ` · План: ${sm.planned}` : ""}
                            {sm.actual ? ` · Факт: ${sm.actual}` : ""}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ) : (
                  <div key={step.column} className="flex items-center flex-wrap">
                    <label className="basis-[150px] mr-5 text-sm text-[#515151]">
                      {step.translated}:
                    </label>
                    <input
                      className="text-[16px] font-semibold border-0 outline-none relative border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none"
                      type="text"
                      onChange={(e) => setFormData(prev => ({ ...prev, [step.column]: e.target.value}))}
                      value={String(formData[step.column] || '')}
                    />
                  </div>
                )
              )}
              <div className="col-auto md:col-span-2">
                <label className="pb-1.25 basis-[150px] mr-5 text-sm text-[#515151]">
                  Комментарий
                </label>
                <textarea
                  onChange={(e) => setFormData(prev => ({ ...prev, COMMENT: e.target.value}))}
                  value={formData.COMMENT}
                  className="w-[100%] min-h-[100px] rounded-xl border-2 border-[#9f9f9f] py-3 px-4.5 text-[16px] font-semibold box-content font-sans"
                />
              </div>
            </div>
            <div className='flex justify-end gap-2 mt-5'>
              <button type='button' onClick={handleBack} className='font-base font-bold items-center py-3 px-6.75 rounded-[30px] border-0 gap-2 h-[48px] cursor-pointer bg-gray-200 text-black box-border hover:bg-gray-300'>Назад</button>
              <button 
                type='button' 
                onClick={handleSubmit} 
                disabled={isLoading}
                className='font-base font-bold items-center py-3 px-6.75 rounded-[30px] border-0 gap-2 h-[48px] cursor-pointer bg-black text-white box-border hover:bg-gray-800'
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </>
        ) : (
          <>
            {currentStepData.column === '__materials__' ? (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <select
                    className="border border-gray-300 rounded-xl px-3 py-2 text-sm min-w-[220px]"
                    value={pickerMaterialId}
                    onChange={(e) => setPickerMaterialId(e.target.value)}
                  >
                    <option value="">Выберите материал...</option>
                    {materialsCatalog
                      .filter((m) => !stagedMaterials.some((s) => s.material_id === m.ID))
                      .map((m) => (
                        <option key={m.ID} value={m.ID}>
                          {m.NAME || m.TYPE}
                          {m.TYPE ? ` (${m.TYPE})` : ""} — остаток: {m.QUANTITY}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    placeholder="План"
                    value={pickerPlanned}
                    onChange={(e) => setPickerPlanned(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-24"
                  />
                  <input
                    type="number"
                    placeholder="Факт"
                    value={pickerActual}
                    onChange={(e) => setPickerActual(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-24"
                  />
                  <button
                    type="button"
                    onClick={handleStageMaterial}
                    disabled={!pickerMaterialId}
                    className="bg-black text-white font-bold text-sm rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                  >
                    Добавить
                  </button>
                </div>

                {stagedMaterials.length > 0 && (
                  <ul className="flex flex-col gap-2 mb-4">
                    {stagedMaterials.map((sm) => (
                      <li
                        key={sm.material_id}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm"
                      >
                        <span className="font-semibold flex-1">{sm.name}</span>
                        <span className="text-gray-600">План: {sm.planned || "-"}</span>
                        <span className="text-gray-600">Факт: {sm.actual || "-"}</span>
                        <button
                          type="button"
                          onClick={() => handleUnstageMaterial(sm.material_id)}
                          className="text-[#FF0000] font-bold cursor-pointer"
                        >
                          Убрать
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <form onSubmit={handleInputSubmit} className='items-center grid gap-3 mb-3.75 w-full md:flex'>
                {['EXPLOITATION_DATE', 'PLANNED_DATE', 'RECEIVE_DATE'].includes(currentStepData.column) ? (
                  <>
                    <DatePicker 
                      value={formData[currentStepData.column]}
                      onChange={(date) => handleInputChange(date)} 
                    />
                    
                    <button 
                      type='button' 
                      onClick={handleNext} 
                      disabled={isLoading}
                      className='block cursor-pointer self-end py-2.5 px-5 bg-black box-border border-0 rounded-[30px] text-white h-max text-base font-bold items-center md:rounded-xl'
                    >
                      {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </>
                ) : currentSelectSource ? (
                  <>
                    <select
                      value={formData[currentStepData.column] || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full text-base rounded-xl py-1.75 px-5 border-2 border-[#767676] bg-white cursor-pointer"
                      autoFocus
                      required
                    >
                      <option value="">Выберите...</option>
                      {currentSelectOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type='button'
                      onClick={handleNext}
                      disabled={isLoading}
                      className='block cursor-pointer self-end py-2.5 px-5 bg-black box-border border-0 rounded-[30px] text-white h-max text-base font-bold items-center md:rounded-xl'
                    >
                      {isLoading ? 'Сохранение...' : 'Далее'}
                    </button>
                  </>
                ) : (
                  <input
                    type="text"
                    value={formData[currentStepData.column] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full text-base rounded-xl py-1.75 px-5 border-2 border-[#767676]"
                    autoFocus
                    required
                  />
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

              {currentStepData.column === '__materials__' && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center text-[#0079FF] gap-1 cursor-pointer"
                >
                  <span className="text-base font-[400]">Далее</span>
                  <img src="/images/arrow-left.svg" height={24} width={24} alt="Далее" className="rotate-180" />
                </button>
              )}
              
              <div className="flex items-center gap-1">
                <span className="text-black text-3xl font-semibold leading-8">
                  {`0${currentStep + 1}`}
                </span>
                <span className="font-semibold text-[#b1b1b1] self-end">
                  {`/ 0${steps.length}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};