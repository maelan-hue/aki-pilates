# Āki Pilates — Site de réservation

Site Next.js + Supabase. Planning sauvegardé en vraie base de données,
visible par tous, admin protégé par mot de passe.

## Déploiement 100% gratuit — étapes

### 1. Créer la base de données (Supabase, gratuit)

1. Va sur https://supabase.com → "Start your project" → crée un compte (avec Google/GitHub c'est plus rapide).
2. Crée un nouveau projet (choisis une région proche, ex. Europe).
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche) → **New query**.
4. Colle le contenu du fichier `supabase.sql` (fourni dans ce dossier) → clique **Run**.
   → Ça crée les tables `classes` et `bookings`, avec la sécurité (qui peut lire/écrire quoi),
   et ajoute 3 cours de démonstration.
5. Va dans **Authentication > Users** → **Add user** → crée le compte de ta sœur
   (son email + un mot de passe). C'est ce compte qui lui permettra de se connecter à l'admin.
6. Va dans **Project Settings > API**. Note les deux valeurs suivantes (tu en auras besoin à l'étape 3) :
   - **Project URL**
   - **anon public key**

### 2. Mettre le code sur GitHub (gratuit)

1. Crée un compte sur https://github.com si tu n'en as pas.
2. Crée un nouveau dépôt (repository), par exemple `aki-pilates`.
3. Mets tout le contenu de ce dossier dedans (par glisser-déposer sur l'interface GitHub,
   ou en ligne de commande si tu es à l'aise avec git).

### 3. Déployer sur Vercel (gratuit)

1. Va sur https://vercel.com → "Sign up" → connecte-toi avec ton compte GitHub.
2. Clique **Add New > Project** → choisis le dépôt `aki-pilates`.
3. Avant de cliquer "Deploy", ouvre la section **Environment Variables** et ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL notée à l'étape 1.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la anon public key notée à l'étape 1.6
4. Clique **Deploy**. Au bout d'une minute, ton site est en ligne avec une adresse du type
   `aki-pilates.vercel.app`.

### 4. Nom de domaine (optionnel)

Vercel donne une adresse gratuite (`....vercel.app`). Si tu veux un vrai nom de domaine
(ex. `akipilates.fr`), il faudra l'acheter (environ 10-15€/an chez un registrar comme OVH,
Gandi, ou Namecheap) puis le relier à Vercel — gratuit côté Vercel, payant juste pour le nom
de domaine lui-même.

## Utilisation au quotidien

- **Site public** : `https://ton-site.vercel.app` — visible par tout le monde, planning en direct.
- **Admin** : `https://ton-site.vercel.app/admin` — ta sœur se connecte avec l'email/mot de passe
  créés à l'étape 1.5, ajoute/supprime des cours, et voit les demandes de réservation reçues.

## Mises à jour futures du code

Toute modification que je t'enverrai ensuite pourra être déposée sur GitHub (en remplaçant les
fichiers) — Vercel redéploiera automatiquement le site à chaque mise à jour du dépôt.

## Limites actuelles (MVP)

- Pas de paiement en ligne intégré (volontaire pour l'instant) : ta sœur recontacte chaque
  personne pour envoyer le lien de paiement de l'acompte.
- Pas de notification automatique (SMS/email) quand une demande arrive — il faut aller voir
  l'admin régulièrement, ou je peux ajouter un envoi d'email automatique plus tard (toujours
  possible gratuitement avec un service comme Resend).
- Les places ne se décrémentent pas automatiquement à chaque demande (le nombre de places est
  ajusté manuellement par ta sœur dans l'admin) — pour éviter qu'une personne réserve "en
  trop" avant qu'Āki ait pu valider à la main.
