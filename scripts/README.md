# Release Management

This directory contains scripts for automating the release process of Notion Desktop Reborn.

## Scripts

### 📋 `pre-release.sh`
Preparation script that checks your environment and validates everything is ready for a release.

```bash
npm run pre-release
# or
./scripts/pre-release.sh
```

**What it does:**
- Checks Node.js and dependencies
- Validates git status
- Tests build process
- Checks required files
- Provides next steps guidance

### 🚀 `release.sh`
Automated release script that handles the complete release process.

```bash
npm run release [version]
# or
./scripts/release.sh [version]
```

**What it does:**
- Updates package.json version
- Updates README.md version references
- Builds all packages (AppImage, Snap, Deb, RPM)
- Commits version bump
- Creates and pushes git tag
- Triggers GitHub Actions workflow

**Example:**
```bash
npm run release 2.0.1
```

### 🛠️ `manual-release.sh`
Manual release script using GitHub CLI for when GitHub Actions is not available.

```bash
npm run manual-release
# or
./scripts/manual-release.sh
```

**Requirements:**
- GitHub CLI (`gh`) installed and authenticated
- Packages already built (`npm run build-all`)

**What it does:**
- Extracts changelog for current version
- Creates GitHub release
- Uploads all built packages
- Opens release page

## GitHub Actions

The `.github/workflows/release.yml` workflow automatically:

1. **Triggers on:**
   - Push of version tags (`v*.*.*`)
   - Manual workflow dispatch

2. **Process:**
   - Sets up Node.js environment
   - Installs dependencies
   - Builds all Linux packages
   - Extracts changelog for the version
   - Creates GitHub release
   - Uploads all package formats

## Quick Start

### First Time Setup

1. **Create GitHub repository:**
   ```bash
   # Create repo on GitHub, then:
   git remote add origin https://github.com/yourusername/notion-snap-reborn.git
   git push -u origin main
   ```

2. **Prepare for release:**
   ```bash
   npm run pre-release
   ```

3. **Update CHANGELOG.md** with your changes

4. **Create release:**
   ```bash
   npm run release 2.0.0
   ```

### Subsequent Releases

1. **Prepare:**
   ```bash
   npm run pre-release
   ```

2. **Update CHANGELOG.md**

3. **Release:**
   ```bash
   npm run release 2.0.1
   ```

## Package Formats

The release process builds and distributes:

- **AppImage** - Universal Linux package
- **Snap** - Ubuntu Snap Store package
- **Deb** - Debian/Ubuntu package
- **RPM** - Red Hat/Fedora package

## Troubleshooting

### GitHub CLI Issues
```bash
# Install GitHub CLI
sudo apt install gh

# Authenticate
gh auth login
```

### Build Issues
```bash
# Install electron-builder globally
npm install -g electron-builder

# Test build
npm run build-all
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh
```
