import { afterEach, beforeEach, describe, expect, SpyInstance, test, vi } from 'vitest'
import * as vscode from 'vscode'

import { localStorage } from '../services/LocalStorageProvider'

import { lastSeenVersionStorageKey, maybeShowExtensionUpdateNotification } from './extension-update-notifications'

describe('extension update notifications', () => {
    // Set up local storage backed by a variable.
    let lastSeenVersion: string | undefined
    localStorage.setStorage({
        get(key: string) {
            return key === lastSeenVersionStorageKey ? lastSeenVersion : undefined
        },
        update(key: string, value: any) {
            if (key === lastSeenVersionStorageKey) {
                lastSeenVersion = value as string | undefined
            }
        },
    } as any as vscode.Memento)

    let notificationSpy: SpyInstance<[message: string, ...items: string[]], Thenable<string | undefined>>
    let openExternalSpy: SpyInstance<[target: vscode.Uri], Thenable<boolean>>

    beforeEach(() => {
        notificationSpy = vi.spyOn(vscode.window, 'showInformationMessage') as any
        openExternalSpy = vi.spyOn(vscode.env, 'openExternal')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('stores last seen version', async () => {
        lastSeenVersion = undefined

        await maybeShowExtensionUpdateNotification('1.2.3')
        expect(lastSeenVersion).toEqual('1.2.3')
    })

    test('are not shown on first run', async () => {
        lastSeenVersion = undefined

        await maybeShowExtensionUpdateNotification('1.2.3')
        expect(notificationSpy).not.toHaveBeenCalled()
    })

    test('are not shown for same version', async () => {
        lastSeenVersion = '1.2.3'

        await maybeShowExtensionUpdateNotification('1.2.3')
        expect(notificationSpy).not.toHaveBeenCalled()
    })

    test('are not shown for older versions', async () => {
        lastSeenVersion = '2.3.4'

        await maybeShowExtensionUpdateNotification('1.2.3')
        expect(notificationSpy).not.toHaveBeenCalled()
    })

    test('are shown for major updates', async () => {
        lastSeenVersion = '1.2.3'

        await maybeShowExtensionUpdateNotification('2.0.0')
        expect(notificationSpy).toHaveBeenCalled()
    })

    test('are shown for minor updates', async () => {
        lastSeenVersion = '1.2.3'

        await maybeShowExtensionUpdateNotification('1.3.4')
        expect(notificationSpy).toHaveBeenCalled()
    })

    test('are shown for patch updates', async () => {
        lastSeenVersion = '1.2.3'

        await maybeShowExtensionUpdateNotification('1.2.4')
        expect(notificationSpy).toHaveBeenCalled()
    })

    test('do not open release notes if dismissed', async () => {
        notificationSpy.mockImplementation(() => Promise.resolve(undefined))
        lastSeenVersion = '1.0.0'

        await maybeShowExtensionUpdateNotification('2.0.0')
        expect(notificationSpy).toHaveBeenCalled()
        expect(openExternalSpy).not.toHaveBeenCalled()
    })

    test('open release notes if clicked', async () => {
        notificationSpy.mockImplementation(() => Promise.resolve('Show Release Notes'))
        lastSeenVersion = '1.0.0'

        await maybeShowExtensionUpdateNotification('2.0.0')
        expect(notificationSpy).toHaveBeenCalled()
        expect(openExternalSpy).toHaveBeenCalled()
    })
})
