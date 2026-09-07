import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type ForecastMonthContextValue = {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
};

const ForecastMonthContext = createContext<ForecastMonthContextValue | null>(null);

export function ForecastMonthProvider({ children }: PropsWithChildren) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const value = useMemo(() => ({ currentMonth, setCurrentMonth }), [currentMonth]);
  return <ForecastMonthContext.Provider value={value}>{children}</ForecastMonthContext.Provider>;
}

export function useForecastMonth() {
  const value = useContext(ForecastMonthContext);
  if (!value) throw new Error('useForecastMonth deve ser usado dentro de ForecastMonthProvider');
  return value;
}
