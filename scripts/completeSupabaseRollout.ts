import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

function run(command: string): void {
  console.log(`\n> ${command}`);
  execSync(command, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : '/bin/sh',
  });
}

async function loadEnvFile(filePath: string): Promise<void> {
  try {
    const raw = await readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException;
    if (fsError.code !== 'ENOENT') {
      throw error;
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function promoteAdminUser(): Promise<void> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminUserId = process.env.ANESIA_ADMIN_USER_ID;
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;

  if (!serviceRoleKey || !adminUserId || !supabaseUrl) {
    console.log(
      'Skipping admin promotion: set SUPABASE_SERVICE_ROLE_KEY, ANESIA_ADMIN_USER_ID, and SUPABASE_URL/VITE_SUPABASE_URL to enable it.',
    );
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.from('user_roles').upsert(
    {
      user_id: adminUserId,
      role: 'admin',
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(`Failed to promote admin user: ${error.message}`);
  }

  console.log(`Admin role ensured for user ${adminUserId}`);
}

async function main(): Promise<void> {
  await loadEnvFile(path.join(REPO_ROOT, '.env.local'));
  await loadEnvFile(path.join(REPO_ROOT, '.env'));

  const accessToken = requireEnv('SUPABASE_ACCESS_TOKEN');
  const dbPassword = requireEnv('SUPABASE_DB_PASSWORD');
  const projectRef = process.env.SUPABASE_PROJECT_REF ?? requireEnv('VITE_SUPABASE_PROJECT_ID');

  process.env.SUPABASE_ACCESS_TOKEN = accessToken;

  run(`npx supabase login --token "${accessToken}"`);
  run(`npx supabase link --project-ref ${projectRef} -p "${dbPassword}"`);
  run('npx supabase db push');
  run(`npx supabase functions deploy admin-import-procedures --project-ref ${projectRef}`);
  run(`npx supabase functions deploy admin-import-guidelines --project-ref ${projectRef}`);

  await promoteAdminUser();
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
