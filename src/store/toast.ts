'use client';

import { create } from 'zustand';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let counter = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = counter++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'info' }),
  warning: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'warning' }),
};
