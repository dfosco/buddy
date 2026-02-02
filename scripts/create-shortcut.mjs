#!/usr/bin/env node

/**
 * Creates a macOS app shortcut on the Desktop that launches
 * the Electron app (npm run app) in the background.
 */
import { execSync } from 'child_process'
import { chmodSync, mkdirSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const APP_NAME = 'Buddy'
const DESKTOP_PATH = join(homedir(), 'Desktop')
const APP_PATH = join(DESKTOP_PATH, `${APP_NAME}.app`)
const CONTENTS_PATH = join(APP_PATH, 'Contents')
const MACOS_PATH = join(CONTENTS_PATH, 'MacOS')
const RESOURCES_PATH = join(CONTENTS_PATH, 'Resources')

const __dirname = dirname(fileURLToPath(import.meta.url))
// Scripts are in <root>/scripts/, so go up one level
let PROJECT_ROOT = dirname(__dirname)

// If we're in a worktree (.worktrees/), resolve to the main repo
if (PROJECT_ROOT.includes('.worktrees')) {
  PROJECT_ROOT = PROJECT_ROOT.replace(/\/\.worktrees\/[^/]+$/, '')
}

// Shell script that runs npm run app
const LAUNCHER_SCRIPT = `#!/bin/bash
source ~/.zshrc 2>/dev/null || source ~/.bashrc 2>/dev/null || true
cd "${PROJECT_ROOT}"
exec npm run app
`

// Info.plist for the app bundle
const INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIdentifier</key>
    <string>com.buddy.shortcut</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon.icns</string>
    <key>LSUIElement</key>
    <true/>
</dict>
</plist>
`

// Convert PNG to ICNS using sips (macOS built-in)
function createIconSet(pngPath) {
  const iconsetPath = join(CONTENTS_PATH, 'AppIcon.iconset')
  const icnsPath = join(RESOURCES_PATH, 'AppIcon.icns')

  // Create iconset directory
  mkdirSync(iconsetPath, { recursive: true })

  // Generate all required icon sizes (macOS requires specific sizes)
  const sizes = [16, 32, 128, 256, 512]
  for (const size of sizes) {
    execSync(
      `sips -z ${size} ${size} "${pngPath}" --out "${iconsetPath}/icon_${size}x${size}.png"`,
      { stdio: 'ignore' }
    )
    // @2x versions (including 512x512@2x = 1024px)
    const size2x = size * 2
    execSync(
      `sips -z ${size2x} ${size2x} "${pngPath}" --out "${iconsetPath}/icon_${size}x${size}@2x.png"`,
      { stdio: 'ignore' }
    )
  }

  // Convert iconset to icns
  execSync(`iconutil -c icns "${iconsetPath}" -o "${icnsPath}"`, {
    stdio: 'ignore',
  })

  // Clean up iconset directory
  execSync(`rm -rf "${iconsetPath}"`, { stdio: 'ignore' })
}

try {
  // Remove existing app if present
  execSync(`rm -rf "${APP_PATH}"`, { stdio: 'ignore' })

  // Create app bundle structure
  mkdirSync(MACOS_PATH, { recursive: true })
  mkdirSync(RESOURCES_PATH, { recursive: true })

  // Write launcher script
  const launcherPath = join(MACOS_PATH, 'launcher')
  writeFileSync(launcherPath, LAUNCHER_SCRIPT)
  chmodSync(launcherPath, 0o755)

  // Write Info.plist
  writeFileSync(join(CONTENTS_PATH, 'Info.plist'), INFO_PLIST)

  // Create app icon from PNG
  const iconPngPath = join(PROJECT_ROOT, 'buddy-icon.png')
  try {
    createIconSet(iconPngPath)
    console.log(`✅ Created "${APP_NAME}.app" on Desktop with custom icon`)
  } catch {
    console.log(
      `✅ Created "${APP_NAME}.app" on Desktop (no icon - buddy-icon.png not found)`
    )
  }
  console.log(`   Double-click to launch Buddy`)
} catch (error) {
  console.error('❌ Failed to create shortcut:', error.message)
  process.exit(1)
}
