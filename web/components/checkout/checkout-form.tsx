"use client";

import { useFormStatus } from "react-dom";

export default function CheckoutForm({ initialData = {} }: { initialData?: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium font-serif border-b border-bone pb-2">Información de Envío</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Nombre</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData.first_name}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Apellido</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData.last_name}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData.email}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Teléfono</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData.phone}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Dirección Completa</label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="Calle, Número, Piso, Depto"
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData.address}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Ciudad</label>
          <input
            id="city"
            name="city"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData.city}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="postal_code" className="text-xs font-semibold uppercase tracking-wider text-stone-brown">Código Postal</label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData.postal_code}
          />
        </div>
      </div>
    </div>
  );
}
