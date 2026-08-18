import React from "react";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
}

const daysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const today = new Date();

  const [day, setDay] = React.useState<number>(
    value ? parseInt(value.split(".")[0]) : today.getDate()
  );
  const [month, setMonth] = React.useState<number>(
    value ? parseInt(value.split(".")[1]) : today.getMonth() + 1
  );
  const [year, setYear] = React.useState<number>(
    value ? parseInt(value.split(".")[2]) : today.getFullYear()
  );

  React.useEffect(() => {
    const daysCount = daysInMonth(month, year);
    if (day > daysCount) setDay(daysCount);

    const formatted = `${String(day).padStart(2, "0")}.${String(month).padStart(2,"0")}.${year}`;
    onChange(formatted);
  }, [day, month, year]);

  return (
    <div className="flex gap-2 w-full">
      {/* День */}
      <div className="flex flex-col w-full gap-1">
        <label className="text-xs text-gray-500">День</label>
        <select
          className="rounded-xl border-2 border-[#767676] px-4 py-2 hover:border-black"
          value={day}
          onChange={(e) => setDay(parseInt(e.target.value))}
        >
          {Array.from(
            { length: daysInMonth(month, year) },
            (_, i) => i + 1
          ).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Месяц */}
      <div className="flex flex-col w-full gap-1">
        <label className="text-xs text-gray-500">Месяц</label>
        <select
          className="rounded-xl border-2 border-[#767676] px-4 py-2 hover:border-black"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Год */}
      <div className="flex flex-col w-full gap-1">
        <label className="text-xs text-gray-500">Год</label>
        <select
          className="rounded-xl border-2 border-[#767676] px-4 py-2 hover:border-black"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 50 }, (_, i) => 1990 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
