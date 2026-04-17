// Announcement bar — shown at the very top of the page
export function AnnouncementBar() {
  return (
    <div
      style={{ backgroundColor: "var(--pb-announce-bg)", color: "var(--pb-announce-text)" }}
      className="w-full py-2 text-center text-xs font-medium tracking-widest uppercase"
    >
      Envíos gratis en pedidos mayoristas · Temporada Otoño–Invierno 2025
    </div>
  );
}
