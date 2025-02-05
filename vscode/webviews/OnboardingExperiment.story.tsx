import { Meta, StoryObj } from '@storybook/react'

import { NOOP_TELEMETRY_SERVICE } from '@sourcegraph/cody-shared/src/telemetry'

import { LoginSimplified } from './OnboardingExperiment'
import { VSCodeStoryDecorator } from './storybook/VSCodeStoryDecorator'
import { VSCodeWrapper } from './utils/VSCodeApi'

const meta: Meta<typeof LoginSimplified> = {
    title: 'cody/LoginExperiment',
    component: LoginSimplified,
    decorators: [VSCodeStoryDecorator],
}

export default meta

const vscodeAPI: VSCodeWrapper = {
    postMessage: () => {},
    onMessage: () => () => {},
    getState: () => ({}),
    setState: () => {},
}

export const Login: StoryObj<typeof LoginSimplified> = {
    render: () => (
        <div style={{ background: 'rgb(28, 33, 40)' }}>
            <LoginSimplified
                telemetryService={NOOP_TELEMETRY_SERVICE}
                simplifiedLoginRedirect={() => {}}
                vscodeAPI={vscodeAPI}
            />
        </div>
    ),
}
