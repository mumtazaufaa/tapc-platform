function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Environment variable ${name} belum diisi (lihat .env.example).`);
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseKey() {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  },
};
