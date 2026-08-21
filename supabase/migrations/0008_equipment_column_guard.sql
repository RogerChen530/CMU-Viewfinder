-- ============================================================
-- 補之前記在 README 的已知缺口：
-- equipment 的 update RLS 目前對所有 member 開放整表欄位，
-- 一般社員理論上能透過 API 改器材名稱/型號，不只是租借狀態。
--
-- RLS 沒辦法直接做「欄位層級」限制，改用 trigger：
-- 非 admin 使用者更新 equipment 時，如果動到 name/model/
-- category/asset_code 這些基本資料欄位，直接擋下來。
-- status/current_holder/due_date（租借相關欄位）不受影響。
-- ============================================================

create or replace function public.enforce_equipment_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.name is distinct from old.name
      or new.model is distinct from old.model
      or new.category is distinct from old.category
      or new.asset_code is distinct from old.asset_code
    then
      raise exception '只有管理員能修改器材的基本資料';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_equipment_update
  before update on equipment
  for each row execute procedure public.enforce_equipment_update_permissions();
