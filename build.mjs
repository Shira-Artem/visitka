/* ============================================================
   build.mjs — сборка продакшн-версии в dist/.

   Запуск:  node build.mjs

   Что делает и, главное, чего НЕ делает.

   Делает ровно одно: кладёт рядом те же файлы, но с хэшем содержимого
   в имени (sections/story.7f3a1c9e.css), и переписывает ссылки на них
   в index.html и в import-ах модулей. Ничего не минифицирует, не
   транспилирует и не склеивает — код в dist/ читается так же, как в
   assets/, и отлаживается так же.

   Зачем: имя файла меняется вместе с содержимым, поэтому браузер
   физически не может отдать старую версию. Это то, ради чего раньше
   руками правили ?v=story-pulse-1 в index.html — и один раз уже
   получили закэшенный старый JS.

   Зависимостей нет — только стандартная библиотека Node.

   Что остаётся неизменным:
     - assets/img/** копируется как есть. Пути на картинки лежат
       строками внутри hero-demo.js (каталог блюд), и переписывать их
       значило бы трогать файл, который трогать нельзя;
     - порядок <link> в index.html сохраняется дословно — от него
       зависит каскад (см. assets/css/sections/story.css).

   Деплой: отдавать содержимое dist/, а не корень репозитория.
   Хэшированные файлы можно отдавать с Cache-Control: immutable,
   index.html — с no-cache.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, basename, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');

const hashOf = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

/** assets/js/lib/motion.js → assets/js/lib/motion.7f3a1c9e.js */
const hashedName = (name, hash) => {
  const dot = name.lastIndexOf('.');
  return name.slice(0, dot) + '.' + hash + name.slice(dot);
};

const toPosix = (p) => p.split(sep).join('/');

/* Относительные import-спецификаторы: `import './x.js'`, `from '../lib/y.js'`.
   Динамического import() и bare-спецификаторов в проекте нет. */
const IMPORT_RE = /(\bfrom\s+|\bimport\s+)(['"])(\.[^'"]*)\2/g;

const built = new Map();   // абсолютный путь исходника → относительный путь в dist
const building = new Set();

function emit(srcAbs, content) {
  const rel = relative(ROOT, srcAbs);
  const hash = hashOf(content);
  const outRel = join(dirname(rel), hashedName(basename(rel), hash));
  const outAbs = join(DIST, outRel);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, content);
  return toPosix(outRel);
}

function buildJs(srcAbs) {
  if (built.has(srcAbs)) return built.get(srcAbs);
  if (building.has(srcAbs)) {
    throw new Error('Циклический импорт: ' + relative(ROOT, srcAbs));
  }
  building.add(srcAbs);

  // Директория модуля в dist та же, что в исходниках, поэтому в спецификаторе
  // меняется только имя файла — путь до него остаётся прежним.
  const code = readFileSync(srcAbs, 'utf8').replace(IMPORT_RE, (match, keyword, quote, spec) => {
    const depAbs = resolve(dirname(srcAbs), spec);
    const depOut = buildJs(depAbs);
    return keyword + quote + spec.replace(/[^/]+$/, basename(depOut)) + quote;
  });

  building.delete(srcAbs);
  const out = emit(srcAbs, Buffer.from(code, 'utf8'));
  built.set(srcAbs, out);
  return out;
}

function buildAsset(srcAbs) {
  if (built.has(srcAbs)) return built.get(srcAbs);
  const out = emit(srcAbs, readFileSync(srcAbs));
  built.set(srcAbs, out);
  return out;
}

/* ---- сборка ---- */

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const imgSrc = join(ROOT, 'assets', 'img');
if (existsSync(imgSrc)) cpSync(imgSrc, join(DIST, 'assets', 'img'), { recursive: true });

let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const rewritten = [];

// Локальные ссылки на css/js в index.html. Внешние (шрифты) не трогаем.
html = html.replace(/(href|src)="(assets\/(?:css|js)\/[^"?#]+)(\?[^"]*)?"/g, (match, attr, path) => {
  const srcAbs = join(ROOT, path);
  if (!existsSync(srcAbs)) throw new Error('index.html ссылается на несуществующий файл: ' + path);
  const out = path.endsWith('.js') ? buildJs(srcAbs) : buildAsset(srcAbs);
  rewritten.push(path + '  →  ' + out);
  return attr + '="' + out + '"';
});

writeFileSync(join(DIST, 'index.html'), html);

console.log('dist/ собран:');
rewritten.forEach((line) => console.log('  ' + line));
const extra = [...built.values()].filter((out) => !rewritten.some((line) => line.endsWith(out)));
extra.forEach((out) => console.log('  (импорт) ' + out));
console.log('\nвсего файлов с хэшем: ' + built.size);
console.log('деплоить содержимое dist/');
