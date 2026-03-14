import React from 'react'
import { useState } from 'react';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import './Calendar.css'

interface CalendarCompProps {
  onChange?: (date: Date) => void;
}
const CalendarComp: React.FC<CalendarCompProps> = ({ onChange }) => {

  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <div>
    <Calendar 
      onChange={(value) => {
        if (value instanceof Date) {
          setDate(value);
          if (onChange) {
            onChange(value);
          }
        }
        else if (value === null) {
          setDate(null);
        }
      }} 
      value={date} 
      minDate={new Date()} 
    />
    </div>
  )
}

export default CalendarComp