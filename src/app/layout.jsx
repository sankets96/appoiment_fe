import './globals.css';

export const metadata = {
  title: 'Medicare+ | Healthcare Appointment Platform',
  description: 'Your trusted platform for seamless healthcare appointments & management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
