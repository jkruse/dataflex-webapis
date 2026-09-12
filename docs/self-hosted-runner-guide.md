# Self-Hosted Runner Guide (Windows)

This guide explains how to set up a Windows self-hosted runner for this repository, so that the `build-and-release.yml` workflow can build, package, and publish the DataFlex WebAPIs package from your own machine.

## Why a self-hosted runner?

The `release` job needs `df-cli` — the DataFlex package manager — to validate, pack, and push the package to the DataFlex package repository at `packages.dataflex.dev`. `df-cli` ships with a licensed DataFlex installation, which is not available on GitHub's hosted runners. The job therefore runs on a self-hosted Windows runner (labels: `self-hosted`, `windows`).

The `build` job (JavaScript lint + bundle across a Node.js matrix) runs on GitHub's hosted `ubuntu-latest` runners and needs no special setup.

## One-time package manager setup (not runner-specific)

Before the first release, sign in to the admin panel at [packages.dataflex.dev](https://packages.dataflex.dev) and:

1. Create the **Kruse-Net** repository (this is the publisher prefix for `Kruse-Net/WebAPIs`).
2. Generate an access token (optionally with a refresh token) and store them as GitHub secrets:
   - `DF_ACCESS_TOKEN` (required)
   - `DF_REFRESH_TOKEN` (optional — lets `df-cli` renew the session when the access token expires)

## Security notes (read this first)

GitHub's documentation warns that **self-hosted runners should almost never be used for public repositories**, because anyone can open a pull request against the repo and potentially execute code on your runner. This workflow is designed to limit that risk:

- The `release` job (the only job that runs on the self-hosted runner) triggers **only on pushes of version tags (`v*`)** — never on `pull_request` events, so untrusted PR content can never run jobs on this machine.
- The `build` job runs on GitHub's hosted runners, so pull requests never touch the self-hosted runner either.
- Only official GitHub actions (`actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v4`) are used.
- The workflow commits a version bump to `main` (top-level `permissions: contents: write` is required for that and for creating the GitHub Release).

Additional recommendations:

- Keep the machine's exposure minimal: it only needs outbound HTTPS (port 443) to GitHub and to `packages.dataflex.dev`.
- Anyone with write access to this repository can push a tag and therefore run code on the runner. Only grant repo write access to people you trust with that.
- Do not store unrelated secrets/credentials on the machine beyond what is needed for releases.

## Prerequisites

| Requirement | Notes |
|---|---|
| Windows 10/11 or Windows Server 2016+ | x64 |
| DataFlex 26 installed **machine-wide** | The release job invokes `df-cli`, which is part of the DataFlex installation (`C:\Program Files\DataFlex 26.0\Bin\df-cli.exe`). It must be on the **system `PATH`** (the runner service runs as a system account, not your user profile). Verify with `df-cli system` in an elevated shell. |
| Valid DataFlex license | `df-cli build` requires a licensed toolchain. |
| Git for Windows | Any recent version |
| `gh` CLI | Used to create the GitHub Release. Verify with `gh --version` in an elevated shell; install it (e.g. `winget install --id GitHub.cli`) and restart the runner service if missing. |
| Outbound HTTPS (port 443) | To `github.com`, `api.github.com`, and `packages.dataflex.dev`. No inbound ports needed. |
| GitHub secrets | `DF_ACCESS_TOKEN` (+ optional `DF_REFRESH_TOKEN`), see "One-time package manager setup" above. |
| Account that is owner/admin of this repository | Needed to create the runner and manage secrets |

Node.js does **not** need to be installed system-wide: the job installs Node.js 24 via `actions/setup-node` on every run.

## Step 1: Create the runner in GitHub

1. Open the repository on GitHub: **Settings** → left sidebar **Actions** → **Runners**.
2. Click **New self-hosted runner**.
3. Select OS **windows** and architecture **x64**.
4. Copy the generated commands (three steps). Note that the token in step 2 **expires after one hour**, so complete setup within that window.

## Step 2: Download and extract the runner application

On the Windows machine, open a shell **with administrator privileges** (required for installing as a service) and follow the copied instructions, e.g.:

```powershell
# 1. Download the latest runner release (URL from step 4 above)
Invoke-WebRequest `
  -Uri "https://github.com/actions/runner/releases/download/v<VERSION>/actions-runner-windows-x64-<VERSION>.zip" `
  -OutFile actions-runner.zip

# 2. Extract to C:\actions-runner (recommended path so system accounts can access it)
Expand-Archive .\actions-runner.zip -destPath C:\actions-runner
Set-Location C:\actions-runner
```

## Step 3: Configure the runner (and install as a service)

Run the configuration command from step 4 above, e.g.:

```powershell
.\config.cmd --url https://github.com/Kruse-Net/WebAPIs --token <TOKEN>
```

When prompted **"Do you want to run the runner as a service?" answer `Y`**.

> **Important:** On Windows, installing as a service is only offered during this initial configuration. If you skip it, you must remove the runner from GitHub and re-run `config.cmd` to get the option again (unlike Linux/macOS, where you can add the service later).

The service name will be of the form `actions.runner.<org>.<repo>` (displayed in the output).

## Step 4: Verify the runner is connected

```powershell
Get-Service "actions.runner.*"
```

Expected status: **Running**. In GitHub, under **Settings → Actions → Runners**, the runner should appear with a green dot. The console output shows `Connected to GitHub` / `Listening for Jobs`.

## Step 5: Test the workflow

The `release` job has no manual trigger — it runs when you push a version tag. To test it end-to-end:

1. Tag and push a throwaway version, e.g.:

   ```powershell
   git tag v9.9.9
   git push origin v9.9.9
   ```

2. Watch the workflow run. Success means: `npm` build → `df-cli system` → `df-cli login` → version set from tag → `df-cli config`/`df-cli build` on both workspaces → `df-cli package push` → `WebAPIs-9.9.9.zip` and `dist/WebAPIsDemo.zip` uploaded as artifacts → version-bump commit → GitHub Release `v9.9.9`.
3. The pushed version is **not published** (publishing is a manual step in the `packages.dataflex.dev` admin panel), so `v9.9.9` is invisible to consumers. You can leave it in the repository (a pushed-but-unpublished version simply sits there) or delete the GitHub Release with `gh release delete v9.9.9 --force`.
4. Clean up the tag if you like: `git tag -d v9.9.9 && git push origin :refs/tags/v9.9.9`.

For a real release, push `v<version>` with the `package.version` in `WebAPIs.sws` matching the tag (the workflow sets `package.version` from the tag and commits the bump if it changed).

## Day-2 operations

### Service management (PowerShell)

```powershell
Get-Service  "actions.runner.*"   # status
Start-Service "actions.runner.*"  # start
Stop-Service  "actions.runner.*"  # stop
```

You can also manage it via the Windows **Services** app (`services.msc`).

### Updating the runner application

1. Download a newer `actions-runner-windows-x64-*.zip` from https://github.com/actions/runner/releases.
2. Stop the service: `Stop-Service "actions.runner.*"`.
3. Replace the contents of `C:\actions-runner` with the new files (keep `.credentials`).
4. Start the service again.

### Updating DataFlex / df-cli

`df-cli` is not updated independently — it is part of the DataFlex installation. Update DataFlex 26 the usual way (machine-wide, elevated), then restart the runner service so the service account picks up the new `PATH`/installation.

### Removing the runner

1. In GitHub: **Settings → Actions → Runners** → select the runner → **Delete**.
2. On the machine, stop and remove the service:

   ```powershell
   Stop-Service "actions.runner.*"
   Remove-Service "actions.runner.*"
   ```

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `df-cli` not found in the job | The DataFlex installation (or `df-cli.exe`) is only on your user `PATH`. Install DataFlex machine-wide and confirm `df-cli system` works in an elevated shell; then restart the runner service. |
| `df-cli build` fails with a licensing error | The DataFlex license is not activated (or expired) on the machine. Activate it machine-wide. |
| `df-cli login` fails | The token is expired, invalid, or the secrets are misspelled (`DF_ACCESS_TOKEN` / `DF_REFRESH_TOKEN`). Regenerate the token in the `packages.dataflex.dev` admin panel and update the GitHub secrets. |
| `df-cli package push` reports a conflict | The version was already pushed (each push must have a unique version). Bump `package.version` in `WebAPIs.sws` and push a new tag. |
| Runner shows offline in GitHub UI | Check outbound HTTPS to `github.com`/`api.github.com`; check Windows Firewall isn't blocking the runner process; verify the service is running (`Get-Service "actions.runner.*"`). |
| Configuration failed with token error | The setup token expired (1 hour limit) — regenerate the commands in GitHub and re-run `config.cmd`. |
| Service won't start after moving files | Ensure you kept the `.credentials` file when replacing runner files, and that `C:\actions-runner` remains the install path. |
