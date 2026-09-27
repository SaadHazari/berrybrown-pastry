/**
 * Public Supabase settings. Both values are safe in the browser: the publishable key can only do
 * what Row Level Security allows (read published cakes and reviews). The secret key lives in the Worker.
 * To move regions: create the new project, run supabase/migrations/*.sql there, and change these two lines.
 */
export const SUPABASE_URL = 'https://ylrqmwfnelwqbychdpfb.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Ik6wTbjZD62XnjyLTFbxsg_zaMAGHxW';

/** Public URL of a photo in the "cakes" bucket. */
export const cakePhotoUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/cakes/${path.replace(/^\/+/, '')}`;
