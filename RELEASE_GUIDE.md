# Notion Desktop Reborn - Release Guide

## 🚀 Quick Release Steps

1. **Prepare for release:**
   ```bash
   npm run pre-release
   ```

2. **Update CHANGELOG.md** with your changes

3. **Create release:**
   ```bash
   npm run release 2.0.0
   ```

That's it! The automation handles the rest.

## 📋 Pre-requisites

- GitHub repository configured as origin
- GitHub Actions enabled (for automated releases)
- OR GitHub CLI installed (for manual releases)

## 🛠️ Setup Instructions

### 1. Create GitHub Repository

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/notion-snap-reborn.git
git push -u origin main
```

### 2. Enable GitHub Actions

GitHub Actions will automatically run when you push version tags. No additional setup required!

### 3. Alternative: Install GitHub CLI (for manual releases)

```bash
sudo apt install gh
gh auth login
```

## 📦 What Gets Released

Each release automatically creates and uploads:

- **AppImage** - Universal Linux package
- **Snap** - Ubuntu Snap Store ready
- **Deb** - Debian/Ubuntu package  
- **RPM** - Red Hat/Fedora package

## 🔄 Release Process

### Automated (Recommended)

1. **Check everything is ready:**
   ```bash
   npm run pre-release
   ```

2. **Update CHANGELOG.md** with your new features and fixes

3. **Create the release:**
   ```bash
   npm run release 2.1.0
   ```

The script will:
- ✅ Update version in package.json
- ✅ Build all packages
- ✅ Commit and tag the release
- ✅ Push to GitHub
- ✅ Trigger GitHub Actions to create the release

### Manual Alternative

If you prefer manual control:

```bash
# Build packages first
npm run build-all

# Create release manually
npm run manual-release
```

## 📝 Changelog Format

Keep your `CHANGELOG.md` in this format:

```markdown
# Changelog - Notion Desktop Reborn

## [2.1.0] - 2025-06-22

### ✨ Added
- New feature descriptions

### 🔧 Fixed
- Bug fix descriptions

### 🛠️ Technical Improvements
- Technical changes

---

## [2.0.0] - 2025-06-21
Previous version content...
```

## ❓ Troubleshooting

### "No remote origin found"
```bash
git remote add origin https://github.com/yourusername/notion-snap-reborn.git
```

### "Build failed"
```bash
npm install
npm install -g electron-builder
npm run build-all
```

### "GitHub CLI not authenticated"
```bash
gh auth login
```

## 🎯 Next Steps After First Release

1. **Share your release** - The scripts will open GitHub releases page
2. **Update documentation** - Add installation instructions
3. **Submit to Snap Store** - Use the generated .snap file
4. **Announce** - Share on social media, forums, etc.

---

**Need help?** Check the detailed documentation in `scripts/README.md`
