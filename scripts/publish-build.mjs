#!/usr/bin/env node
// 把「已验证」的 stage 提升为部署根，失败必须回到上一个完整可部署版本。
//
// 三条来之不易的设计约束：
//  1. 先登记意图再执行拷贝。cpSync 拷贝目录时可能中途失败（EACCES/ENOSPC/
//     EMFILE），此时半成品目录已存在于根目录；若在成功后才登记，回滚就会漏掉
//     它，接着 renameSync 撞上非空目录抛 ENOTEMPTY，回滚自己崩溃，留下
//     「旧 HTML + 新 JS + 静态资源全丢」的撕裂树。
//  2. 根目录校验必须在删除备份「之前」内联完成，否则它只是验尸而非门禁。
//  3. 残留的 .publish-backup/ 意味着上一次发布没有干净收尾，里面是上一版的
//     唯一副本 —— 必须中止并交人工处理，绝不能无条件删掉。
import { existsSync, mkdirSync, rmSync, renameSync, cpSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { GENERATED, PRESERVED, STAGE_DIR, BACKUP_DIR } from './paths.mjs';
import { verifyBuild } from './verify-build.mjs';

const FAIL_AFTER = process.env.PUBLISH_FAIL_AFTER ? +process.env.PUBLISH_FAIL_AFTER : null;
// 仅用于测试：在 cpSync *内部* 失败的路径（最危险的那条）
const FAIL_DURING = process.env.PUBLISH_FAIL_DURING || null;

const assertPreserved = (when) => {
  for (const f of PRESERVED) {
    if (!existsSync(f)) { console.error(`publish-build: ${f} 在${when}丢失 —— 中止`); process.exit(1); }
  }
};

if (!existsSync(STAGE_DIR)) { console.error('publish-build: 没有 build-stage/ —— 先跑 vite build'); process.exit(1); }
if (!existsSync(join(STAGE_DIR, 'build-manifest.json'))) {
  console.error('publish-build: build-stage/ 没有 build-manifest.json —— 先跑 verify:stage'); process.exit(1);
}

// ③ 残留备份 = 上一次没收干净，停下来交人工
if (existsSync(BACKUP_DIR)) {
  console.error(`publish-build: 检测到残留的 ${BACKUP_DIR}/ —— 上一次发布未干净收尾。`);
  console.error('  里面是上一版部署产物的唯一副本，请人工核对并恢复后删除该目录，再重新发布。');
  process.exit(1);
}

assertPreserved('发布前');
mkdirSync(BACKUP_DIR, { recursive: true });

const movedToBackup = [];
const claimedInRoot = [];   // ① 意图登记：写入前就记下，无论成功与否

function rollback(err) {
  console.error('\npublish-build: 发布失败 —— 正在回滚');
  console.error('  原因:', err?.message || err);
  try {
    // 清掉本次写进根目录的一切（含半成品目录）
    for (const g of claimedInRoot) rmSync(g, { recursive: true, force: true });
    // 再把备份搬回来；rename 前先确保目标不存在，避免 ENOTEMPTY
    for (const g of movedToBackup) {
      const from = join(BACKUP_DIR, g);
      if (!existsSync(from)) continue;
      rmSync(g, { recursive: true, force: true });
      renameSync(from, g);
    }
    rmSync(BACKUP_DIR, { recursive: true, force: true });
    assertPreserved('回滚后');
    console.error('publish-build: 已回滚到上一个完整部署版本');
  } catch (rollbackErr) {
    // ④ 回滚本身失败：保留备份并给出人工恢复指令，绝不裸崩
    console.error('publish-build: 回滚过程中再次失败 —— 部署树可能不完整');
    console.error('  回滚错误:', rollbackErr?.message || rollbackErr);
    console.error(`  ${BACKUP_DIR}/ 已保留，其中是上一版的完整副本。请人工执行：`);
    for (const g of movedToBackup) console.error(`    rm -rf ${g} && mv ${join(BACKUP_DIR, g)} ${g}`);
    console.error(`    rmdir ${BACKUP_DIR}`);
  }
  process.exit(1);
}

try {
  // 现有产物 -> 备份
  for (const g of GENERATED) {
    if (!existsSync(g)) continue;
    renameSync(g, join(BACKUP_DIR, g));
    movedToBackup.push(g);
  }

  // stage -> 根目录
  let n = 0;
  for (const entry of readdirSync(STAGE_DIR)) {
    if (PRESERVED.includes(entry)) continue;   // stage 里的同名文件绝不覆盖 preserved
    claimedInRoot.push(entry);                 // ① 先登记，再拷贝
    if (FAIL_DURING === entry) throw new Error(`注入失败：拷贝 ${entry} 中途（PUBLISH_FAIL_DURING）`);
    cpSync(join(STAGE_DIR, entry), entry, { recursive: true });
    n++;
    if (FAIL_AFTER !== null && n >= FAIL_AFTER) throw new Error(`注入失败：已拷贝 ${n} 项后（PUBLISH_FAIL_AFTER）`);
  }

  assertPreserved('发布后');

  // ② 在销毁备份之前就地校验根目录 —— 这才是门禁
  const { ok, failures } = verifyBuild('.');
  if (!ok) throw new Error('根目录校验未通过:\n    ' + failures.join('\n    '));
} catch (err) {
  rollback(err);
}

rmSync(BACKUP_DIR, { recursive: true, force: true });
console.log(`publish-build: 已发布 ${claimedInRoot.length} 项到部署根，并通过根目录校验`);
