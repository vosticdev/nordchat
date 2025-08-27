# Contributing to NordChat

Thank you for your interest in contributing to NordChat! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to see if your problem has already been reported
2. **Check the documentation** to see if there's already a solution
3. **Provide detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Browser/OS information
   - Error messages or logs

### Feature Requests

We welcome feature requests! Please:

1. **Describe the feature** clearly and concisely
2. **Explain the use case** and why it would be valuable
3. **Consider the impact** on security and performance
4. **Check if it aligns** with our roadmap

### Code Contributions

#### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/vosticdev/nordchat.git
   cd nordchat
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment**
   ```bash
   cp server/env.example server/.env
   # Edit server/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

#### Code Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Comments**: Write clear, meaningful comments
- **Documentation**: Update documentation for new features

#### Commit Guidelines

Use conventional commit messages:

```
type(scope): description

feat(auth): add two-factor authentication
fix(encryption): resolve message decryption issue
docs(readme): update installation instructions
style(ui): improve button styling
refactor(api): simplify user validation logic
test(server): add unit tests for authentication
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run test
   npm run build
   ```

4. **Submit a pull request**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes

### Security Contributions

Security is our top priority. If you find a security vulnerability:

1. **Do not create a public issue**
2. **Email us directly** at security@nordcappe.com
3. **Provide detailed information** about the vulnerability
4. **Allow time** for us to investigate and fix

## 🛠️ Development Guidelines

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line length**: Maximum 80 characters
- **File naming**: Use kebab-case for files

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use generics when appropriate

### React Guidelines

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for all components
- Implement proper error boundaries

### Backend Guidelines

- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all inputs
- Use environment variables for configuration

### Testing

- Write unit tests for new features
- Maintain good test coverage
- Use descriptive test names
- Test both success and error cases

## 📋 Review Process

All contributions go through a review process:

1. **Automated checks** (CI/CD pipeline)
2. **Code review** by maintainers
3. **Security review** for sensitive changes
4. **Documentation review** for new features

## 🏷️ Labels

We use labels to categorize issues and pull requests:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `security`: Security-related issues
- `urgent`: High priority issues

## 📞 Getting Help

If you need help contributing:

- **Documentation**: Check the README and docs
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: Contact us at support@nordcappe.com

## 🎉 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📄 License

By contributing to NordChat, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NordChat! Your help makes our secure messaging platform better for everyone.

**NordCappe d.o.o.** - Secure • Reliable • Professional
