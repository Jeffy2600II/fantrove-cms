// lib/cms/executor.js
// Parse action list (from OpenRouter), validate, and execute operations against GitHub files
const { getContents, putContents } = require('../core/githubClient');
const { enforcePath, normalizeGitPath } = require('../core/scopeGuard');
const { validateIndex, validateCategory, validateSubcategory, hasThaiChars } = require('../core/schemaValidator');

// Simple parser for the ACTION LIST format described in prompt.
// Returns an array of actions with normalized keys.
function parseActionList(text) {
  // naive splitting: find numbered blocks
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const actions = [];
  let current = null;
  for (const raw of lines) {
    if (!raw) continue;
    const startMatch = raw.match(/^\d+\.\s*(.+)/);
    if (startMatch) {
      if (current) actions.push(current);
      current = { title: startMatch[1].trim(), rawLines: [raw] };
      continue;
    }
    if (current) current.rawLines.push(raw);
  }
  if (current) actions.push(current);
  
  // For each action block, extract key: value entries using "- key: value"
  const parsed = actions.map(a => {
    const obj = { title: a.title };
    for (const l of a.rawLines) {
      const m = l.match(/^\-?\s*([^:]+)\s*:\s*(.+)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim();
        obj[key] = val;
      }
    }
    return obj;
  });
  return parsed;
}

function normalizeAction(parsed) {
  // Convert Thai keys to english internal keys; expected keys per spec:
  // ระดับ, id, ชื่อ, อยู่ภายใต้, subcategory, จำนวน, แนวทาง
  const map = {
    'ระดับ': 'level',
    'id': 'id',
    'ชื่อ': 'name',
    'อยู่ภายใต้': 'under',
    'subcategory': 'subcategory',
    'subCategory': 'subcategory',
    'จำนวน': 'count',
    'แนวทาง': 'guideline'
  };
  const out = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (map[k]) out[map[k]] = v;
    else {
      // also handle english keys passed through
      out[k] = v;
    }
  }
  // normalize level values in Thai:
  if (out.level) {
    const lv = out.level.toLowerCase();
    if (lv.includes('category') || lv.includes('หมวด') || lv.includes('ระดับ: category') || lv.includes('category')) out.level = 'category';
    else if (lv.includes('subcategory') || lv.includes('หมวดย่อย')) out.level = 'subcategory';
    else if (lv.includes('data') || lv.includes('ข้อมูล')) out.level = 'data';
  }
  if (out.count) out.count = Number(out.count) || 0;
  return out;
}

async function executeActions(actionText, actor = 'web-user') {
  const parsed = parseActionList(actionText);
  if (!parsed || parsed.length === 0) throw new Error('ไม่พบ ACTION LIST ที่เข้าใจได้');
  const normalized = parsed.map(normalizeAction);
  
  const results = [];
  // We'll operate sequentially for deterministic commits
  for (const action of normalized) {
    if (!action.level) throw new Error(`Action missing level: ${JSON.stringify(action)}`);
    if (action.level === 'category') {
      // create new category index file and update index.json
      if (!action.id || !action.name) throw new Error('เพิ่มหมวดหมู่ต้องระบุ id และ ชื่อ');
      const indexPath = '/assets/db/con-data/index.json';
      const indexContents = await getContents(indexPath);
      if (!indexContents) throw new Error('index.json not found');
      const indexJson = JSON.parse(Buffer.from(indexContents.content, indexContents.encoding).toString('utf8'));
      // validate index before change
      const vIdx = validateIndex(indexJson);
      if (!vIdx.ok) throw new Error('index.json schema invalid before update');
      
      // add category entry
      const entryExists = (indexJson.categories || []).some(c => c.id === action.id);
      if (entryExists) throw new Error(`Category id already exists: ${action.id}`);
      const fileName = `${action.id}.min.json`;
      indexJson.categories.push({
        id: action.id,
        name: `${action.name}`,
        file: fileName
      });
      
      // validate modified index
      const afterIdx = validateIndex(indexJson);
      if (!afterIdx.ok) throw new Error(`index.json invalid after modification: ${JSON.stringify(afterIdx.errors)}`);
      
      // write back index.json
      await putContents(indexPath, JSON.stringify(indexJson, null, 2), `(${actor}) Add category ${action.id} to index`);
      // create category file (empty categories)
      const categoryPath = `/assets/db/con-data/${action.id}.min.json`;
      const categoryObj = {
        id: action.id,
        name: `${action.name}`,
        categories: []
      };
      const vCat = validateCategory(categoryObj);
      if (!vCat.ok) throw new Error(`New category object invalid: ${JSON.stringify(vCat.errors)}`);
      await putContents(categoryPath, JSON.stringify(categoryObj, null, 2), `(${actor}) Create category file ${action.id}.min.json`);
      results.push({ action: 'create_category', id: action.id });
    } else if (action.level === 'subcategory') {
      // add subcategory under existing category
      if (!action.id || !action.name || !action.under) throw new Error('เพิ่มหมวดย่อยต้องระบุ id, ชื่อ และ อยู่ภายใต้ (category id)');
      const catPath = `/assets/db/con-data/${action.under}.min.json`;
      const catContents = await getContents(catPath);
      if (!catContents) throw new Error(`Category file not found: ${action.under}`);
      const catJson = JSON.parse(Buffer.from(catContents.content, catContents.encoding).toString('utf8'));
      const vCatBefore = validateCategory(catJson);
      if (!vCatBefore.ok) throw new Error(`Category file invalid before update: ${JSON.stringify(vCatBefore.errors)}`);
      
      const exists = (catJson.categories || []).some(c => c.id === action.id);
      if (exists) throw new Error(`Subcategory id already exists under ${action.under}: ${action.id}`);
      // subcategory file path
      const subFilePath = `/assets/db/con-data/${action.under}/${action.id}.min.json`;
      // ensure category categories array updated
      const entry = { id: action.id, name: `${action.name}`, file: `${subFilePath}`.replace(/^\/+/, '/') };
      catJson.categories.push(entry);
      const vAfter = validateCategory(catJson);
      if (!vAfter.ok) throw new Error(`Category file invalid after modification: ${JSON.stringify(vAfter.errors)}`);
      // write back category file
      await putContents(catPath, JSON.stringify(catJson, null, 2), `(${actor}) Add subcategory ${action.id} to ${action.under}`);
      // create subcategory file with empty data
      const subObj = { id: action.id, name: `${action.name}`, data: [] };
      const vSub = validateSubcategory(subObj);
      if (!vSub.ok) throw new Error(`Subcategory object invalid: ${JSON.stringify(vSub.errors)}`);
      await putContents(subFilePath, JSON.stringify(subObj, null, 2), `(${actor}) Create subcategory file ${action.id} under ${action.under}`);
      results.push({ action: 'create_subcategory', under: action.under, id: action.id });
    } else if (action.level === 'data') {
      // add data entries to existing subcategory
      if (!action.subcategory && !action.under) {
        throw new Error('เพิ่มข้อมูลต้องระบุ subcategory หรือ อยู่ภายใต้ (category/subcategory)  ');
      }
      // Determine subcategory path: user may provide 'subcategory' key or 'id' + 'อยู่ภายใต้'?
      let subPath = null;
      if (action.subcategory) {
        subPath = action.subcategory;
      } else if (action.id && action.under) {
        // maybe format where action.id is subcategory id
        subPath = `${action.under}/${action.id}.min.json`;
      } else {
        subPath = action.subcategory || '';
      }
      
      // Accept subPath possibly as just id or path; normalize
      // We expect subPath to be either "dogs" or "emoji/dogs.min.json" or "/assets/db/con-data/emoji/dogs.min.json"
      // Try to resolve: if subPath is just id, try to search in category file? For simplicity, expect "อยู่ภายใต้" (category) + subcategory key.
      // We'll support two patterns: (a) subcategory: dogs and under: emoji  -> /assets/db/con-data/emoji/dogs.min.json
      // (b) subcategory: /assets/db/con-data/emoji/dogs.min.json -> use directly
      let targetPath = null;
      if (action.subcategory && action.under) {
        targetPath = `/assets/db/con-data/${action.under}/${action.subcategory}.min.json`;
      } else if (action.subcategory && action.subcategory.includes('/assets/db/con-data/')) {
        targetPath = action.subcategory;
      } else {
        throw new Error('สำหรับการเพิ่มข้อมูล กรุณาระบุ "อยู่ภายใต้" (category) และ "subcategory" ชื่อย่อย');
      }
      // read subcategory file
      const subContents = await getContents(targetPath);
      if (!subContents) throw new Error(`Subcategory file not found: ${targetPath}`);
      const subJson = JSON.parse(Buffer.from(subContents.content, subContents.encoding).toString('utf8'));
      const vBefore = validateSubcategory(subJson);
      if (!vBefore.ok) throw new Error(`Subcategory file invalid before update: ${JSON.stringify(vBefore.errors)}`);
      
      const count = action.count && Number(action.count) > 0 ? Number(action.count) : 1;
      const guideline = action.guideline || 'ตัวอย่าง';
      // Create placeholder items following strict schema (api, text, name) — name must be Thai
      const newItems = [];
      for (let i = 0; i < count; i++) {
        const nameThai = `${guideline} ตัวอย่าง ${i + 1}`;
        const item = {
          api: '',
          text: '',
          name: `${nameThai}`
        };
        newItems.push(item);
      }
      subJson.data = (subJson.data || []).concat(newItems);
      
      const vAfter = validateSubcategory(subJson);
      if (!vAfter.ok) throw new Error(`Subcategory file invalid after modification: ${JSON.stringify(vAfter.errors)}`);
      
      await putContents(targetPath, JSON.stringify(subJson, null, 2), `(${actor}) Add ${count} data items to ${targetPath}`);
      results.push({ action: 'add_data', target: targetPath, added: count });
    } else {
      throw new Error(`Unknown action level: ${action.level}`);
    }
  }
  
  return results;
}

module.exports = { parseActionList, executeActions };