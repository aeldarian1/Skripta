import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nova tema | Studentski Forum',
  description: 'Stvori novu temu na forumu',
};

export default async function NewTopicServerPage() {
  // Redirect to university selection - users must select university/faculty first
  redirect('/forum/select-university');
}
