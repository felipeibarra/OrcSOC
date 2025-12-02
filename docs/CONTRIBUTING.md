# Contributing to OrcSOC Enterprise

Thank you for your interest in contributing to OrcSOC Enterprise! We welcome contributions from the cybersecurity community to make this platform even better.

## 🚀 Ways to Contribute

### Code Contributions
- **Bug fixes**: Fix issues reported in the issue tracker
- **New features**: Implement new capabilities following our architecture
- **Plugin development**: Create new security tools and integrations
- **Documentation**: Improve docs, guides, and examples

### Non-Code Contributions
- **Bug reports**: Use the issue tracker to report problems
- **Feature requests**: Suggest new capabilities
- **Testing**: Help test new features and report issues
- **Documentation**: Write guides, tutorials, or improve existing docs

## 🛠️ Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.8+ (for plugin development)
- Git

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/felipeibarra/OrcSOC.git
cd OrcSOC

# Create a feature branch
git checkout -b feature/your-feature-name

# Install development dependencies
npm install

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Create** a Pull Request

## 📋 Contribution Guidelines

### Code Style
- **JavaScript/Node.js**: Follow ESLint configuration
- **Python**: Follow PEP 8 with Black formatting
- **Documentation**: Use Markdown with consistent formatting
- **Commits**: Use conventional commit format

### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat(plugins): add advanced subdomain enumeration plugin
fix(api): resolve memory leak in playbook engine
docs(readme): update installation instructions
```

### Plugin Development
When contributing plugins:

1. **Follow the plugin structure** (see `PLUGIN_DEVELOPMENT_GUIDE.md`)
2. **Include comprehensive tests**
3. **Add documentation and examples**
4. **Handle errors gracefully**
5. **Validate input parameters**

### Testing
- **Unit tests**: Test individual functions and modules
- **Integration tests**: Test plugin interactions
- **End-to-end tests**: Test complete workflows
- **Security testing**: Validate security implications

Run tests:
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "plugin"

# Run with coverage
npm run test:coverage
```

## 🔒 Security Considerations

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: security@orcsoc.dev
- Include detailed reproduction steps and impact assessment

### Security Best Practices
- **Input validation**: Always validate and sanitize inputs
- **Container security**: Follow Docker security best practices
- **API keys**: Never commit sensitive credentials
- **Error handling**: Don't expose sensitive information in errors
- **Access control**: Implement proper authorization checks

## 📚 Documentation

### Updating Documentation
- Keep documentation current with code changes
- Use clear, concise language
- Include code examples where helpful
- Test documentation instructions

### Documentation Structure
```
docs/
├── README.md              # Main documentation
├── INSTALL.md            # Installation guide
├── USER_GUIDE.md         # User manual
├── API_REFERENCE.md      # API documentation
├── PLUGIN_GUIDE.md       # Plugin development
├── TROUBLESHOOTING.md    # Common issues
└── CONTRIBUTING.md       # This file
```

## 🐛 Issue Reporting

### Bug Reports
Please include:
- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Docker version, OrcSOC version
- **Logs**: Relevant log output (sanitize sensitive data)

### Feature Requests
Please include:
- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Implementation ideas**: How it could be implemented
- **Alternatives**: Other solutions considered

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure CI passes** all checks
4. **Request review** from maintainers
5. **Address feedback** and make requested changes

### PR Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] Security implications reviewed
- [ ] Breaking changes documented

## 🎉 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Recognized in the project documentation

## 📞 Getting Help

- **Documentation**: Check `./docs/` first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our Discord/Slack community

## 📜 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

---

Thank you for contributing to OrcSOC Enterprise! Your efforts help make cybersecurity more accessible and effective for everyone. 🛡️