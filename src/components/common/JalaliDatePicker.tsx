import { useMemo, useState } from "react";
import { Button, Input, InputNumber, Popover, Select, Space } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import {
  dateToJalali, firstWeekdayIndex, JALALI_MONTHS, jalaliMonthLength, jalaliToDate,
} from "@/utils/jalali";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const fa = (v: number | string) => String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  /** مقدار به‌صورت ISO میلادی (همان چیزی که به Backend ارسال می‌شود) */
  value?: string | null;
  onChange: (iso: string | undefined) => void;
  showTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function formatJalali(value: string | null | undefined, showTime?: boolean): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const j = dateToJalali(d);
  const date = `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`;
  return fa(showTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date);
}

/**
 * انتخاب تاریخ به‌صورت شمسی؛ مقدار خروجی ISO میلادی است.
 * بدون زمان: ساعت ۱۲:۰۰ تا جابه‌جایی منطقه زمانی روز را تغییر ندهد.
 */
export function JalaliDatePicker({ value, onChange, showTime, disabled, placeholder }: Props) {
  const current = value ? new Date(value) : null;
  const valid = current && !Number.isNaN(current.getTime()) ? current : null;
  const today = dateToJalali(new Date());

  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ jy: today.jy, jm: today.jm });
  const [time, setTime] = useState({ h: 12, m: 0 });

  const selected = valid ? dateToJalali(valid) : null;

  const handleOpen = (next: boolean) => {
    if (next) {
      const base = selected ?? today;
      setView({ jy: base.jy, jm: base.jm });
      setTime(valid && showTime ? { h: valid.getHours(), m: valid.getMinutes() } : { h: showTime ? new Date().getHours() : 12, m: showTime ? new Date().getMinutes() : 0 });
    }
    setOpen(next);
  };

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const idx = v.jy * 12 + (v.jm - 1) + delta;
      return { jy: Math.floor(idx / 12), jm: (idx % 12) + 1 };
    });
  };

  const pick = (jd: number) => {
    const h = showTime ? time.h : 12;
    const m = showTime ? time.m : 0;
    onChange(jalaliToDate(view.jy, view.jm, jd, h, m).toISOString());
    if (!showTime) setOpen(false);
  };

  const changeTime = (h: number, m: number) => {
    setTime({ h, m });
    if (selected) onChange(jalaliToDate(selected.jy, selected.jm, selected.jd, h, m).toISOString());
  };

  const cells = useMemo(() => {
    const len = jalaliMonthLength(view.jy, view.jm);
    const offset = firstWeekdayIndex(view.jy, view.jm);
    return [...Array<null>(offset).fill(null), ...Array.from({ length: len }, (_, i) => i + 1)];
  }, [view]);

  const years = useMemo(() => {
    const out: { value: number; label: string }[] = [];
    for (let y = today.jy - 110; y <= today.jy + 15; y += 1) out.push({ value: y, label: fa(y) });
    return out;
  }, [today.jy]);

  const panel = (
    <div style={{ width: 288 }}>
      <Space.Compact block style={{ marginBottom: 8 }}>
        <Button icon={<RightOutlined />} aria-label="ماه قبل" onClick={() => shiftMonth(-1)} />
        <Select style={{ flex: 1 }} value={view.jm} onChange={(jm) => setView((v) => ({ ...v, jm }))}
          options={JALALI_MONTHS.map((label, i) => ({ value: i + 1, label }))} />
        <Select style={{ width: 92 }} showSearch optionFilterProp="label" value={view.jy}
          onChange={(jy) => setView((v) => ({ ...v, jy }))} options={years} />
        <Button icon={<LeftOutlined />} aria-label="ماه بعد" onClick={() => shiftMonth(1)} />
      </Space.Compact>
      <div className="jcal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="jcal-head">{w}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const isSel = !!selected && selected.jy === view.jy && selected.jm === view.jm && selected.jd === day;
          const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === day;
          return (
            <button key={day} type="button" onClick={() => pick(day)}
              className={`jcal-day${isSel ? " is-selected" : ""}${isToday ? " is-today" : ""}${(i % 7) === 6 ? " is-friday" : ""}`}>
              {fa(day)}
            </button>
          );
        })}
      </div>
      {showTime && (
        <Space style={{ marginTop: 10 }} align="center">
          <span>ساعت</span>
          <InputNumber min={0} max={23} value={time.h} onChange={(h) => changeTime(h ?? 0, time.m)} style={{ width: 70 }} />
          <span>:</span>
          <InputNumber min={0} max={59} value={time.m} onChange={(m) => changeTime(time.h, m ?? 0)} style={{ width: 70 }} />
        </Space>
      )}
      <Space style={{ marginTop: 10, width: "100%", justifyContent: "space-between" }}>
        <Button size="small" onClick={() => {
          setView({ jy: today.jy, jm: today.jm });
          pick(today.jd);
        }}>امروز</Button>
        <Space>
          <Button size="small" danger disabled={!valid} onClick={() => { onChange(undefined); setOpen(false); }}>پاک کردن</Button>
          {showTime && <Button size="small" type="primary" onClick={() => setOpen(false)}>تأیید</Button>}
        </Space>
      </Space>
    </div>
  );

  return (
    <Popover trigger="click" open={open && !disabled} onOpenChange={handleOpen} content={panel} placement="bottom" arrow={false}>
      <Input readOnly disabled={disabled} value={formatJalali(value, showTime)} placeholder={placeholder ?? "انتخاب تاریخ"}
        suffix={<CalendarOutlined />} style={{ cursor: "pointer", width: "100%" }} />
    </Popover>
  );
}
