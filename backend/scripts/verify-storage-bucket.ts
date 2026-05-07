import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const bucketEnvName = 'SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES';

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key] !== undefined) continue;
    const rawValue = trimmed.slice(separator + 1).trim();
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

function describeSupabaseUrl(rawUrl: string): { host: string; projectRef: string } {
  try {
    const url = new URL(rawUrl);
    const host = url.host;
    return {
      host,
      projectRef: host.endsWith('.supabase.co') ? host.split('.')[0] : 'n/a',
    };
  } catch {
    return { host: 'invalid-url', projectRef: 'n/a' };
  }
}

async function main() {
  loadDotEnv();

  const bucketName = process.env[bucketEnvName]?.trim();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!bucketName) throw new Error(`Missing required env ${bucketEnvName}`);
  if (!supabaseUrl) throw new Error('Missing required env SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('Missing required env SUPABASE_SERVICE_ROLE_KEY');

  const urlInfo = describeSupabaseUrl(supabaseUrl);
  console.log(`env var name: ${bucketEnvName}`);
  console.log(`resolved bucket name: ${bucketName}`);
  console.log(`supabase host: ${urlInfo.host}`);
  console.log(`project ref: ${urlInfo.projectRef}`);
  console.log('key source: SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`listBuckets failed: ${error.message}`);
  }

  const buckets = data.map((bucket) => ({
    id: bucket.id,
    name: bucket.name,
    public: bucket.public,
  }));
  console.log('buckets:', buckets);

  if (!buckets.some((bucket) => bucket.name === bucketName || bucket.id === bucketName)) {
    throw new Error(`Configured bucket ${bucketName} was not returned by Supabase Storage`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
