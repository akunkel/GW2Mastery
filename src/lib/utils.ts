import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextStroke(size: number, color: string = 'black'): string {
  const s = `${size}em`;
  const n = `-${size}em`;

  // Defines the 8 points around the text (diagonals and cardinals)
  const shadows = [
    `${s} ${s} 0 ${color}`, // bottom-right
    `${n} ${n} 0 ${color}`, // top-left
    `${s} ${n} 0 ${color}`, // top-right
    `${n} ${s} 0 ${color}`, // bottom-left
    `0 ${s} 0 ${color}`, // bottom
    `0 ${n} 0 ${color}`, // top
    `${s} 0 0 ${color}`, // right
    `${n} 0 0 ${color}`, // left
  ];

  return shadows.join(', ');
}
