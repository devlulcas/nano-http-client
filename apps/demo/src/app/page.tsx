import { httpClient } from '@/lib/http-client';

export default async function HomePage() {
  const helloResponse = await httpClient.get({
    pathname: '',
    actions: {
      typeGuard: (data): data is { message: string } => {
        return data !== null && typeof data === 'object' && 'message' in data;
      },
    },
  });

  if (!helloResponse.ok) {
    return <div>Something went wrong</div>;
  }
  return (
    <main className='w-full'>
      <h1>{helloResponse.data.message}</h1>
    </main>
  );
}
