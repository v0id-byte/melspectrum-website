// Single source of truth for the source/artifact contract.
// Anything listed in GENERATED is owned by the build and may be swapped.
// Anything listed in PRESERVED is hand-maintained and must NEVER be touched.
export const GENERATED = [
  'index.html',
  'assets',
  'fonts',
  'images',
  'robots.txt',
  'sitemap.xml',
  'build-manifest.json',
];

export const PRESERVED = ['CNAME', '.nojekyll'];

// Guard: no build script may write to or delete from these.
export const FORBIDDEN = [
  'app',
  'source-assets',
  'scripts',
  'node_modules',
  'build-stage',
  '.publish-backup',
  '.git',
];

export const STAGE_DIR = 'build-stage';
export const BACKUP_DIR = '.publish-backup';
