"use client";

import { useState } from "react";

type Truck = {
  id: string;
  driver: string;
  route: string;
  load: number;
  status: "En ruta" | "En descarga" | "En pausa";
  eta: string;
  color: string;
};

const trucks: Truck[] = [
  {
    id: "RC-14",
    driver: "Lucía Méndez",
    route: "Ruta Centro 02",
    load: 74,
    status: "En ruta",
    eta: "11:42",
    color: "#47d7a6",
  },
  {
    id: "RC-08",
    driver: "Mateo Ruiz",
    route: "Ruta Norte 01",
    load: 56,
    status: "En ruta",
    eta: "12:08",
    color: "#74b7ff",
  },
  {
    id: "RC-21",
    driver: "Sofía Álvarez",
    route: "Ruta Parque 03",
    load: 92,
    status: "En descarga",
    eta: "12:31",
    color: "#f5ad5f",
  },
  {
    id: "RC-17",
    driver: "Daniel Costa",
    route: "Ruta Ribera 04",
    load: 18,
    status: "En pausa",
    eta: "13:05",
    color: "#d7d9df",
  },
];
const initialTruck = trucks[0]!;

function Icon({
  name,
  size = 20,
}: {
  name:
    | "menu"
    | "truck"
    | "route"
    | "alert"
    | "calendar"
    | "settings"
    | "bell"
    | "chevron"
    | "locate"
    | "spark"
    | "check"
    | "map";
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 17c5-1 3-8 8-9" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.08h-3v-.08A1.7 1.7 0 0 0 10.68 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.04 15a1.7 1.7 0 0 0-1.56-1.04H5.4v-3h.08A1.7 1.7 0 0 0 7.04 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.08v3H21a1.7 1.7 0 0 0-1.6 1.04Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    locate: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    spark: (
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
  };
  return <svg {...props}>{paths[name]}</svg>;
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`nav-item${active ? " active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );
}

export function OperationsDashboard() {
  const [selectedId, setSelectedId] = useState(initialTruck.id);
  const [planReady, setPlanReady] = useState(false);
  const selected =
    trucks.find((truck) => truck.id === selectedId) ?? initialTruck;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir al contenido principal
      </a>
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="truck" size={23} />
          </span>
          <span>camioncito</span>
        </div>
        <nav className="sidebar-nav">
          <NavItem icon="map" label="Operación" active />
          <NavItem icon="truck" label="Flota" />
          <NavItem icon="route" label="Rutas" />
          <NavItem icon="alert" label="Incidencias" />
          <NavItem icon="calendar" label="Planificación" />
        </nav>
        <div className="sidebar-bottom">
          <NavItem icon="settings" label="Configuración" />
          <div className="account">
            <span className="avatar">LM</span>
            <span>
              <strong>Lucía Méndez</strong>
              <small>Coordinación</small>
            </span>
          </div>
        </div>
      </aside>
      <main id="main-content" className="main-area" tabIndex={-1}>
        <header className="topbar">
          <div>
            <p className="kicker">Operación en vivo</p>
            <h1>Buenos días, Lucía</h1>
            <p className="date-line">Martes, 13 de septiembre</p>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Ver notificaciones"
            >
              <Icon name="bell" />
            </button>
            <button
              className="profile-button"
              type="button"
              aria-label="Abrir perfil de Lucía Méndez"
            >
              <span className="avatar">LM</span>
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </header>
        <section className="metric-grid" aria-label="Resumen de la operación">
          <article className="metric-card">
            <span className="metric-icon green">
              <Icon name="truck" />
            </span>
            <div>
              <p>Unidades activas</p>
              <strong>
                24<span>/28</span>
              </strong>
              <small className="positive">+2 desde las 08:00</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon blue">
              <Icon name="route" />
            </span>
            <div>
              <p>Rutas completadas</p>
              <strong>
                18<span>/34</span>
              </strong>
              <small>53% del plan diario</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon amber">
              <Icon name="alert" />
            </span>
            <div>
              <p>Incidencias abiertas</p>
              <strong>3</strong>
              <small className="warning">2 requieren revisión</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon violet">
              <Icon name="calendar" />
            </span>
            <div>
              <p>Próxima descarga</p>
              <strong>11:42</strong>
              <small>Planta Norte · RC-14</small>
            </div>
          </article>
        </section>
        <section
          className="workspace-grid"
          aria-label="Seguimiento y planificación"
        >
          <article className="map-panel panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">Seguimiento</p>
                <h2>Mapa operativo</h2>
              </div>
              <button className="secondary-button" type="button">
                <Icon name="locate" size={17} /> Centrar flota
              </button>
            </div>
            <div
              className="map-canvas"
              role="img"
              aria-label={`Mapa de la ciudad con ${selected.id} seleccionado en ${selected.route}`}
            >
              <svg
                viewBox="0 0 840 440"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <rect width="840" height="440" fill="#dbe8e2" />
                <path
                  d="M-20 360C120 300 164 400 290 310S485 310 570 200 730 245 880 110"
                  fill="none"
                  stroke="#a5bed2"
                  strokeWidth="35"
                />
                <path
                  d="M-20 360C120 300 164 400 290 310S485 310 570 200 730 245 880 110"
                  fill="none"
                  stroke="#e8f3f7"
                  strokeWidth="19"
                />
                <g stroke="#f8fbf9" strokeWidth="12" fill="none">
                  <path d="M40 55 130 120 250 95 340 160 445 135 525 210 615 170 735 230 830 190" />
                  <path d="M15 205 145 175 210 225 305 205 385 255 470 230 560 285 665 260 805 325" />
                  <path d="M150 -20 170 70 145 175 195 285 185 445" />
                  <path d="M390 -20 405 80 385 255 420 440" />
                  <path d="M660 -20 635 105 665 260 700 445" />
                </g>
                <path
                  d="M78 241 C175 213, 246 196, 305 205 S393 271, 470 230 S548 151, 626 184"
                  fill="none"
                  stroke="#238d70"
                  strokeWidth="8"
                  strokeDasharray="12 9"
                  strokeLinecap="round"
                />
              </svg>
              <div className="map-label district-one">Barrio Centro</div>
              <div className="map-label district-two">Parque Norte</div>
              <div className="map-label district-three">Ribera</div>
              <button
                className="truck-marker selected-marker"
                type="button"
                style={{ left: "55%", top: "47%" }}
                onClick={() => setSelectedId("RC-14")}
                aria-label="Seleccionar RC-14"
              >
                <Icon name="truck" size={17} />
              </button>
              <button
                className="truck-marker"
                type="button"
                style={{ left: "29%", top: "43%" }}
                onClick={() => setSelectedId("RC-08")}
                aria-label="Seleccionar RC-08"
              >
                <Icon name="truck" size={17} />
              </button>
              <button
                className="truck-marker amber-marker"
                type="button"
                style={{ left: "75%", top: "39%" }}
                onClick={() => setSelectedId("RC-21")}
                aria-label="Seleccionar RC-21"
              >
                <Icon name="truck" size={17} />
              </button>
              <div className="map-legend">
                <span>
                  <i className="dot green-dot" /> En ruta
                </span>
                <span>
                  <i className="dot amber-dot" /> Atención
                </span>
              </div>
            </div>
            <div className="selected-route">
              <span className="route-line" aria-hidden="true" />
              <div>
                <strong>
                  {selected.id} · {selected.route}
                </strong>
                <p>
                  {selected.driver} · carga al {selected.load}% · llegada
                  estimada {selected.eta}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSelectedId(
                    trucks[
                      (trucks.findIndex((truck) => truck.id === selected.id) +
                        1) %
                        trucks.length
                    ]!.id,
                  )
                }
              >
                Siguiente unidad <Icon name="chevron" size={16} />
              </button>
            </div>
          </article>
          <aside className="right-rail">
            <section className="panel incidents-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">Requieren atención</p>
                  <h2>Incidencias</h2>
                </div>
                <button className="text-button" type="button">
                  Ver todas
                </button>
              </div>
              <div className="incident-list">
                <article className="incident critical">
                  <span className="incident-signal" />
                  <div>
                    <strong>Desvío detectado</strong>
                    <p>RC-08 · Calle Moreno</p>
                    <time>Hace 7 min</time>
                  </div>
                  <button type="button" aria-label="Abrir incidencia de desvío">
                    <Icon name="chevron" size={17} />
                  </button>
                </article>
                <article className="incident">
                  <span className="incident-signal" />
                  <div>
                    <strong>Contenedor no accesible</strong>
                    <p>Ruta Parque 03 · Av. Sarmiento</p>
                    <time>Hace 18 min</time>
                  </div>
                  <button
                    type="button"
                    aria-label="Abrir incidencia del contenedor"
                  >
                    <Icon name="chevron" size={17} />
                  </button>
                </article>
              </div>
            </section>
            <section className="panel planner">
              <div className="planner-illustration">
                <Icon name="spark" size={28} />
              </div>
              <div>
                <p className="section-label">Planificación inteligente</p>
                <h2>
                  {planReady
                    ? "Recorrido actualizado"
                    : "Ajustá las rutas de hoy"}
                </h2>
                <p>
                  {planReady
                    ? "Se priorizaron las calles con mayor nivel de carga y se evitó el corte en Av. Sarmiento."
                    : "Recalculá el orden de paso según carga, tránsito e incidencias abiertas."}
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => setPlanReady(true)}
                disabled={planReady}
              >
                {planReady ? (
                  <>
                    <Icon name="check" size={17} /> Plan aplicado
                  </>
                ) : (
                  <>
                    <Icon name="spark" size={17} /> Sugerir recorridos
                  </>
                )}
              </button>
            </section>
          </aside>
        </section>
        <section className="fleet-section panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Flota en turno</p>
              <h2>Unidades destacadas</h2>
            </div>
            <button className="secondary-button" type="button">
              Ver flota completa <Icon name="chevron" size={16} />
            </button>
          </div>
          <div
            className="fleet-table"
            role="table"
            aria-label="Estado de las unidades destacadas"
          >
            <div className="fleet-head" role="row">
              <span>Unidad</span>
              <span>Recorrido</span>
              <span>Carga</span>
              <span>Estado</span>
              <span>Próxima parada</span>
            </div>
            {trucks.map((truck) => (
              <button
                role="row"
                className={`fleet-row${selected.id === truck.id ? " selected-row" : ""}`}
                key={truck.id}
                type="button"
                onClick={() => setSelectedId(truck.id)}
              >
                <span className="unit">
                  <i
                    className="unit-color"
                    style={{ background: truck.color }}
                  />
                  <strong>{truck.id}</strong>
                  <small>{truck.driver}</small>
                </span>
                <span>{truck.route}</span>
                <span className="load">
                  <i>
                    <b
                      style={{
                        width: `${truck.load}%`,
                        background: truck.color,
                      }}
                    />
                  </i>
                  {truck.load}%
                </span>
                <span>
                  <em
                    className={`status ${truck.status === "En descarga" ? "discharging" : truck.status === "En pausa" ? "paused" : ""}`}
                  >
                    {truck.status}
                  </em>
                </span>
                <span>{truck.eta}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
