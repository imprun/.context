#!/usr/bin/env node

/**
 * .context 명령어 템플릿 설치 스크립트
 *
 * 역할:
 * - templates/commands/*.md 파일을 ../.claude/commands/ 로 복사
 * - npm install 또는 postinstall 시 자동 실행
 * - 수동 실행: node install.js
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'templates', 'commands');
const TARGET_DIR = path.join(__dirname, '..', '.claude', 'commands');

/**
 * 디렉토리가 존재하는지 확인하고, 없으면 생성
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 디렉토리 생성: ${dir}`);
  }
}

/**
 * 템플릿 파일을 대상 디렉토리로 복사
 */
function copyTemplates() {
  // 템플릿 디렉토리 확인
  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error(`❌ 템플릿 디렉토리를 찾을 수 없습니다: ${TEMPLATE_DIR}`);
    process.exit(1);
  }

  // 대상 디렉토리 생성
  ensureDir(TARGET_DIR);

  // 템플릿 파일 목록
  const files = fs.readdirSync(TEMPLATE_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.warn('⚠️ 복사할 템플릿 파일이 없습니다.');
    return;
  }

  console.log(`\n📋 ${files.length}개의 명령어 템플릿 설치 중...\n`);

  let copiedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  files.forEach(file => {
    const src = path.join(TEMPLATE_DIR, file);
    const dest = path.join(TARGET_DIR, file);

    const srcContent = fs.readFileSync(src, 'utf-8');

    // 대상 파일이 이미 존재하는 경우
    if (fs.existsSync(dest)) {
      const destContent = fs.readFileSync(dest, 'utf-8');

      // 내용이 다른 경우에만 업데이트
      if (srcContent !== destContent) {
        fs.copyFileSync(src, dest);
        console.log(`🔄 업데이트: ${file}`);
        updatedCount++;
      } else {
        console.log(`⏭️  건너뜀: ${file} (동일)`);
        skippedCount++;
      }
    } else {
      // 새 파일 복사
      fs.copyFileSync(src, dest);
      console.log(`✅ 설치: ${file}`);
      copiedCount++;
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 설치 완료`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ 새로 설치: ${copiedCount}개`);
  console.log(`🔄 업데이트: ${updatedCount}개`);
  console.log(`⏭️  건너뜀: ${skippedCount}개`);
  console.log(`\n대상 디렉토리: ${TARGET_DIR}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

/**
 * 사용 가능한 명령어 목록 표시
 */
function showCommands() {
  console.log(`💡 사용 가능한 명령어:\n`);
  console.log(`  /create-epic       - 새 EPIC 문서 생성 (Mermaid 다이어그램 포함)`);
  console.log(`  /start-epic        - EPIC을 Story로 분해`);
  console.log(`  /daily-start       - 일일 작업 시작 (컨텍스트 복구)`);
  console.log(`  /daily-end         - 일일 작업 종료 (진행상황 저장)`);
  console.log(`  /weekly-report     - 주간보고 생성`);
  console.log(`  /sync-progress     - progress.md 동기화`);
  console.log(`  /catchup           - 빠른 상태 확인`);
  console.log(``);
  console.log(`GitHub 동기화 (설치된 경우):`);
  console.log(`  /sync-epic-to-github`);
  console.log(`  /sync-stories-to-github`);
  console.log(`  /sync-progress-to-github`);
  console.log(`  /generate-release-notes`);
  console.log(``);
}

// 메인 실행
try {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 .context 명령어 템플릿 설치`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  copyTemplates();
  showCommands();

  console.log(`✨ Claude Code를 재시작하거나 새 세션을 열면 명령어를 사용할 수 있습니다.\n`);
} catch (error) {
  console.error(`\n❌ 설치 중 오류 발생:\n`);
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
