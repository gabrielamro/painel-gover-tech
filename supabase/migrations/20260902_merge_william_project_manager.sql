begin;

alter table public.sprints
  add column if not exists project_manager text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sprints'
      and column_name = 'manager'
  ) then
    execute 'update public.sprints set project_manager = manager where project_manager is null and manager is not null';
  end if;
end $$;

update public.sprints
set project_manager = 'William D''Angelo'
where lower(trim(project_manager)) ~ '^willi(am|an)([[:space:]]+d.?[aâ]ngelo)?$';

commit;
