# Contributing to LegalEase

Thank you for your interest in improving **LegalEase**!

## Development Guidelines

1. **Code Standards:** Run `npm run lint` before submitting PRs. All code must pass with 0 errors and 0 warnings.
2. **Testing:** All new features must include unit tests under the `tests/` directory. Run `npm test` to ensure all 68+ tests pass.
3. **Accessibility:** Comply with WCAG 2.1 AA guidelines. Ensure all interactive elements have accessible names and decorative icons have `aria-hidden="true"`.
4. **Security:** Never commit API keys or credentials. All user inputs must be sanitized using DOMPurify.
5. **Ethics:** Ensure legal disclaimers are preserved. Do not add numerical legal risk scores or claim definitive legal outcomes.

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
