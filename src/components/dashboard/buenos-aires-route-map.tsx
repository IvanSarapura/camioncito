"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";

type ContainerStatus = "ok" | "lleno" | "saturado" | null;

type Props = {
  containerStatus: ContainerStatus;
  routeChanged: boolean;
  recenterToken: number;
};

type MapPoint = { x: number; y: number };

const mapSize = { width: 360, height: 420 };
const zoomLevels = [1, 1.35, 1.75];
const regularRoute: MapPoint[] = [
  { x: 140, y: 344 },
  { x: 140, y: 282 },
  { x: 205, y: 282 },
  { x: 205, y: 218 },
  { x: 277, y: 218 },
  { x: 277, y: 152 },
];
const detourRoute: MapPoint[] = [
  { x: 140, y: 344 },
  { x: 71, y: 344 },
  { x: 71, y: 218 },
  { x: 205, y: 218 },
  { x: 205, y: 152 },
  { x: 277, y: 152 },
];

function pointOnRoute(route: MapPoint[], progress: number) {
  const segment = Math.min(
    Math.floor(progress * (route.length - 1)),
    route.length - 2,
  );
  const segmentProgress = progress * (route.length - 1) - segment;
  const start = route[segment] ?? { x: 0, y: 0 };
  const end = route[segment + 1] ?? start;

  return {
    x: start.x + (end.x - start.x) * segmentProgress,
    y: start.y + (end.y - start.y) * segmentProgress,
    angle: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
  };
}

function viewBoxFor(point: MapPoint, zoom: number) {
  const width = mapSize.width / zoom;
  const height = mapSize.height / zoom;
  const x = Math.max(0, Math.min(point.x - width / 2, mapSize.width - width));
  const y = Math.max(
    0,
    Math.min(point.y - height / 2, mapSize.height - height),
  );

  return `${x} ${y} ${width} ${height}`;
}

function statusColor(status: ContainerStatus) {
  if (status === "lleno") return "#d28a25";
  if (status === "saturado") return "#c44949";
  if (status === "ok") return "#2b956f";
  return "#19765f";
}

export function BuenosAiresRouteMap({
  containerStatus,
  routeChanged,
  recenterToken,
}: Props) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const vehicleRef = useRef<SVGGElement>(null);
  const progressRef = useRef(0.14);
  const lastWheelRef = useRef(0);
  const route = routeChanged ? detourRoute : regularRoute;
  const zoom = zoomLevels[zoomIndex] ?? 1;

  const updateViewport = useCallback(
    (point: MapPoint, nextZoom = zoom) => {
      svgRef.current?.setAttribute("viewBox", viewBoxFor(point, nextZoom));
    },
    [zoom],
  );

  function updateVehicle(point: ReturnType<typeof pointOnRoute>) {
    vehicleRef.current?.setAttribute(
      "transform",
      `translate(${point.x} ${point.y}) rotate(${point.angle})`,
    );
  }

  function adjustZoom(direction: 1 | -1) {
    setZoomIndex((current) => {
      const next = Math.max(
        0,
        Math.min(zoomLevels.length - 1, current + direction),
      );
      const currentRoute = routeChanged ? detourRoute : regularRoute;
      updateViewport(
        pointOnRoute(currentRoute, progressRef.current),
        zoomLevels[next] ?? 1,
      );
      return next;
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const now = performance.now();
    if (now - lastWheelRef.current < 160) return;

    event.preventDefault();
    lastWheelRef.current = now;
    adjustZoom(event.deltaY < 0 ? 1 : -1);
  }

  useEffect(() => {
    const motionPreference = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    if (motionPreference?.matches || !window.requestAnimationFrame) return;

    let frame = 0;
    const startedAt = performance.now();
    const duration = 13_500;

    const animate = (now: number) => {
      const progress = ((now - startedAt) % duration) / duration;
      progressRef.current = progress;
      const point = pointOnRoute(route, progress);
      updateVehicle(point);
      if (zoom > 1) updateViewport(point);
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [route, updateViewport, zoom]);

  useEffect(() => {
    const point = pointOnRoute(route, progressRef.current);
    updateVehicle(point);
    updateViewport(point);
  }, [route, routeChanged, updateViewport, zoomIndex]);

  useEffect(() => {
    if (recenterToken === 0) return;
    const point = pointOnRoute(route, progressRef.current);
    updateViewport(point);
  }, [recenterToken, route, updateViewport]);

  const startingPoint = pointOnRoute(route, 0.14);
  const routePath = routeChanged
    ? "M140 344H71V218h134v-66h72"
    : "M140 344V282h65v-64h72v-66";

  return (
    <div
      className="simulated-map"
      onWheel={handleWheel}
      aria-describedby="simulated-map-description"
    >
      <p id="simulated-map-description" className="visually-hidden">
        Mapa operativo simulado de Centro y Monserrat. Usá los controles para
        acercar o alejar y el botón de ubicación para centrar el camión.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
        aria-hidden="true"
      >
        <rect width="360" height="420" fill="#d9e7e0" />
        <g className="sim-map-blocks">
          <path d="M18 34h46v45H18zM77 34h43v45H77zM135 34h48v45h-48zM197 34h49v45h-49zM261 34h44v45h-44z" />
          <path d="M18 95h46v49H18zM77 95h43v49H77zM135 95h48v49h-48zM197 95h49v49h-49zM261 95h44v49h-44z" />
          <path d="M18 159h46v50H18zM77 159h43v50H77zM135 159h48v50h-48zM197 159h49v50h-49zM261 159h44v50h-44z" />
          <path d="M18 223h46v50H18zM77 223h43v50H77zM135 223h48v50h-48zM197 223h49v50h-49zM261 223h44v50h-44z" />
          <path d="M18 287h46v50H18zM77 287h43v50H77zM135 287h48v50h-48zM197 287h49v50h-49zM261 287h44v50h-44z" />
          <path d="M18 351h46v42H18zM77 351h43v42H77zM135 351h48v42h-48zM197 351h49v42h-49zM261 351h44v42h-44z" />
        </g>
        <path className="sim-map-avenue" d="M190 8v404" />
        <g className="sim-map-streets">
          <path d="M8 83h344M8 150h344M8 215h344M8 280h344M8 345h344" />
          <path d="M71 10v400M127 10v400M190 10v400M253 10v400M312 10v400" />
        </g>
        <path className="sim-map-plaza" d="M20 161h44v48H20z" />
        <g className="sim-map-labels">
          <text x="78" y="72">
            Defensa
          </text>
          <text x="196" y="139">
            Perú
          </text>
          <text x="82" y="205">
            Bolívar
          </text>
          <text x="194" y="269">
            Moreno
          </text>
          <text x="87" y="335">
            Chacabuco
          </text>
          <text x="185" y="358" transform="rotate(-90 185 358)">
            Av. Belgrano
          </text>
          <text x="25" y="190">
            Plaza
          </text>
        </g>
        <path className="sim-map-completed-casing" d="M71 394V344h69" />
        <path className="sim-map-completed" d="M71 394V344h69" />
        <path className="sim-map-route-casing" d={routePath} />
        <path className="sim-map-route" d={routePath} />
        {[
          { x: 205, y: 282 },
          { x: 205, y: 218 },
          { x: 277, y: 218 },
          { x: 277, y: 152 },
        ].map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              className="sim-map-stop-halo"
              cx={point.x}
              cy={point.y}
              r="12"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="7"
              fill={index === 0 ? statusColor(containerStatus) : "#19765f"}
            />
            <text className="sim-map-stop-number" x={point.x} y={point.y + 3}>
              {index + 1}
            </text>
          </g>
        ))}
        <g
          ref={vehicleRef}
          className="sim-map-vehicle"
          transform={`translate(${startingPoint.x} ${startingPoint.y}) rotate(${startingPoint.angle})`}
        >
          <circle className="sim-map-vehicle-halo" r="18" />
          <circle className="sim-map-vehicle-core" r="13" />
          <path d="M-7-5h11v9H-7zM4-2h5l3 3v3H4zM-4 6a2 2 0 1 0 0 .1M8 6a2 2 0 1 0 0 .1" />
        </g>
      </svg>
      <div className="map-simulation-badge" aria-hidden="true">
        <span /> Señal simulada
      </div>
      <div
        className="map-zoom-controls"
        role="group"
        aria-label="Controles de zoom del mapa"
      >
        <button
          type="button"
          onClick={() => adjustZoom(1)}
          disabled={zoomIndex === zoomLevels.length - 1}
          aria-label="Acercar mapa"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(-1)}
          disabled={zoomIndex === 0}
          aria-label="Alejar mapa"
        >
          −
        </button>
      </div>
    </div>
  );
}
