try {
  const fd = new FormData();
  fd.append('email', formData.email.trim().toLowerCase());
  fd.append('password', formData.password);
  fd.append('recaptchaToken', recaptchaToken as string);

  const result = await login(fd);

  if (result.ok) {
    toast.success('Login successful!');
    setFormData({ email: '', password: '' });
    resetValidation();
    setTimeout(() => router.push('/dashboard'), 1000);
    return;
  }

  // action returned an explicit error
  throw new Error(result.message);
} catch (err) {
  toast.error(err instanceof Error ? err.message : 'Failed to sign in');
  setRecaptchaToken(null);
  setIsCaptchaVerified(false);
  recaptchaRef.current?.reset();
  setFormData(p => ({ ...p, password: '' }));
  resetValidation();
} finally {
  setLoading(false);
}
