import { redirect } from 'next/navigation';

// Metadata for SEO
export const metadata = {
  title: 'Forum | Skripta - Hrvatska Studentska Zajednica',
  description: 'Pridruži se diskusijama, postavi pitanja i razmijeni znanje s hrvatskim studentima. Najbolja studentska zajednica u Hrvatskoj.',
};

export default async function ForumPage() {
  // Redirect to university selection page
  redirect('/forum/select-university');
}
