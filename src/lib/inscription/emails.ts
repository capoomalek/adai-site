import type { Payload } from 'payload'

import type { Membre } from '@/payload-types'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

const echapper = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Gabarit HTML simple, lisible dans tous les clients de messagerie. */
function gabarit(titre: string, corps: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f4f9;font-family:Arial,sans-serif;color:#2e4057">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-top:4px solid #5995ed">
<tr><td style="padding:28px 32px 8px"><p style="margin:0;font-size:22px;font-weight:bold;letter-spacing:1px">ADAI</p>
<p style="margin:4px 0 0;font-size:13px;color:#6b7a8f">Association des Anciens de l’IPEST</p></td></tr>
<tr><td style="padding:16px 32px 32px"><h1 style="font-size:20px;margin:0 0 16px">${titre}</h1>${corps}</td></tr>
</table></td></tr></table></body></html>`
}

const blocCode = (code: string) =>
  `<p style="margin:24px 0;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#f4f4f9;padding:16px">${code}</p>
<p style="font-size:14px;color:#6b7a8f">Ce code est valable 15 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>`

export async function envoyerCode(
  payload: Payload,
  { to, prenom, code, type }: { to: string; prenom: string; code: string; type: 'email' | 'ipest' },
) {
  const intro =
    type === 'email'
      ? 'Voici votre code pour confirmer votre adresse e-mail et poursuivre votre inscription sur le site de l’ADAI.'
      : 'Voici votre code pour confirmer votre appartenance à l’IPEST.'
  await payload.sendEmail({
    to,
    subject: `${code} est votre code de vérification ADAI`,
    html: gabarit(
      `Bonjour ${echapper(prenom)},`,
      `<p style="line-height:1.6">${intro}</p>${blocCode(code)}`,
    ),
  })
}

/** Prévient les administrateurs actifs qu'une demande (option 2) attend leur validation. */
export async function notifierAdmins(payload: Payload, membre: Pick<Membre, 'id' | 'prenom' | 'nom'>) {
  const admins = await payload.find({
    collection: 'admins',
    where: { actif: { not_equals: false } },
    limit: 50,
    depth: 0,
  })
  const destinataires = admins.docs.map((a) => a.email)
  if (destinataires.length === 0) return
  await payload.sendEmail({
    to: destinataires,
    subject: `Nouvelle demande d’adhésion à vérifier : ${membre.prenom} ${membre.nom}`,
    html: gabarit(
      'Nouvelle demande à vérifier',
      `<p style="line-height:1.6">${echapper(membre.prenom)} ${echapper(membre.nom)} demande à rejoindre le réseau et a transmis un justificatif.</p>
<p><a href="${SITE}/admin/collections/membres/${membre.id}" style="display:inline-block;background:#2e4057;color:#fff;padding:12px 20px;text-decoration:none">Examiner la demande</a></p>`,
    ),
  })
}

/** Informe le membre de la décision d'un administrateur. */
export async function notifierDecision(payload: Payload, membre: Membre, decision: 'verifie' | 'refuse') {
  const motif = membre.verification?.motifRefus?.trim()
  const corps =
    decision === 'verifie'
      ? `<p style="line-height:1.6">Votre appartenance à l’IPEST a été vérifiée. Bienvenue dans le réseau des ipestiens et alumni !</p>
<p><a href="${SITE}/mon-espace" style="display:inline-block;background:#2e4057;color:#fff;padding:12px 20px;text-decoration:none">Accéder à mon espace</a></p>`
      : `<p style="line-height:1.6">Nous n’avons pas pu vérifier votre appartenance à l’IPEST à partir des éléments transmis.</p>
${motif ? `<p style="line-height:1.6;background:#f4f4f9;padding:12px 16px"><strong>Motif :</strong> ${echapper(motif)}</p>` : ''}
<p style="line-height:1.6">Vous pouvez envoyer une nouvelle demande depuis votre espace.</p>
<p><a href="${SITE}/inscription" style="display:inline-block;background:#2e4057;color:#fff;padding:12px 20px;text-decoration:none">Envoyer une nouvelle demande</a></p>`
  try {
    await payload.sendEmail({
      to: membre.email,
      subject: decision === 'verifie' ? 'Votre compte ADAI est validé' : 'Votre demande d’inscription à l’ADAI',
      html: gabarit(`Bonjour ${echapper(membre.prenom)},`, corps),
    })
  } catch (e) {
    payload.logger.error({ err: e, msg: 'Envoi de la décision impossible' })
  }
}