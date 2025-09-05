"use client";

import { useState, useEffect } from "react";
import { format, parse, setYear, setMonth, getYear, getMonth, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

// Função utilitária para converter uma data para UTC
function toUTCDate(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

// Função utilitária para criar uma data em UTC
function createUTCDate(year: number, month: number, day: number = 1): Date {
  const date = new Date(Date.UTC(year, month, day));
  return toUTCDate(date);
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const [selectedYear, setSelectedYear] = useState<number>(date ? getYear(date) : new Date().getUTCFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(date ? getMonth(date) : new Date().getUTCMonth());
  const [inputValue, setInputValue] = useState<string>(date ? format(toUTCDate(date), "dd/MM/yyyy") : "");
  const [currentMonth, setCurrentMonth] = useState<Date>(createUTCDate(selectedYear, selectedMonth));

  useEffect(() => {
    setCurrentMonth(createUTCDate(selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    if (date) {
      const updatedDate = setYear(toUTCDate(date), year);
      onChange(updatedDate);
    } else {
      onChange(createUTCDate(year, selectedMonth));
    }
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    if (date) {
      const updatedDate = setMonth(toUTCDate(date), month);
      onChange(updatedDate);
    } else {
      onChange(createUTCDate(selectedYear, month));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      const utcDate = toUTCDate(parsedDate);
      setSelectedYear(getYear(utcDate));
      setSelectedMonth(getMonth(utcDate));
      onChange(utcDate);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const utcDate = toUTCDate(selectedDate);
      setSelectedYear(getYear(utcDate));
      setSelectedMonth(getMonth(utcDate));
      setInputValue(format(utcDate, "dd/MM/yyyy"));
    }
    onChange(selectedDate ? toUTCDate(selectedDate) : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-auto justify-start text-left font-normal h-10",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(toUTCDate(date), "PPPP", { locale: ptBR }) : <span>Escolha uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {/* Campo de entrada para a data */}
        <div className="p-2">
          <Input
            placeholder="dd/MM/yyyy"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {/* Seletor de ano */}
        <div className="p-2">
          <Select onValueChange={(value) => handleYearChange(Number(value))} value={selectedYear.toString()}>
            <SelectTrigger>
              <SelectValue>{selectedYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getUTCFullYear() - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Seletor de mês */}
        <div className="p-2">
          <Select onValueChange={(value) => handleMonthChange(Number(value))} value={selectedMonth.toString()}>
            <SelectTrigger>
              <SelectValue>{format(createUTCDate(selectedYear, selectedMonth), "MMMM", { locale: ptBR })}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(createUTCDate(selectedYear, i), "MMMM", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendário */}
        <Calendar
          mode="single"
          selected={date ? toUTCDate(date) : undefined}
          onSelect={handleDateSelect}
          initialFocus
          locale={ptBR}
          defaultMonth={currentMonth} // Usa o estado `currentMonth` atualizado
        />
      </PopoverContent>
    </Popover>
  );
}
