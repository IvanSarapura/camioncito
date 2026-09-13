import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="kicker">Error 404</p>
      <h1>Esta pantalla no existe.</h1>
      <p>Revisá la dirección o volvé al centro de operaciones.</p>
      <Link className="primary-button" href="/">
        Volver a operación
      </Link>
    </main>
  );
}
