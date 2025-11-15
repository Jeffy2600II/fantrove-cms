// Basic validation helpers for a few template types.
// This is minimal and intended to be extended.

export function isJsonParsable(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

export function validateEmojiDb(obj: any) {
  // Expecting structure similar to provided db.min.json: { type: [ { id, name, category: [ { id, name, data: [ { api, text, name } ] } ] } ] }
  if (!obj) return { ok:false, msg:'empty object' };
  if (!obj.type || !Array.isArray(obj.type)) return { ok:false, msg:'missing type array' };
  return { ok:true };
}

export function validateGenericArray(obj:any) {
  if (!Array.isArray(obj)) return { ok:false, msg:'expected array' };
  return { ok:true };
}