import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import sonar from "../sonar-controller";

@action({ UUID: "com.stellar.steelseries-sonar-controls.mute-channel" })
export class SonarControls extends SingletonAction<SonarSettings> {
    private readonly sonarInstance = new sonar();

    override async onKeyDown(ev: KeyDownEvent<SonarSettings>): Promise<void> {
        streamDeck.logger.info(`Muting channel: ${ev.payload.settings.selectedChannel}`);
        await this.sonarInstance.muteChannel(ev.payload.settings.selectedChannel, false); 
    }

    override onDidReceiveSettings(ev: DidReceiveSettingsEvent<SonarSettings>): Promise<void> | void {
        streamDeck.logger.info(`Received settings: ${JSON.stringify(ev.payload.settings)}`);
    }
}

/**
 * Settings for {@link SonarControls}.
 */
type SonarSettings = {
    selectedChannel: string;
};