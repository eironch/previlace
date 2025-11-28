import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";

export function DateRangePicker({
  className,
  date,
  setDate,
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Custom CSS to match the design system
  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #000000;
      --rdp-background-color: #f3f4f6;
      margin: 0;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: #f3f4f6;
    }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      background-color: black;
      color: white;
    }
    .rdp-day_selected.rdp-day_range_middle {
      background-color: #f3f4f6;
      color: black;
    }
  `;

  return (
    <div className={cn("relative grid gap-2", className)}>
      <style>{css}</style>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-center md:justify-start gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
            !date && "text-gray-500"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <DayPicker
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
