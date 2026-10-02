import Link from 'next/link'

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-titre text-7xl text-cornflower">404</p>
      <h1 className="mt-4 font-titre text-3xl">Cette page n’existe pas encore</h1>
      <p className="mt-4 text-charcoal/75">
        Elle est peut-être en cours de construction, ou l’adresse contient une erreur.
      </p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center bg-charcoal px-6 font-sous-titre text-lg tracking-wide text-white hover:bg-charcoal-900">
        Retour à l’accueil
      </Link>
    </div>
  )
}
