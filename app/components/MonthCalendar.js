'use client';

import { useMemo, useState } from 'react';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MonthCalendar({ classes, onSelectDay }) {
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState(null);

  const classesByDay = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      const key = c.class_date;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [classes]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
    setSelected(null);
  }

  function handleDayClick(key, hasClasses) {
    if (!hasClasses) return;
    const next = selected === key ? null : key;
    setSelected(next);
    if (onSelectDay) onSelectDay(next);
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div className="mcal-cell is-empty" key={`empty-${i}`}></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const key = toDateKey(dateObj);
    const dayClasses = classesByDay[key] || [];
    const hasFormule = dayClasses.some((c) => c.is_formule);
    const hasCours = dayClasses.some((c) => !c.is_formule);
    cells.push(
      <button
        type="button"
        key={key}
        className={`mcal-cell ${key === todayKey ? 'is-today' : ''} ${key === selected ? 'is-selected' : ''}`}
        onClick={() => handleDayClick(key, dayClasses.length > 0)}
      >
        <span>{d}</span>
        <div className="mcal-dots">
          {hasCours && <span className="mcal-dot cours"></span>}
          {hasFormule && <span className="mcal-dot formule"></span>}
        </div>
      </button>
    );
  }

  const selectedClasses = selected ? classesByDay[selected] || [] : [];

  return (
    <div className="mcal">
      <div className="mcal-head">
        <button type="button" className="mcal-nav" onClick={() => changeMonth(-1)} aria-label="Mois précédent">‹</button>
        <div className="mcal-month">{MONTHS[month]} {year}</div>
        <button type="button" className="mcal-nav" onClick={() => changeMonth(1)} aria-label="Mois suivant">›</button>
      </div>

      <div className="mcal-weekdays">
        {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
      </div>

      <div className="mcal-grid">{cells}</div>

      <div className="mcal-legend">
        <span><span className="mcal-dot cours"></span>Cours</span>
        <span><span className="mcal-dot formule"></span>Formule petit-déj</span>
      </div>

      {selected && (
        <div className="mcal-detail">
          {selectedClasses.length} cours ce jour-là — vois le détail dans le planning ci-dessous
        </div>
      )}
    </div>
  );
}
