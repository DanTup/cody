import * as semver from 'semver'
import * as vscode from 'vscode'

import { localStorage } from '../services/LocalStorageProvider'

const releaseNotesUriPrefix = 'https://github.com/sourcegraph/cody/releases/tag/vscode-v'
export const lastSeenVersionStorageKey = 'extension.lastSeenVersion'

// Show a notification if currentVersion is newer than the last seen version of the extension and
// records currentVersion as the last seen version.
//
// If we don't have a previous recorded seen version, this is likely the first version installed and
// we don't show a notification because the user isn't updating from anything.
export async function maybeShowExtensionUpdateNotification(currentVersion: string): Promise<void> {
    const lastSeenVersion = localStorage.get(lastSeenVersionStorageKey) as string | undefined
    void localStorage.set(lastSeenVersionStorageKey, currentVersion)

    if (!shouldShowNotification(currentVersion, lastSeenVersion)) {
        return
    }

    const openReleaseNotes = 'Show Release Notes'
    const response = await vscode.window.showInformationMessage(
        `Cody AI has been updated to ${currentVersion}!`,
        openReleaseNotes
    )
    if (response === openReleaseNotes) {
        void vscode.env.openExternal(vscode.Uri.parse(`${releaseNotesUriPrefix}${currentVersion}`))
    }
}

function shouldShowNotification(currentVersion: string, lastSeenVersion: string | undefined): boolean {
    if (!lastSeenVersion) {
        // Don't show a prompt on the first install.
        return false
    }

    return semver.gt(currentVersion, lastSeenVersion)
}
