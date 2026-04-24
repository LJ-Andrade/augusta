import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return '';
  
  let date;
  // If it's a simple YYYY-MM-DD string, parse it manually to avoid timezone shift (restar un día)
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
