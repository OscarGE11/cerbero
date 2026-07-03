import { Markup } from "telegraf";

const MONTH_PICKER_COUNT = 12;
const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function currentMonthIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftIsoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthButtonLabel(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, monthNum - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getRecentMonths(count = MONTH_PICKER_COUNT): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

export function daysInMonth(month: string): number {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum, 0).getDate();
}

export function buildQuickDateKeyboard(): ReturnType<
  typeof Markup.inlineKeyboard
> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("Hoy", "add:date:today"),
      Markup.button.callback("Ayer", "add:date:yesterday"),
      Markup.button.callback("Anteayer", "add:date:2days"),
    ],
    [Markup.button.callback("📅 Elegir día", "add:date:pick")],
    [Markup.button.callback("✏️ Escribir fecha", "add:date:manual")],
  ]);
}

export function buildMonthPickerKeyboard(): ReturnType<
  typeof Markup.inlineKeyboard
> {
  const months = getRecentMonths();
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];

  for (let i = 0; i < months.length; i += 2) {
    rows.push(
      months
        .slice(i, i + 2)
        .map((month) =>
          Markup.button.callback(
            formatMonthButtonLabel(month),
            `add:date:m:${month}`,
          ),
        ),
    );
  }

  rows.push([Markup.button.callback("← Volver", "add:date:back")]);
  return Markup.inlineKeyboard(rows);
}

export function buildDayPickerKeyboard(
  month: string,
): ReturnType<typeof Markup.inlineKeyboard> {
  const [year, monthNum] = month.split("-").map(Number);
  const totalDays = daysInMonth(month);
  const firstWeekday = (new Date(year, monthNum - 1, 1).getDay() + 6) % 7;
  const rows: ReturnType<typeof Markup.button.callback>[][] = [
    WEEKDAY_LABELS.map((label) =>
      Markup.button.callback(label, "add:date:noop"),
    ),
  ];

  let week: ReturnType<typeof Markup.button.callback>[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    week.push(Markup.button.callback("·", "add:date:noop"));
  }

  for (let day = 1; day <= totalDays; day++) {
    const isoDay = String(day).padStart(2, "0");
    const isoDate = `${month}-${isoDay}`;
    week.push(Markup.button.callback(String(day), `add:date:d:${isoDate}`));
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(Markup.button.callback("·", "add:date:noop"));
    }
    rows.push(week);
  }

  rows.push([
    Markup.button.callback("← Meses", "add:date:pick"),
    Markup.button.callback("← Inicio", "add:date:back"),
  ]);

  return Markup.inlineKeyboard(rows);
}
