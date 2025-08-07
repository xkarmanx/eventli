// src/shared/components/ReCaptchaInstance.tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA, { ReCAPTCHAProps } from 'react-google-recaptcha';

export type ReCaptchaComponentRef = {
  reset: () => void;
  execute: () => void; // For invisible reCAPTCHA
};

// 1. Extend ReCAPTCHAProps for our component's specific props
// We want to pass some ReCAPTCHAProps directly, but also have our own handlers.
// Omit allows us to exclude certain props from ReCAPTCHAProps if we want to redefine them.
// In this case, we're mostly just passing them through, but making 'sitekey' mandatory
// and ensuring our onChange/onExpired types are correct if we choose to override them.
interface Props extends ReCAPTCHAProps {
  // We'll explicitly define the ones we pass through, or add any custom ones.
  // sitekey is already mandatory in ReCAPTCHAProps, but re-affirming it.
  sitekey: string;
  // We redefine onChange to be mandatory for our wrapper component's usage pattern.
  onChange: (token: string | null) => void;
  // onExpired is optional in ReCAPTCHAProps, and we keep it optional but provide a default.
  onExpired?: () => void;
  // Other props like theme, size, hl are inherited directly or can be overridden.
}

// spellchecker: ignore
/**
 * A custom Reusable ReCAPTCHA component for React applications.
 * This component wraps the `react-google-recaptcha` library,
 * making it easy to integrate reCAPTCHA v2 ("I'm not a robot" checkbox).
 *
 * It uses the `ReCAPTCHAProps` interface from the library for robust type checking.
 */
const ReCaptchaComponent = forwardRef<ReCaptchaComponentRef, Props>(
  ({ sitekey, onChange, onExpired, theme = 'light', size = 'normal', hl, ...rest }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (recaptchaRef.current) recaptchaRef.current.reset();
      },
      execute: () => {
        if (recaptchaRef.current) recaptchaRef.current.execute();
      }
    }));

    if (!sitekey) {
      console.error('ReCaptchaInstance: sitekey is required');
      return (
        <div className='text-[red]'>
          ReCAPTCHA Site Key is missing. Please configure it.
        </div>
      );
    }

    return (
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={sitekey}
        onChange={onChange}
        onExpired={onExpired || (() => {
          console.warn('ReCAPTCHA token expired. Resetting component.');
          recaptchaRef.current?.reset();
          onChange(null); // Notify parent that token is now invalid
        })}
        theme={theme}
        size={size}
        hl={hl}
        {...rest}
      />
    );
  }
);

// Only for debugging purposes, doesn't affect the component's functionality.
ReCaptchaComponent.displayName = 'ReCaptchaComponent';

export default ReCaptchaComponent;
