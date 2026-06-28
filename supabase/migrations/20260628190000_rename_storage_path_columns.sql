alter table public.assets
  rename column image_dropbox_path to image_storage_path;

alter table public.tools
  rename column image_dropbox_path to image_storage_path;

alter table public.equipments
  rename column image_dropbox_path to image_storage_path;
