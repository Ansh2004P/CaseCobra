import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  })

  return formatter.format(price)
}

export const formSchema = z.object({
  name: z.string().min(3),
  street: z.string().min(5),
  city: z.string().min(3),
  state: z.string().min(3),
  postalCode: z.string().min(6),
  country: z.string().min(3),
})

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
];