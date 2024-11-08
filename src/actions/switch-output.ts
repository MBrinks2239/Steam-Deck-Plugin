import streamDeck, { action, JsonValue, KeyDownEvent, SendToPluginEvent, SingletonAction, } from "@elgato/streamdeck";
import sonar from "../sonar-controller";

@action({ UUID: "com.stellar.steelseries-sonar-controls.switch-output" })
export class SwitchOutput extends SingletonAction<SwitchOutputSettings> {
    private readonly sonarInstance = new sonar();

    public outputs = ["test", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10"];

    override async onKeyDown(ev: KeyDownEvent<SwitchOutputSettings>): Promise<void> {
        const channel = ev.payload.settings.channelToChange;
        const output = ev.payload.settings.outputToChangeTo;
        await this.sonarInstance.switchOutput(channel, output);
    }

    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, SwitchOutputSettings>): Promise<void> {
        const outputs = await this.sonarInstance.getAudioDevices();
        const options = outputs.filter((output) => (output.dataFlow == "render" && output.role=="none")).map((output) => ({ label: output.friendlyName, value: output.id }));

        streamDeck.ui.current?.sendToPropertyInspector({ event: "getOutputs", items: options });
    } 
}

/**
 * Settings for {@link SwitchOutput}.
 */
type SwitchOutputSettings = {
    channelToChange: string;
    outputToChangeTo: string;
};