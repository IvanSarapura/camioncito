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
const columns = [
  [18, 64],
  [77, 120],
  [135, 183],
  [197, 246],
  [261, 305],
] as const;
const rows = [
  [34, 79],
  [95, 144],
  [159, 209],
  [223, 273],
  [287, 337],
  [351, 393],
] as const;
const parks = new Set(["2-0", "3-4"]);
const cityBlocks = rows.flatMap(([y, bottom], row) =>
  columns.map(([x, right], column) => ({
    x,
    y,
    width: right - x,
    height: bottom - y,
    isPark: parks.has(`${row}-${column}`),
    key: `${row}-${column}`,
  })),
);
const buildingMasses = cityBlocks
  .filter((block) => !block.isPark)
  .flatMap((block, index) => {
    const inset = 7 + (index % 3);
    const split = index % 4 === 0;
    if (!split) {
      return [
        {
          x: block.x + inset,
          y: block.y + inset,
          width: Math.max(8, block.width - inset * 2),
          height: Math.max(8, block.height - inset * 2),
        },
      ];
    }
    const gap = 4;
    const width = Math.max(7, (block.width - inset * 2 - gap) / 2);
    return [
      {
        x: block.x + inset,
        y: block.y + inset,
        width,
        height: block.height - inset * 2,
      },
      {
        x: block.x + inset + width + gap,
        y: block.y + inset,
        width,
        height: block.height - inset * 2,
      },
    ];
  });
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
  const lengths = route.slice(1).map((point, index) => {
    const start = route[index] ?? point;
    return Math.hypot(point.x - start.x, point.y - start.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index] ?? 1;
    const start = route[index] ?? { x: 0, y: 0 };
    const end = route[index + 1] ?? start;
    if (distance <= length || index === lengths.length - 1) {
      const ratio = Math.min(1, distance / length);
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
        angle: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
      };
    }
    distance -= length;
  }
  return { x: 0, y: 0, angle: 0 };
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

function normalizeAngle(angle: number) {
  const normalized = angle % 360;
  if (normalized > 180) return normalized - 360;
  if (normalized < -180) return normalized + 360;
  return normalized;
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
  const vehiclePositionRef = useRef<SVGGElement>(null);
  const vehicleRotationRef = useRef<SVGGElement>(null);
  const progressRef = useRef(0.14);
  const displayedAngleRef = useRef(-90);
  const lastWheelRef = useRef(0);
  const route = routeChanged ? detourRoute : regularRoute;
  const zoom = zoomLevels[zoomIndex] ?? 1;

  const updateViewport = useCallback(
    (point: MapPoint, nextZoom = zoom) => {
      svgRef.current?.setAttribute("viewBox", viewBoxFor(point, nextZoom));
    },
    [zoom],
  );

  const updateVehicle = useCallback(
    (point: ReturnType<typeof pointOnRoute>) => {
      const delta = normalizeAngle(point.angle - displayedAngleRef.current);
      displayedAngleRef.current += delta * 0.18;
      vehiclePositionRef.current?.setAttribute(
        "transform",
        `translate(${point.x} ${point.y})`,
      );
      vehicleRotationRef.current?.setAttribute(
        "transform",
        `rotate(${displayedAngleRef.current})`,
      );
    },
    [],
  );

  function adjustZoom(direction: 1 | -1) {
    setZoomIndex((current) => {
      const next = Math.max(
        0,
        Math.min(zoomLevels.length - 1, current + direction),
      );
      updateViewport(
        pointOnRoute(route, progressRef.current),
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
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
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
  }, [route, updateVehicle, updateViewport, zoom]);

  useEffect(() => {
    const point = pointOnRoute(route, progressRef.current);
    updateVehicle(point);
    updateViewport(point);
  }, [route, routeChanged, updateVehicle, updateViewport, zoomIndex]);

  useEffect(() => {
    if (recenterToken > 0)
      updateViewport(pointOnRoute(route, progressRef.current));
  }, [recenterToken, route, updateViewport]);

  const routePath = routeChanged
    ? "M140 344H71V218h134v-66h72"
    : "M140 344V282h65v-64h72v-66";
  const startingPoint = pointOnRoute(route, 0.14);

  return (
    <div
      className="simulated-map"
      onWheel={handleWheel}
      aria-describedby="simulated-map-description"
    >
      <p id="simulated-map-description" className="visually-hidden">
        Mapa operativo simulado de Centro y Monserrat. Muestra la ruta, los
        puntos de recolección y la posición del camión.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
        aria-hidden="true"
      >
        <rect className="sim-map-land" width="360" height="420" />
        <g className="sim-map-blocks">
          {cityBlocks.map((block) => (
            <rect
              key={block.key}
              className={block.isPark ? "sim-map-park" : "sim-map-block"}
              x={block.x}
              y={block.y}
              width={block.width}
              height={block.height}
            />
          ))}
        </g>
        <g className="sim-map-buildings">
          {buildingMasses.map((building, index) => (
            <rect key={index} {...building} rx="2" />
          ))}
        </g>
        <g className="sim-map-road-edges">
          <path d="M8 83h344M8 150h344M8 215h344M8 280h344M8 345h344" />
          <path d="M71 10v400M127 10v400M190 10v400M253 10v400M312 10v400" />
        </g>
        <g className="sim-map-roads">
          <path d="M8 83h344M8 150h344M8 215h344M8 280h344M8 345h344" />
          <path d="M71 10v400M127 10v400M190 10v400M253 10v400M312 10v400" />
        </g>
        <path className="sim-map-avenue-edge" d="M190 8v404" />
        <path className="sim-map-avenue" d="M190 8v404" />
        <path className="sim-map-avenue-center" d="M190 8v404" />
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
          <text
            className="sim-map-avenue-label"
            x="185"
            y="358"
            transform="rotate(-90 185 358)"
          >
            Av. Belgrano
          </text>
          <text className="sim-map-park-label" x="24" y="187">
            Plaza
          </text>
        </g>
        <path className="sim-map-completed-casing" d="M71 394V344h69" />
        <path className="sim-map-completed" d="M71 394V344h69" />
        <path className="sim-map-route-casing" d={routePath} />
        <path className="sim-map-route" d={routePath} />
        <g className="sim-map-route-markers">
          <circle cx="71" cy="394" r="8" className="sim-map-route-start" />
          <circle cx="277" cy="152" r="8" className="sim-map-route-end" />
        </g>
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
          ref={vehiclePositionRef}
          className="sim-map-vehicle"
          transform={`translate(${startingPoint.x} ${startingPoint.y})`}
        >
          <g
            ref={vehicleRotationRef}
            transform={`rotate(${startingPoint.angle})`}
          >
            <circle className="sim-map-vehicle-halo" r="18" />
            <circle className="sim-map-vehicle-core" r="13" />
            <path d="M-7-5h11v9H-7zM4-2h5l3 3v3H4zM-4 6a2 2 0 1 0 0 .1M8 6a2 2 0 1 0 0 .1" />
          </g>
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
