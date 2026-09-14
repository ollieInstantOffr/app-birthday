// Kjøres én gang når serveren starter. Starter planleggeren for push-varsler.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startPushScheduler } = await import('./lib/push-scheduler');
    startPushScheduler();
  }
}
