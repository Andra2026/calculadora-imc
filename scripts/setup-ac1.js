#!/usr/bin/env node
/**
 * FitTrack — Setup AC1 (automático)
 * Executa: npm run setup
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: root, stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
  } catch (e) {
    if (!opts.ignoreError) throw e;
    return null;
  }
}

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

console.log('\n=== FitTrack — Setup AC1 (automático) ===\n');

// 1. .env.local
if (!exists('.env.local')) {
  fs.copyFileSync(path.join(root, '.env.local.example'), path.join(root, '.env.local'));
  console.log('[OK] .env.local criado');
} else {
  console.log('[OK] .env.local já existe');
}

// 2. Git init (tenta PATH e caminhos comuns no Windows)
if (!exists('.git')) {
  const gitPaths = ['git', 'C:\\Program Files\\Git\\cmd\\git.exe', 'C:\\Program Files (x86)\\Git\\cmd\\git.exe'];
  let gitOk = false;
  for (const gp of gitPaths) {
    try {
      execSync(`${gp} init`, { cwd: root, stdio: 'pipe' });
      execSync(`${gp} branch -M main`, { cwd: root, stdio: 'pipe' });
      gitOk = true;
      break;
    } catch (_) {}
  }
  if (gitOk) console.log('[OK] Git inicializado');
  else console.log('[!] Git não encontrado. Instale: https://git-scm.com');
} else {
  console.log('[OK] Git já configurado');
}

// 3. npm install
console.log('\nInstalando dependências...');
run('npm install', { stdio: 'inherit' });
console.log('[OK] Dependências instaladas');

// 4. Supabase link + db push (se configurado)
const projectRef = process.env.SUPABASE_PROJECT_REF;
if (projectRef) {
  console.log('\nConectando ao Supabase...');
  const linkOk = run(`supabase link --project-ref ${projectRef}`, { silent: true, ignoreError: true });
  if (linkOk !== null) {
    run('supabase db push', { stdio: 'inherit', ignoreError: true });
    console.log('[OK] Migrações aplicadas');
  } else {
    console.log('[!] Supabase CLI não encontrado. Instale: npm i -g supabase');
  }
} else {
  console.log('\n[Supabase] Para aplicar migrações automaticamente:');
  console.log('  set SUPABASE_PROJECT_REF=seu_project_id');
  console.log('  npm run setup');
  console.log('Ou manualmente: supabase login → supabase link → supabase db push');
}

console.log('\n=== Próximos passos ===');
console.log('1. Edite .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('2. npm run dev');
console.log('3. Acesse http://localhost:3000\n');
