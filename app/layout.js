import './globals.css';

export const metadata = {
  title: 'Āki Pilates — Réservation',
  description: 'Réservez votre cours de pilates avec Āki Pilates à Villelongue-de-la-Salanque.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;1,400&family=Jost:wght@300;400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
