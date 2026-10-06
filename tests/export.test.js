// اختبار ملف Excel: يتطلب npm install (exceljs)
const test = require('node:test');
const assert = require('node:assert');
const ExcelJS = require('exceljs');
const E = require('../js/engine.js');
const { buildWorkbook } = require('../js/export-excel.js');

test('ملف Excel: ورقتان، معادلات، قائمة التردد', async () => {
  const res = E.run(7, 482913);
  const buf = await buildWorkbook(res);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  assert.deepStrictEqual(wb.worksheets.map(w => w.name), ['بيانات الجهة', 'المهام']);
  const ws = wb.getWorksheet('المهام');
  assert.deepStrictEqual(ws.getRow(1).values.slice(1),
    ['#', 'المهمة', 'التردد', 'التنفيذ السنوي', 'التكرار', 'مدة التنفيذ بالدقائق', 'الساعات السنوية', 'النسبة من الإجمالي']);
  assert.match(ws.getCell('D2').formula, /CHOOSE\(MATCH\(C2/);
  assert.strictEqual(ws.getCell('G2').formula, 'D2*E2*F2/60');
  assert.strictEqual(ws.getCell('C2').dataValidation.type, 'list');
  const last = res.best.tasks.length + 2; // صف الإجمالي
  assert.strictEqual(ws.getCell(`B${last + 2}`).value, 'العدد الفعلي');
  assert.match(ws.getCell(`G${last + 2}`).formula, /SUMPRODUCT\(.*'بيانات الجهة'!A6:A2000/);
  assert.strictEqual(ws.getCell(`B${last + 3}`).value, 'الاحتياج');
  assert.strictEqual(ws.getCell(`G${last + 3}`).formula, `G${last}/1023`);
  const ds = wb.getWorksheet('بيانات الجهة');
  assert.strictEqual(ds.getCell('A1').value, 'معلومات الجهة');
  assert.strictEqual(ds.getCell('A2').value, 'اسم الجهة');
  assert.strictEqual(ds.getCell('A3').value, 'مسؤول الجهة');
  assert.strictEqual(ds.rowCount, 5 + 7);
  assert.deepStrictEqual(ds.getRow(5).values.slice(1),
    ['الرقم الوظيفي', 'الاسم', 'الجنس', 'المرتبة', 'المسمى الوظيفي', 'المسمى الفعلي', 'الجهة الفعلية']);
});
