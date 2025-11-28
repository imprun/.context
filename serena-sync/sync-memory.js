#!/usr/bin/env node

/**
 * Serena Memory 보관 스크립트
 *
 * 역할:
 * - ../.serena/memories/*.md 파일을 .context/archive/{프로젝트}/로 선택적 복사
 * - 대화형 모드: 사용자가 파일 선택
 * - 자동 모드: 최근 7일 파일 자동 복사
 *
 * 사용법:
 * - 대화형: node serena-sync/sync-memory.js
 * - 자동: node serena-sync/sync-memory.js --auto
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 설정
const SERENA_MEMORY_DIR = path.join(__dirname, '..', '..', '.serena', 'memories');
const ARCHIVE_BASE_DIR = path.join(__dirname, '..', 'archive');
const AUTO_DAYS_THRESHOLD = 7; // 자동 모드: 최근 7일

/**
 * 현재 프로젝트 이름 추측
 */
function guessProjectName() {
  try {
    // 상위 디렉토리 이름 사용
    const parentDir = path.basename(path.resolve(__dirname, '..', '..'));
    return parentDir;
  } catch (error) {
    return 'unknown-project';
  }
}

/**
 * 디렉토리가 존재하는지 확인하고, 없으면 생성
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * 파일 수정 날짜를 YYYY-MM-DD 형식으로 변환
 */
function formatDate(mtime) {
  const date = new Date(mtime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Serena memory 파일 목록 가져오기
 */
function getSerenaMemoryFiles() {
  if (!fs.existsSync(SERENA_MEMORY_DIR)) {
    console.error(`❌ Serena memory 디렉토리를 찾을 수 없습니다: ${SERENA_MEMORY_DIR}`);
    console.error(`\n💡 Serena MCP가 설치되어 있고, 메모리가 생성되었는지 확인하세요.`);
    process.exit(1);
  }

  const files = fs.readdirSync(SERENA_MEMORY_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(SERENA_MEMORY_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        formattedDate: formatDate(stats.mtime),
        formattedSize: formatFileSize(stats.size)
      };
    })
    .sort((a, b) => b.mtime - a.mtime); // 최신 파일 먼저

  return files;
}

/**
 * 파일 목록 표시
 */
function displayFiles(files) {
  console.log(`\n📋 ${files.length}개 파일 발견:\n`);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name} (${file.formattedDate}, ${file.formattedSize})`);
  });
  console.log();
}

/**
 * 사용자 입력 받기
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

/**
 * 파일 복사
 */
function copyFile(srcPath, destPath) {
  fs.copyFileSync(srcPath, destPath);
}

/**
 * 대화형 모드: 사용자가 파일 선택
 */
async function interactiveMode(files, projectName) {
  displayFiles(files);

  const answer = await askQuestion('보관할 파일 번호를 입력하세요 (예: 1,3,5 또는 all): ');

  let selectedFiles = [];

  if (answer.trim().toLowerCase() === 'all') {
    selectedFiles = files;
  } else {
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
    selectedFiles = indices
      .filter(i => i >= 0 && i < files.length)
      .map(i => files[i]);
  }

  if (selectedFiles.length === 0) {
    console.log('⚠️ 선택된 파일이 없습니다.');
    return;
  }

  archiveFiles(selectedFiles, projectName);
}

/**
 * 자동 모드: 최근 7일 파일 자동 복사
 */
function autoMode(files, projectName) {
  const now = Date.now();
  const threshold = AUTO_DAYS_THRESHOLD * 24 * 60 * 60 * 1000;

  const recentFiles = files.filter(f => (now - f.mtime.getTime()) < threshold);

  if (recentFiles.length === 0) {
    console.log(`⚠️ 최근 ${AUTO_DAYS_THRESHOLD}일 이내의 파일이 없습니다.`);
    return;
  }

  console.log(`\n📋 최근 ${AUTO_DAYS_THRESHOLD}일 이내 파일 ${recentFiles.length}개를 보관합니다:\n`);
  recentFiles.forEach(f => {
    console.log(`  - ${f.name} (${f.formattedDate})`);
  });
  console.log();

  archiveFiles(recentFiles, projectName);
}

/**
 * 파일 보관
 */
function archiveFiles(files, projectName) {
  const archiveDir = path.join(ARCHIVE_BASE_DIR, projectName);
  ensureDir(archiveDir);

  console.log(`📦 ${files.length}개 파일 보관 중...\n`);

  let copiedCount = 0;
  let skippedCount = 0;

  files.forEach(file => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const baseName = path.basename(file.name, '.md');
    const destName = `serena-${today}-${baseName}.md`;
    const destPath = path.join(archiveDir, destName);

    // 파일이 이미 존재하는 경우
    if (fs.existsSync(destPath)) {
      const srcContent = fs.readFileSync(file.path, 'utf-8');
      const destContent = fs.readFileSync(destPath, 'utf-8');

      if (srcContent === destContent) {
        console.log(`⏭️  건너뜀: ${destName} (동일)`);
        skippedCount++;
      } else {
        copyFile(file.path, destPath);
        console.log(`🔄 업데이트: ${destName}`);
        copiedCount++;
      }
    } else {
      // 새 파일 복사
      copyFile(file.path, destPath);
      console.log(`✅ 보관: ${destName}`);
      copiedCount++;
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 보관 완료`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ 새로 보관: ${copiedCount}개`);
  console.log(`⏭️  건너뜀: ${skippedCount}개`);
  console.log(`\n대상 디렉토리: ${archiveDir}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  console.log(`💡 다음 단계:`);
  console.log(`   1. 보관된 파일 확인: ls ${archiveDir}`);
  console.log(`   2. Git 커밋:`);
  console.log(`      cd ${path.join(__dirname, '..')}`);
  console.log(`      git add archive/${projectName}/`);
  console.log(`      git commit -m "docs: Serena 메모리 보관 (${new Date().toISOString().split('T')[0]})"`);
  console.log(`      git push\n`);
}

// 메인 실행
async function main() {
  try {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 Serena Memory 보관 도구`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const projectName = guessProjectName();
    console.log(`📁 프로젝트: ${projectName}`);

    const files = getSerenaMemoryFiles();

    if (files.length === 0) {
      console.log(`⚠️ Serena memory 파일이 없습니다.`);
      console.log(`\n💡 Claude Code에서 Serena MCP를 사용하여 프로젝트를 분석하세요.`);
      return;
    }

    const args = process.argv.slice(2);
    const isAutoMode = args.includes('--auto');

    if (isAutoMode) {
      autoMode(files, projectName);
    } else {
      await interactiveMode(files, projectName);
    }
  } catch (error) {
    console.error(`\n❌ 에러 발생:\n`);
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
