'use client';

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface DateRangeValue {
  from: string;
  to: string;
}

interface Props {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function DateRangePicker({ value, onChange }: Props) {
  const presets = [
    {
      label: 'Hoy',
      get: () => {
        const today = new Date();
        return { from: isoDate(today), to: isoDate(today) };
      },
    },
    {
      label: '7 días',
      get: () => {
        const to = new Date();
        const from = new Date(Date.now() - 6 * 86400000);
        return { from: isoDate(from), to: isoDate(to) };
      },
    },
    {
      label: '30 días',
      get: () => {
        const to = new Date();
        const from = new Date(Date.now() - 29 * 86400000);
        return { from: isoDate(from), to: isoDate(to) };
      },
    },
    {
      label: 'Mes actual',
      get: () => {
        const now = new Date();
        return {
          from: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
          to: isoDate(new Date()),
        };
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end sm:gap-2">
        <div>
          <Label htmlFor="from" className="mb-1.5 flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            Desde
          </Label>
          <Input
            id="from"
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="to" className="mb-1.5 flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            Hasta
          </Label>
          <Input
            id="to"
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-9"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => onChange(p.get())}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
